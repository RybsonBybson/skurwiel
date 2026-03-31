import { create } from "zustand";

interface WindowStore {
  onTop: boolean;
  setOnTop: (onTop: boolean) => void;
}

export const useWindowStore = create<WindowStore>((set) => ({
  onTop: false,
  setOnTop: (onTop) => set(() => ({ onTop: onTop })),
}));
