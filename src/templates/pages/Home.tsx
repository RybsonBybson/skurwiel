import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { Plus } from "lucide-react";

export default function Home() {
  return (
    <div className="w-2/3 h-full flex justify-center items-center flex-col">
      <h1 className="text-4xl font-serif mb-8">Welcome</h1>
      <InputGroup>
        <InputGroupTextarea id="block-end-textarea" placeholder="Write something..." className="max-h-64" />
        <InputGroupAddon align="block-end">
          <InputGroupButton variant="ghost" size="sm">
            <Plus />
          </InputGroupButton>
          <InputGroupButton variant="default" size="sm" className="ml-auto">
            Post
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
