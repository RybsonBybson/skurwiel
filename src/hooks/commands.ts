import {
  ArrowLeft,
  ArrowRight,
  LucideProps,
  Pin,
  PlusCircle,
  Sun,
} from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { pin } from "./commands/pin";
import { toggleTheme } from "./commands/toggle-theme";
import { goback, goforward } from "./commands/gobackforward";
import { newChat } from "./commands/newchat";

interface Shortcut {
  key: string;
  ctrl: boolean;
}
type CommandID =
  | "window:toggle-theme"
  | "window:pin"
  | "chat:new"
  | "app:goforward"
  | "app:goback";
export interface CommandData {
  name: string;
  shortcut: Shortcut | null;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  action: () => any;
  hidden?: boolean;
}

export const commands = new Map<CommandID, CommandData>([
  [
    "chat:new",
    {
      icon: PlusCircle,
      name: "New chat",
      shortcut: { ctrl: true, key: "N" },
      action: newChat,
    },
  ],
  [
    "window:toggle-theme",
    {
      icon: Sun,
      name: "Toggle theme",
      shortcut: { ctrl: true, key: "T" },
      action: toggleTheme,
    },
  ],
  [
    "window:pin",
    {
      icon: Pin,
      name: "Pin/Unpin",
      shortcut: { ctrl: true, key: "P" },
      action: pin,
    },
  ],
  [
    "app:goforward",
    {
      icon: ArrowRight,
      name: "Forward",
      shortcut: null,
      action: goforward,
      hidden: true,
    },
  ],
  [
    "app:goback",
    {
      icon: ArrowLeft,
      name: "Back",
      shortcut: null,
      action: goback,
      hidden: true,
    },
  ],
]);


