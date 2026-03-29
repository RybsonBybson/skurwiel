import { create } from "zustand";

interface CommandMenu {
  open: boolean;
  setOpen: (value: boolean) => void;
}

export const useCommandMenuStore = create<CommandMenu>((set) => ({
  open: false,
  setOpen: (value) => set(() => ({ open: value })),
}));
