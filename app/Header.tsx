// app/components/Header.tsx
"use client";

import Image from "next/image";

export default function Header() {
  return (
    <header
      className="
        bg-gradient-to-r from-slate-900 via-slate-800 to-gray-900
        h-24               /* 96 px tall header */
        px-10              /* wider side padding */
        flex items-center
        shadow-md
      "
    >
      {/* optional left‑side content */}

      {/* extra‑large logo pinned right */}
      <Image
        src="/favicon.png"
        alt="Company logo"
        width={200}         /* 96 × 96 px logo */
        height={108}
        className="ml-auto"
        priority
      />
    </header>
  );
}
