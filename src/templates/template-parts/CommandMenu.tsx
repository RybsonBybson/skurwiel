"use client";

import { CalculatorIcon, CalendarIcon, CreditCardIcon, SettingsIcon, SmileIcon, UserIcon } from "lucide-react";

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
import { useShallow } from "zustand/react/shallow";

export function CommandMenu() {
  const { open, setOpen } = useCommandMenuStore(
    useShallow((state) => ({
      open: state.open,
      setOpen: state.setOpen,
    })),
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <CalendarIcon />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem>
              <SmileIcon />
              <span>Search Emoji</span>
            </CommandItem>
            <CommandItem>
              <CalculatorIcon />
              <span>Calculator</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <UserIcon />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <CreditCardIcon />
              <span>Billing</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <SettingsIcon />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
