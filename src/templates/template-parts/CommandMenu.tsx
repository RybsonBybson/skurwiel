"use client";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useCommandMenuStore } from "@/store/useCommandMenuStore";
import { CommandData, commands } from "@/hooks/commands";

export function CommandMenu() {
  const open = useCommandMenuStore((state) => state.open);
  const setOpen = useCommandMenuStore((state) => state.setOpen);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {Object.entries(
            Array.from(commands).reduce(
              (acc: Record<string, CommandData[]>, curr) => {
                if (curr[1].hidden) return acc;
                const key = curr[0].split(":")[0];

                acc[key] = acc[key] ? [...acc[key], curr[1]] : [curr[1]];
                return acc;
              },
              {},
            ),
          ).map((value, index, array) => (
            <>
              <CommandGroup key={index} heading={value[0].toUpperCase()}>
                {value[1].map((v, i) => (
                  <CommandItem
                    key={i}
                    onSelect={() => {
                      setOpen(false);
                      v.action();
                    }}
                  >
                    <v.icon />
                    <span>{v.name}</span>
                    {v.shortcut && (
                      <CommandShortcut>{`${v.shortcut.ctrl ? `⌘ + ${v.shortcut.key}` : v.shortcut.key}`}</CommandShortcut>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
              {index < array.length - 1 && <CommandSeparator />}
            </>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
