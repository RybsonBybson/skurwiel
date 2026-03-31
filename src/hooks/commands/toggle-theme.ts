import { useThemeStore } from "@/store/useThemeStore";

export const toggleTheme = () => {
  const { setTheme, theme } = useThemeStore.getState();

  setTheme(theme === "light" ? "dark" : "light");
};
