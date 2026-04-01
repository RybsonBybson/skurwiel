import { useHistoryStore } from "@/store/useHistoryStore";
import { jump } from "../jump";

export const goforward = () => {
  const { forward, incrementCurrent } = useHistoryStore.getState();
  if (!forward) return;
  incrementCurrent();
  jump(forward);
};

export const goback = () => {
  const { back, decrementCurrent } = useHistoryStore.getState();
  if (!back) return;
  decrementCurrent();
  jump(back);
};
