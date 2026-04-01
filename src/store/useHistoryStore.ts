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
  add: (route) =>
    set((state) => {
      const newRoutes = [...state.routes.slice(0, state.current + 1), route];
      const newCurrent = newRoutes.length - 1;
      return {
        routes: newRoutes,
        current: newCurrent,
        forward: null,
        back: newCurrent > 0 ? newRoutes[newCurrent - 1] : null,
      };
    }),
  slice: (from, to) =>
    set((state) => ({ routes: state.routes.slice(from, to) })),
  incrementCurrent: () =>
    set((state) => {
      const newCurrent = Math.min(state.current + 1, state.routes.length - 1);
      return {
        current: newCurrent,
        forward:
          newCurrent < state.routes.length - 1
            ? state.routes[newCurrent + 1]
            : null,
        back: newCurrent > 0 ? state.routes[newCurrent - 1] : null,
      };
    }),
  decrementCurrent: () =>
    set((state) => {
      const newCurrent = Math.max(state.current - 1, 0);
      return {
        current: newCurrent,
        forward:
          newCurrent < state.routes.length - 1
            ? state.routes[newCurrent + 1]
            : null,
        back: newCurrent > 0 ? state.routes[newCurrent - 1] : null,
      };
    }),
  currentRoute: () => {
    const { routes, current } = get();
    return routes[current] ?? "/";
  },
}));
