"use client";

import { useTrash } from "../trashContext";

/**
 * Recycle Bin viewer. Lists trashed desktop icons; a Restore button on each
 * item puts it back on the desktop. Nothing is ever permanently deleted —
 * closing this window just leaves items in the trash.
 */
export default function Trash() {
  const { items, restore, restoreAll } = useTrash();

  return (
    <div className="w-full h-full flex flex-col" style={{ background: "#ffffff" }}>
      {/* Fake toolbar */}
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

      {/*
        Action bar — sits below the fake menu, contains the real "Restore all"
        affordance. Only rendered when there's something to restore so an
        empty bin doesn't advertise a no-op button.
      */}
      {items.length > 0 ? (
        <div
          className="flex items-center gap-2 px-2 py-1 border-b"
          style={{ borderColor: "#c7c7c7", background: "#f7f7f7" }}
        >
          <button
            type="button"
            onClick={restoreAll}
            className="px-2 py-0.5 text-[11px] hover:bg-[#316ac5] hover:text-white"
            style={{
              border: "1px solid #7f7f7f",
              borderRadius: 3,
              background: "linear-gradient(to bottom, #ffffff, #d6d6d6)",
            }}
          >
            Restore all items
          </button>
          <span className="text-[10px] text-gray-600 italic">
            Puts every trashed icon back on the desktop.
          </span>
        </div>
      ) : null}

      <div className="flex-1 overflow-auto p-3">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-[11px] text-gray-600">
            <TrashEmptyGraphic />
            <p>Recycle Bin is empty.</p>
            <p className="text-[10px] text-gray-500 italic">
              Drag icons from the desktop here to trash them.
            </p>
          </div>
        ) : (
          <ul className="grid gap-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 px-2 py-1.5 border rounded"
                style={{ borderColor: "#c7c7c7", background: "#fafafa" }}
              >
                <div className="w-[36px] h-[36px] flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <span className="flex-1 truncate" style={{ fontSize: 11, color: "#111" }}>
                  {item.label}
                </span>
                <button
                  type="button"
                  onClick={() => restore(item.id)}
                  className="px-2 py-0.5 text-[11px] hover:bg-[#316ac5] hover:text-white"
                  style={{
                    border: "1px solid #7f7f7f",
                    borderRadius: 3,
                    background: "linear-gradient(to bottom, #ffffff, #d6d6d6)",
                  }}
                >
                  Restore
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Status bar */}
      <div
        className="px-2 h-[20px] flex items-center text-[10px] text-gray-700 border-t"
        style={{ background: "#ece9d8", borderColor: "#a7a7a7" }}
      >
        {items.length} object{items.length === 1 ? "" : "s"}
      </div>
    </div>
  );
}

function TrashEmptyGraphic() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <rect x="14" y="18" width="36" height="38" rx="2" fill="#cfd8dc" stroke="#5a6266" strokeWidth="1.5" />
      <rect x="10" y="14" width="44" height="6" rx="1.5" fill="#e0e6e8" stroke="#5a6266" strokeWidth="1.5" />
      <rect x="26" y="10" width="12" height="4" rx="1" fill="#c2ccd1" stroke="#5a6266" strokeWidth="1.5" />
      {[22, 30, 38].map((x) => (
        <line key={x} x1={x} y1={24} x2={x} y2={50} stroke="#8a969b" strokeWidth="1.5" />
      ))}
    </svg>
  );
}
