import { useChatbotStore } from "@/store/useChatbotStore";
import { jump } from "../jump";

export const newChat = () => {
  const { setGenerating } = useChatbotStore.getState();
  setGenerating(false);
  jump("/");
};
