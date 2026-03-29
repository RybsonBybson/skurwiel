import { create } from "zustand";

type HistoryRoute = string;

interface History {
  routes: HistoryRoute[];
  forward: HistoryRoute | null;
  back: HistoryRoute | null;
  current: number;
  incrementCurrent: () => void;
  decrementCurrent: () => void;
  currentRoute: () => HistoryRoute;
  add: (route: HistoryRoute) => void;
  slice: (from: number, to: number) => void;
}

export const useHistoryStore = create<History>((set, get) => ({
  routes: ["/"],
  forward: null,
  back: null,
  current: 0,
  add: (route) => set((state) => ({ routes: [...state.routes, route] })),
  slice: (from, to) => set((state) => ({ routes: state.routes.slice(from, to) })),
  incrementCurrent: () =>
    set((state) => ({
      current: Math.min(state.current + 1, state.routes.length - 1),
      forward: state.routes[state.current + 1] ?? null,
      back: state.routes[state.current - 1] ?? null,
    })),
  decrementCurrent: () =>
    set((state) => ({
      current: Math.max(state.current - 1, 0),
      forward: state.routes[state.current + 1] ?? null,
      back: state.routes[state.current - 1] ?? null,
    })),
  currentRoute: () => {
    const { routes, current } = get();
    return routes[current] ?? "/";
  },
}));
