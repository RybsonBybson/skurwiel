import { useHistoryStore } from "@/store/useHistoryStore";
import { redirect } from "react-router-dom";

export const jump = (to: string, history: boolean = true) => {
  redirect(to);
  if (!history) return;
  const { add, current, slice } = useHistoryStore.getState();

  slice(0, current);
  add(to);
};
