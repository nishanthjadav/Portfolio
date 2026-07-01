"use client";

/**
 * Fake "System Properties" dialog. Pure decoration — sells the retro theme.
 */
export default function AboutComputer() {
  return (
    <div className="w-full h-full p-4 flex gap-4" style={{ background: "#ece9d8" }}>
      <div
        className="w-[80px] h-[80px] flex items-center justify-center shrink-0"
        style={{ border: "2px inset #ffffff", background: "#c0c0c0" }}
      >
        <svg width="52" height="52" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="6" width="44" height="30" fill="#dcdcdc" stroke="#333" />
          <rect x="8" y="10" width="36" height="22" fill="#1e90ff" />
          <rect x="18" y="38" width="16" height="6" fill="#a9a9a9" stroke="#333" />
          <rect x="10" y="44" width="32" height="3" fill="#c0c0c0" stroke="#333" />
        </svg>
      </div>
      <div className="text-[11px] leading-relaxed">
        <p className="font-bold text-[13px] mb-1">nishOS</p>
        <p className="text-gray-700 mb-2">Version 1.0 (Portfolio Edition)</p>
        <p>
          <span className="text-gray-700">Registered to:</span> visitor
        </p>
        <p>
          <span className="text-gray-700">Computer:</span> nishanth-desktop
        </p>
        <p>
          <span className="text-gray-700">CPU:</span> Intel Pentium III
        </p>
        <p>
          <span className="text-gray-700">RAM:</span> 512 MB
        </p>
        <p>
          <span className="text-gray-700">Uptime:</span> since you loaded the page
        </p>

      </div>
    </div>
  );
}
