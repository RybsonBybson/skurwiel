import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { commands } from "@/hooks/commands";
import { PlusCircle } from "lucide-react";
import React from "react";

export function Content({ children }: { children: React.ReactNode }) {
  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="w-full h-full"
      id="content"
    >
      <ResizablePanel defaultSize="15%" maxSize="20%" minSize="10%">
        <div className="flex flex-col h-full gap-1 items-center p-1 *:w-full *:flex *:justify-start overflow-hidden">
          <Button
            variant={"ghost"}
            size={"lg"}
            onClick={commands.get("chat:new")?.action}
          >
            <PlusCircle /> New Chat
          </Button>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="75%">
        <div className="flex justify-center h-full p-6">{children}</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
