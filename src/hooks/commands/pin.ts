import { useWindowStore } from "@/store/useWindowStore";
import { getCurrentWindow } from "@tauri-apps/api/window";

export const pin = async () => {
  const cw = getCurrentWindow();
  const { setOnTop } = useWindowStore.getState();

  const isAlwaysOnTop = await cw.isAlwaysOnTop();
  await cw.setAlwaysOnTop(!isAlwaysOnTop);
  setOnTop(!isAlwaysOnTop);
};
