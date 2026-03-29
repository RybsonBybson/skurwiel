import { Theme } from "@tauri-apps/api/window";
import { create } from "zustand";

const root = document.querySelector("html") as HTMLElement;

interface ThemeManager {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeManager>((set, get) => ({
  theme: "light",
  setTheme: (theme) => {
    root.classList.remove(get().theme);
    root.classList.add(theme);
    localStorage.setItem("theme", theme);

    set(() => ({ theme: theme }));
  },
}));
