"use client";

import { WALLPAPERS, type Wallpaper } from "../wallpapers";

type Props = {
  currentId: string;
  onSelect: (id: string) => void;
};

/**
 * Display Properties. XP-style modal that lets the user pick a wallpaper.
 * Selection is immediate — clicking a thumbnail applies the wallpaper right
 * away, and the parent persists to localStorage. No Apply/OK button because
 * this isn't real Windows and the extra click doesn't help anybody.
 */
export default function DisplayProperties({ currentId, onSelect }: Props) {
  return (
    <div className="w-full h-full flex flex-col" style={{ background: "#ece9d8" }}>
      {/* Fake menu bar to match sibling apps */}
      <div
        className="flex items-center gap-3 px-2 h-[22px] border-b"
        style={{ borderColor: "#a7a7a7", background: "#f0f0f0", fontSize: 11 }}
      >
        {["File", "Edit", "View", "Help"].map((label) => (
          <span key={label} className="cursor-default">
            <span className="underline">{label[0]}</span>
            {label.slice(1)}
          </span>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4">
        <p className="text-[11px] text-gray-800 mb-3">
          Pick a background. Your choice is remembered on this device.
        </p>

        <ul
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}
        >
          {WALLPAPERS.map((w) => (
            <li key={w.id}>
              <WallpaperTile
                wallpaper={w}
                selected={w.id === currentId}
                onClick={() => onSelect(w.id)}
              />
            </li>
          ))}
        </ul>
      </div>

      <div
        className="px-2 h-[20px] flex items-center text-[10px] text-gray-700 border-t"
        style={{ background: "#ece9d8", borderColor: "#a7a7a7" }}
      >
        {WALLPAPERS.length} backgrounds available
      </div>
    </div>
  );
}

function WallpaperTile({
  wallpaper,
  selected,
  onClick,
}: {
  wallpaper: Wallpaper;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex flex-col items-stretch gap-1 p-1 rounded outline-none focus:ring-2 focus:ring-[#316ac5]"
      style={{
        background: selected ? "#316ac5" : "transparent",
        color: selected ? "#ffffff" : "#111",
      }}
      title={wallpaper.label}
    >
      <div
        className="w-full aspect-[4/3] rounded"
        style={{
          background: wallpaper.background,
          // Tiny inner shadow so light thumbnails still have visible edges on
          // the light dialog background.
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.2)",
        }}
      />
      <span className="text-center text-[11px] py-0.5">{wallpaper.label}</span>
    </button>
  );
}
