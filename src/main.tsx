import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import {
  BrowserRouter,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./css/index.css";
import Frame from "./templates/Frame";
import { CommandMenu } from "./templates/template-parts/CommandMenu";
import { Content } from "./templates/Content";
import { useEffect } from "react";
import { getCurrentWindow, Theme } from "@tauri-apps/api/window";
import { commands } from "./hooks/commands";
import { useThemeStore } from "./store/useThemeStore";
import Conversation from "./templates/pages/Conversation";
import { setNavigate } from "./hooks/jump";
import { useHistoryStore } from "./store/useHistoryStore";

function Main() {
  const setTheme = useThemeStore((state) => state.setTheme);
  const nav = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const setupTheme = async () => {
      const cw = getCurrentWindow();

      const theme: Theme =
        (localStorage.getItem("theme") as Theme) ??
        (await cw.theme()) ??
        "light";
      setTheme(theme);
    };

    const setup = () => {
      commands.forEach((val) => {
        window.addEventListener("keydown", (ev) => {
          if (
            val.shortcut?.ctrl === ev.ctrlKey &&
            val.shortcut.key.toLowerCase() === ev.key.toLowerCase()
          )
            val.action();
        });
      });

      // Wyłącz right-click context menu i devtools
      document.addEventListener("contextmenu", (e) => e.preventDefault());
      document.addEventListener("keydown", (e) => {
        // F12 - devtools
        if (e.key === "F12") e.preventDefault();
        // Ctrl+Shift+I - inspect element
        if (e.ctrlKey && e.shiftKey && e.key === "I") e.preventDefault();
        // Ctrl+Shift+C - inspect element (alternative)
        if (e.ctrlKey && e.shiftKey && e.key === "C") e.preventDefault();
        // Ctrl+Shift+J - console
        if (e.ctrlKey && e.shiftKey && e.key === "J") e.preventDefault();
        // Ctrl+P - print
        if (e.ctrlKey && e.key === "p") e.preventDefault();
        // Ctrl+S - save
        if (e.ctrlKey && e.key === "s") e.preventDefault();
        // Ctrl+O - open
        if (e.ctrlKey && e.key === "o") e.preventDefault();
        // Ctrl+N - new window
        if (e.ctrlKey && e.key === "n") e.preventDefault();
        // Ctrl+W - close tab
        if (e.ctrlKey && e.key === "w") e.preventDefault();
        // Ctrl+T - new tab
        if (e.ctrlKey && e.key === "t") e.preventDefault();
      });
    };

    setNavigate(nav);
    setupTheme();
    setup();
  }, [nav]);

  // Śledź zmiany ścieżki i aktualizuj historię
  useEffect(() => {
    const { add } = useHistoryStore.getState();
    add(location.pathname);
  }, [location.pathname]);

  return (
    <>
      <CommandMenu />
      <Toaster position="top-right" />
      <Frame />
      <Content>
        <Routes>
          <Route path="/" element={<Conversation />} />
          <Route path="/:id" element={<Conversation />} />
        </Routes>
      </Content>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <Main />
  </BrowserRouter>,
);
