import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Minus,
  Moon,
  Pin,
  RefreshCw,
  Square,
  Sun,
  X,
} from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useState } from "react";
import { useHistoryStore } from "@/store/useHistoryStore";
import SearchAll from "./template-parts/SearchAll";
import { useThemeStore } from "@/store/useThemeStore";
import { commands } from "@/hooks/commands";
import { useWindowStore } from "@/store/useWindowStore";

function FrameLeft() {
  const theme = useThemeStore((state) => state.theme);
  const forward = useHistoryStore((state) => state.forward);
  const back = useHistoryStore((state) => state.back);
  const onTop = useWindowStore((state) => state.onTop);

  return (
    <div className="justify-start">
      <Button
        variant={"ghost"}
        onClick={commands.get("window:toggle-theme")?.action}
      >
        {theme === "dark" && <Sun />}
        {theme === "light" && <Moon />}
      </Button>
      <Button variant={"ghost"} onClick={commands.get("window:pin")?.action}>
        <Pin fill={onTop ? "currentColor" : "none"} />
      </Button>
      <Button variant={"ghost"} onClick={() => window.location.reload()}>
        <RefreshCw />
      </Button>
      <Button
        variant={"ghost"}
        disabled={back === null}
        onClick={commands.get("app:goback")?.action}
      >
        <ArrowLeft />
      </Button>
      <Button
        variant={"ghost"}
        disabled={forward === null}
        onClick={commands.get("app:goforward")?.action}
      >
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
      <Button
        variant={"ghost"}
        onClick={() => (maximized ? cw.unmaximize() : cw.maximize())}
      >
        {maximized && <Copy className="scale-x-[-1]" />}
        {!maximized && <Square />}
      </Button>
      <Button
        variant={"ghost"}
        onClick={() => cw.close()}
        className="hover:bg-rose-600!"
      >
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
