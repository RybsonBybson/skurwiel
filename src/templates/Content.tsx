import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { commands } from "@/hooks/commands";
import { PlusCircle, Trash2, Star, MoreHorizontal, Clock } from "lucide-react";
import React, { useState, useEffect } from "react";

import { invoke } from "@tauri-apps/api/core";
import {
  writeTextFile,
  readTextFile,
  BaseDirectory,
} from "@tauri-apps/plugin-fs";
import { useChatbotStore } from "@/store/useChatbotStore";
import { useNavigate } from "react-router-dom";

export function Content({ children }: { children: React.ReactNode }) {
  const chats = useChatbotStore((state) => state.chats);
  const setChats = useChatbotStore((state) => state.setChats);
  const navigate = useNavigate();
  const [favourites, setFavourites] = useState<Set<string>>(new Set());

  const loadChats = () => {
    invoke<{ id: string; title: string }[]>("list_chats").then(setChats);
  };

  const loadFavourites = async () => {
    try {
      const content = await readTextFile("favourites.json", {
        baseDir: BaseDirectory.AppData,
      });
      const favs = JSON.parse(content);
      setFavourites(new Set(favs));
    } catch {
      // Plik nie istnieje lub błąd - zostaw puste
      setFavourites(new Set());
    }
  };

  const saveFavourites = async (newFavs: Set<string>) => {
    try {
      await writeTextFile("favourites.json", JSON.stringify([...newFavs]), {
        baseDir: BaseDirectory.AppData,
      });
      setFavourites(newFavs);
    } catch (error) {
      console.error("Failed to save favourites:", error);
    }
  };

  const toggleFavourite = (id: string) => {
    const newFavs = new Set(favourites);
    if (newFavs.has(id)) {
      newFavs.delete(id);
    } else {
      newFavs.add(id);
    }
    saveFavourites(newFavs);
  };

  const deleteChat = (id: string) => {
    invoke("delete_chat", { id }).then(() => {
      loadChats();
      // Usuń z favourites jeśli był
      if (favourites.has(id)) {
        const newFavs = new Set(favourites);
        newFavs.delete(id);
        saveFavourites(newFavs);
      }
    });
  };

  useEffect(() => {
    loadChats();
    loadFavourites();
  }, []);

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    chatId: string;
  } | null>(null);

  const favouriteChats = chats.filter((chat) => favourites.has(chat.id));
  const recentChats = chats.filter((chat) => !favourites.has(chat.id));

  const ChatItem = ({ chat }: { chat: { id: string; title: string } }) => (
    <div
      className="relative w-full"
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, chatId: chat.id });
      }}
    >
      <div className="flex items-center w-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/${chat.id}`)}
          className="justify-start truncate flex-1 min-w-0 text-left pr-10"
        >
          {chat.title || "New chat"}
        </Button>
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 p-1 h-8 w-8 hover:bg-muted"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavourite(chat.id);
                }}
              >
                <Star
                  className={`w-4 h-4 mr-2 ${favourites.has(chat.id) ? "fill-current" : ""}`}
                />
                {favourites.has(chat.id)
                  ? "Remove from favourites"
                  : "Add to favourites"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat.id);
                }}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const onClickOutside = () => setContextMenu(null);
    window.addEventListener("click", onClickOutside);
    return () => window.removeEventListener("click", onClickOutside);
  }, []);

  return (
    <>
      <ResizablePanelGroup
        orientation="horizontal"
        className="w-full h-full"
        id="content"
      >
        <ResizablePanel defaultSize="15%" maxSize="20%" minSize="10%">
          <div className="flex flex-col h-full gap-1 items-center p-1 *:w-full *:flex *:justify-start overflow-hidden">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => {
                commands.get("chat:new")?.action();
                loadChats();
              }}
            >
              <PlusCircle /> New Chat
            </Button>

            {/* Favourite Chats */}
            {favouriteChats.length > 0 && (
              <div className="w-full flex flex-col">
                <div className="text-xs font-medium text-muted-foreground px-2 py-1 flex items-center gap-2">
                  <Star className="w-3 h-3" />
                  Favourites
                </div>
                <div className="flex flex-col gap-1 w-full">
                  {favouriteChats.map((chat) => (
                    <div key={chat.id} className="px-2">
                      <ChatItem chat={chat} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Chats */}
            <div className="w-full flex flex-col flex-1">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1 flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Recent
              </div>
              <div className="flex flex-col gap-1 w-full overflow-y-auto flex-1">
                {recentChats.map((chat) => (
                  <div key={chat.id} className="px-2">
                    <ChatItem chat={chat} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="75%">
          <div className="flex justify-center h-full p-4">{children}</div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {contextMenu &&
        (() => {
          const menu = contextMenu;
          return (
            <div
              style={{
                position: "fixed",
                left: menu.x,
                top: menu.y,
                zIndex: 999,
              }}
              className="bg-background border border-border rounded-md shadow-md overflow-hidden"
            >
              <div
                className="px-4 py-2 cursor-pointer hover:bg-accent text-sm transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavourite(menu.chatId);
                  setContextMenu(null);
                }}
              >
                {favourites.has(menu.chatId)
                  ? "Remove from favourites"
                  : "Add to favourites"}
              </div>
              <div
                className="px-4 py-2 cursor-pointer hover:bg-destructive hover:text-destructive-foreground text-sm transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(menu.chatId);
                  setContextMenu(null);
                }}
              >
                Delete chat
              </div>
            </div>
          );
        })()}
    </>
  );
}
