import { useHistoryStore } from "@/store/useHistoryStore";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

export function useAppNavigate() {
  const navigate = useNavigate();
  const { add, slice, incrementCurrent, current } = useHistoryStore(
    useShallow((state) => ({
      add: state.add,
      slice: state.slice,
      incrementCurrent: state.incrementCurrent,
      current: state.current,
    })),
  );

  return (to: string, history: boolean = true) => {
    navigate(to);
    if (!history) return;
    slice(0, current);
    add(to);
    incrementCurrent();
  };
}
