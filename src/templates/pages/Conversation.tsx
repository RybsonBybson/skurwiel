import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { jump } from "@/hooks/jump";
import { ArrowUp, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { writeTextFile, BaseDirectory, mkdir } from "@tauri-apps/plugin-fs";
import { v4 as uuid } from "uuid";
import { Spinner } from "@/components/ui/spinner";
import { useChatbotStore } from "@/store/useChatbotStore";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Conversation() {
  const { id } = useParams<string>();
  const textarea = useRef<HTMLTextAreaElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const generating = useChatbotStore((state) => state.generating);
  const setGenerating = useChatbotStore((state) => state.setGenerating);
  const history = useChatbotStore((state) => state.history);
  const setHistory = useChatbotStore((state) => state.setHistory);
  const addMessage = useChatbotStore((state) => state.addMessage);
  const setChats = useChatbotStore((state) => state.setChats);

  const sendPendingMessage = async (chatId: string, text: string) => {
    addMessage({ role: "user", content: text });
    if (textarea.current) textarea.current.value = "";
    setGenerating(true);

    // Add empty assistant message for streaming
    addMessage({ role: "assistant", content: "" });

    let unlistenStream: (() => void) | null = null;

    try {
      // Setup stream listener
      unlistenStream = await listen<{ token: string; id: string }>(
        "stream-token",
        (event) => {
          if (event.payload.id === chatId) {
            // Append token to the last assistant message
            const currentHistory = useChatbotStore.getState().history;
            if (currentHistory.length > 0) {
              const lastMsg = currentHistory[currentHistory.length - 1];
              if (lastMsg.role === "assistant") {
                const updatedMsg = {
                  ...lastMsg,
                  content: lastMsg.content + event.payload.token,
                };
                setHistory([...currentHistory.slice(0, -1), updatedMsg]);
              }
            }
          }
        },
      );

      // Send message (will stream tokens via events)
      const reply = await invoke<string>("send_message", { id: chatId, text });

      // Generiuj tytuł z pierwszej wiadomości asystenta
      const chatHistory = useChatbotStore.getState().history;
      if (chatHistory.filter((m) => m.role === "user").length === 1) {
        const title = reply.substring(0, 150).trim();
        invoke("update_chat_title", { id: chatId, title });
      }
    } finally {
      setGenerating(false);
      if (unlistenStream) {
        unlistenStream();
      }
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  useEffect(() => {
    if (!textarea.current) return;
    textarea.current.value = "";
    textarea.current.focus();
    setHistory([]);

    if (id && pendingMessage) {
      // Send pending message first, then load chat
      sendPendingMessage(id, pendingMessage).then(() => {
        setPendingMessage(null);
      });
    } else if (id) {
      // Load existing chat
      invoke<{
        title: string;
        history: { role: "user" | "assistant"; content: string }[];
      }>("load_chat", { id }).then((chat) => {
        setHistory(chat.history);
      });
    }

    const handleSend = (ev: KeyboardEvent) => {
      if (ev.key === "Enter" && !ev.shiftKey && !ev.ctrlKey && !ev.altKey)
        send();
    };
    textarea.current.addEventListener("keydown", handleSend);
    return () => textarea.current?.removeEventListener("keydown", handleSend);
  }, [id]);

  const send = async () => {
    if (!textarea.current || generating) return;
    const text = textarea.current.value.trim();
    if (!text) return;

    let chatId = id;

    if (!chatId) {
      chatId = uuid();
      await mkdir("chats", { baseDir: BaseDirectory.AppData, recursive: true });
      await writeTextFile(
        `chats/${chatId}.jsonl`,
        JSON.stringify({ title: "", history: [] }),
        { baseDir: BaseDirectory.AppData },
      );
      invoke<{ id: string; title: string }[]>("list_chats").then(setChats);
      setPendingMessage(text);
      textarea.current.value = "";
      jump(`/${chatId}`);
      return;
    }

    await sendPendingMessage(chatId, text);
  };

  return (
    <div className="w-2/3 h-full flex flex-col py-4 mx-auto">
      {/* Historia */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-4 pr-2">
        {history.length === 0 && !id && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-accent/10 to-primary/10">
                <img
                  src="./logo.svg"
                  className="w-20 h-20 text-accent drop-shadow-lg"
                  style={{
                    filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))",
                  }}
                />
              </div>
              <h1 className="text-4xl font-serif text-muted-foreground text-center">
                What's on your mind?
              </h1>
            </div>
          </div>
        )}
        {history.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[70%] rounded-2xl px-4 py-2 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm",
              )}
              style={{
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            >
              <div className="prose-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-lg font-bold mb-2">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-base font-bold mb-2">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-sm font-bold mb-1">{children}</h3>
                    ),
                    p: ({ children }) => <p className="mb-2">{children}</p>,
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-2">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside mb-2">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    code: ({ children }) => (
                      <code className="bg-black/20 px-2 py-1 rounded text-xs font-mono">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-black/20 p-2 rounded mb-2 overflow-x-auto text-xs">
                        {children}
                      </pre>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-current pl-2 italic opacity-75">
                        {children}
                      </blockquote>
                    ),
                    a: ({ children, href }) => (
                      <a href={href} className="underline hover:opacity-75">
                        {children}
                      </a>
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {generating && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2">
              <Spinner className="w-4 h-4" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="w-full">
        <InputGroup>
          <InputGroupTextarea
            placeholder="Write something..."
            className="max-h-64"
            ref={textarea}
          />
          <InputGroupAddon align="block-end">
            <InputGroupButton variant="ghost" size="sm">
              <Plus />
            </InputGroupButton>
            {generating ? (
              <InputGroupButton
                variant="default"
                size="sm"
                className="ml-auto bg-secondary"
              >
                <Spinner />
              </InputGroupButton>
            ) : (
              <InputGroupButton
                variant="default"
                size="sm"
                className="ml-auto"
                onClick={send}
              >
                <ArrowUp />
              </InputGroupButton>
            )}
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
}
