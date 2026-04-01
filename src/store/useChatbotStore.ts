import { create } from "zustand";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatMeta {
  id: string;
  title: string;
}

interface ChatbotStore {
  generating: boolean;
  setGenerating: (generating: boolean) => void;
  history: Message[];
  setHistory: (history: Message[]) => void;
  addMessage: (message: Message) => void;
  chats: ChatMeta[];
  setChats: (chats: ChatMeta[]) => void;
}

export const useChatbotStore = create<ChatbotStore>((set) => ({
  generating: false,
  setGenerating: (generating) => set({ generating }),
  history: [],
  setHistory: (history) => set({ history }),
  addMessage: (message) =>
    set((state) => ({ history: [...state.history, message] })),
  chats: [],
  setChats: (chats) => set({ chats }),
}));
