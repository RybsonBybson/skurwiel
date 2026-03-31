import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./css/index.css";
import Frame from "./templates/Frame";
import { CommandMenu } from "./templates/template-parts/CommandMenu";
import { Content } from "./templates/Content";
import { useEffect } from "react";
import { getCurrentWindow, Theme } from "@tauri-apps/api/window";
import { commands } from "./hooks/commands";
import { useThemeStore } from "./store/useThemeStore";
import Conversation from "./templates/pages/Conversation";

function Main() {
  const setTheme = useThemeStore((state) => state.setTheme);

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
    };

    setupTheme();
    setup();
  }, []);

  return (
    <BrowserRouter>
      <CommandMenu />
      <Toaster position="top-right" />
      <Frame />
      <Content>
        <Routes>
          <Route path="/" element={<Conversation />} />
          <Route path="/:id" element={<Conversation />} />
        </Routes>
      </Content>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Main />,
);
