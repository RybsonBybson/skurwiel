import { NavigateFunction } from "react-router-dom";

let _navigate: NavigateFunction | null = null;

export const setNavigate = (fn: NavigateFunction) => {
  _navigate = fn;
};

const navigate = (to: string) => {
  _navigate?.(to);
};

export const jump = (to: string) => {
  navigate(to);

  // Historia jest zarządzana automatycznie przez useEffect w main.tsx
  // więc nie potrzebujemy dodatkowej logiki tutaj
};
