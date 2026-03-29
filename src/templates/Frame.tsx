import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Copy, Minus, Moon, Pin, Square, Sun, X } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useState } from "react";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { useHistoryStore } from "@/store/useHistoryStore";
import { useShallow } from "zustand/react/shallow";
import SearchAll from "./template-parts/SearchAll";
import { useThemeStore } from "@/store/useThemeStore";

function FrameLeft() {
  const cw = getCurrentWindow();
  const [onTop, setOnTop] = useState(false);
  const { forward, back, decrementCurrent, incrementCurrent } = useHistoryStore(
    useShallow((state) => ({
      routes: state.routes,
      back: state.back,
      forward: state.forward,
      decrementCurrent: state.decrementCurrent,
      incrementCurrent: state.incrementCurrent,
    })),
  );
  const { theme, setTheme } = useThemeStore(
    useShallow((state) => ({
      skin: state.skin,
      theme: state.theme,
      setSkin: state.setSkin,
      setTheme: state.setTheme,
    })),
  );
  const navigate = useAppNavigate();
  const goforward = () => {
    if (!forward) return;
    navigate(forward, false);
    incrementCurrent();
  };
  const goback = () => {
    if (!back) return;
    navigate(back, false);
    decrementCurrent();
  };
  const pin = async () => {
    const isAlwaysOnTop = await cw.isAlwaysOnTop();
    await cw.setAlwaysOnTop(!isAlwaysOnTop);
    setOnTop(!isAlwaysOnTop);
  };

  return (
    <div className="justify-start">
      <Button variant={"ghost"} onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        {theme === "dark" && <Sun />}
        {theme === "light" && <Moon />}
      </Button>
      <Button variant={"ghost"} onClick={pin}>
        <Pin fill={onTop ? "currentColor" : "none"} />
      </Button>
      <Button variant={"ghost"} disabled={back === null} onClick={goback}>
        <ArrowLeft />
      </Button>
      <Button variant={"ghost"} disabled={forward === null} onClick={goforward}>
        <ArrowRight />
      </Button>
    </div>
  );
}

function FrameCenter() {
  return (
    <div className="justify-center">
      <SearchAll />
    </div>
  );
}

function FrameRight() {
  const cw = getCurrentWindow();
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    const handleResize = async () => setMaximized(await cw.isMaximized());
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="justify-end *:h-full *:aspect-square *:rounded-none *:border-0 *:p-4">
      <Button variant={"ghost"} onClick={() => cw.minimize()}>
        <Minus />
      </Button>
      <Button variant={"ghost"} onClick={() => (maximized ? cw.unmaximize() : cw.maximize())}>
        {maximized && <Copy className="scale-x-[-1]" />}
        {!maximized && <Square />}
      </Button>
      <Button variant={"ghost"} onClick={() => cw.close()} className="hover:bg-rose-600!">
        <X />
      </Button>
    </div>
  );
}

export default function Frame() {
  return (
    <div id="frame" data-tauri-drag-region>
      <FrameLeft />
      <FrameCenter />
      <FrameRight />
    </div>
  );
}
