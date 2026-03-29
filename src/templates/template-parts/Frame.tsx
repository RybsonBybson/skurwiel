export default function Frame() {
  return (
    <div id="frame" data-tauri-drag-region>
      <div className="flex items-center h-full w-1/3 justify-start"></div> {/* LEFT */}
      <div className="flex items-center h-full w-1/3 justify-center"></div> {/* CENTER */}
      <div className="flex items-center h-full w-1/3 justify-end"></div> {/* RIGHT */}
    </div>
  );
}
