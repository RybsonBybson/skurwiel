import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { jump } from "@/hooks/jump";
import { ArrowUp, Plus } from "lucide-react";
import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

export default function Conversation() {
  const { id } = useParams<string>();
  const textarea = useRef<HTMLTextAreaElement | null>(null);
  const send = () => {
    if (!id) jump("/dupa");
  };

  useEffect(() => {
    if (!textarea.current) return;
    const handleSend = (ev: KeyboardEvent) => {
      if (ev.key === "enter") send();
    };

    textarea.current.addEventListener("keydown", handleSend);

    return () => {
      textarea.current?.removeEventListener("keydown", handleSend);
    };
  }, [id]);

  return (
    <div className="w-2/3 h-full flex justify-center items-center flex-col">
      <h1 className="text-4xl font-serif mb-8">Welcome</h1>
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
          <InputGroupButton
            variant="default"
            size="sm"
            className="ml-auto"
            onClick={send}
          >
            <ArrowUp />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
