"use client";

import Link from "next/link";
import { useWindowManager } from "./windowManager";
import { ROOT } from "./fileSystem";

type Props = { onClose: () => void };

/**
 * Simplified XP Start menu. Two columns: pinned apps (left) + system (right).
 * Any click inside the menu that isn't a shortcut close it via bubbling.
 */
export default function StartMenu({ onClose }: Props) {
  const { dispatch } = useWindowManager();

  const openFolder = (path: string, title: string) => {
    dispatch({ type: "OPEN", appId: "explorer", title, payload: { path } });
    onClose();
  };
  const openText = (path: string, title: string) => {
    dispatch({ type: "OPEN", appId: "notepad", title, payload: { path } });
    onClose();
  };
  const openAbout = () => {
    dispatch({ type: "OPEN", appId: "about-computer", title: "System Properties" });
    onClose();
  };

  return (
    <div
      className="fixed bottom-[40px] left-0 z-[9999] flex flex-col shadow-[3px_-3px_10px_rgba(0,0,0,0.35)]"
      style={{
        width: 320,
        border: "2px solid #003ba2",
        borderBottom: "none",
        background: "#eeeeee",
        fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-2 flex items-center gap-2 text-white"
        style={{
          background: "linear-gradient(to bottom, #2c78e0 0%, #1a4fa1 100%)",
          borderBottom: "2px solid #ffb000",
        }}
      >
        <div
          className="w-8 h-8 flex items-center justify-center"
          style={{ background: "#ffe28a", border: "1px solid #c8a12b", borderRadius: 3 }}
        >
          <span style={{ color: "#8a6a12", fontSize: 16, fontWeight: 700 }}>NJ</span>
        </div>
        <span className="text-[13px] font-bold" style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.4)" }}>
          visitor
        </span>
      </div>

      {/* Body: pinned + system columns */}
      <div className="flex text-[11px]">
        <ul className="flex-1 p-2 flex flex-col gap-0.5">
          <MenuItem onClick={() => openFolder(`${ROOT.path}/Projects`, "Projects")} label="Projects" hint="Folder" />
          <MenuItem onClick={() => openFolder(`${ROOT.path}/Photos`, "Photos")} label="Photos" hint="Folder" />
          <MenuItem onClick={() => openText(`${ROOT.path}/Resume.txt`, "Resume.txt")} label="Resume" hint="Text file" />
          <MenuItem onClick={() => openText(`${ROOT.path}/About.txt`, "About.txt")} label="About Me" hint="Text file" />
          <MenuItem onClick={() => openText(`${ROOT.path}/README.txt`, "README.txt")} label="README" hint="Text file" />
        </ul>
        <ul className="w-[130px] p-2 flex flex-col gap-0.5" style={{ background: "#d3e4fd" }}>
          <MenuItem onClick={() => openFolder(ROOT.path, "My Computer")} label="My Computer" />
          <MenuItem onClick={openAbout} label="System Info" />
          <li className="my-1 border-t" style={{ borderColor: "#a7a7a7" }} />
          <li>
            <Link
              href="/"
              className="flex items-center justify-between px-2 py-1 rounded hover:bg-[#316ac5] hover:text-white"
              style={{ color: "#111" }}
            >
              <span>Log Off</span>
              <span className="text-[9px] text-gray-500">Exit</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

function MenuItem({ label, hint, onClick }: { label: string; hint?: string; onClick?: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left px-2 py-1 rounded hover:bg-[#316ac5] hover:text-white flex items-center justify-between"
      >
        <span>{label}</span>
        {hint ? <span className="text-[9px] text-gray-500 group-hover:text-white/80">{hint}</span> : null}
      </button>
    </li>
  );
}
