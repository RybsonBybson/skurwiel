import { Search } from "lucide-react";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useCommandMenuStore } from "@/store/useCommandMenuStore";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

export default function SearchAll() {
  const { open, setOpen } = useCommandMenuStore(
    useShallow((state) => ({
      open: state.open,
      setOpen: state.setOpen,
    })),
  );

  useEffect(() => {
    const handleShortcut = (ev: KeyboardEvent) => {
      if (ev.ctrlKey && ev.key === "f") {
        ev.preventDefault();
        setOpen(!open);
      }
    };

    window.addEventListener("keydown", handleShortcut);

    return () => {
      window.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  return (
    <InputGroup className="max-w-xs pointer-events-auto" onClick={() => setOpen(true)}>
      <InputGroupAddon align={"inline-start"}>
        <Search />
      </InputGroupAddon>
      <InputGroupAddon className="w-full text-start">
        <span>Search...</span>
      </InputGroupAddon>
      <InputGroupAddon align={"inline-end"}>
        <KbdGroup>
          <Kbd>⌘</Kbd>+<Kbd>F</Kbd>
        </KbdGroup>
      </InputGroupAddon>
    </InputGroup>
  );
}
