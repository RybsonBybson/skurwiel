import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./css/index.css";
import Frame from "./templates/Frame";
import { CommandMenu } from "./templates/template-parts/CommandMenu";
import { useThemeStore } from "./store/useThemeStore";
import { useShallow } from "zustand/react/shallow";
import { useEffect } from "react";
import { getCurrentWindow, Theme } from "@tauri-apps/api/window";
import { Content } from "./templates/Content";
import Home from "./templates/pages/home";

function Main() {
  const { setTheme } = useThemeStore(
    useShallow((state) => ({
      setTheme: state.setTheme,
    })),
  );
  const cw = getCurrentWindow();

  useEffect(() => {
    const themeSetup = async () => {
      const theme: Theme = (localStorage.getItem("theme") as Theme) ?? (await cw.theme()) ?? "light";
      setTheme(theme);
    };

    themeSetup();
  }, []);

  return (
    <BrowserRouter>
      <CommandMenu />
      <Toaster position="top-right" />
      <Frame />
      <Content>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Content>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<Main />);
