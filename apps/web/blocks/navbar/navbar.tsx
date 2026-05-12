"use client";

import Image from "next/image";

export function Navbar() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <div className="relative w-full max-w-6xl">
        <svg
          className="absolute inset-0 h-14 w-full"
          viewBox="0 0 1152 56"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 1152,28 C 1152,9 1148,4 1140,1.5 C 1133,0 1125,0 1116,0 L 36,0 C 27,0 19,0 12,1.5 C 4,4 0,9 0,28 C 0,47 4,52 12,54.5 C 19,56 27,56 36,56 L 1116,56 C 1125,56 1133,56 1140,54.5 C 1148,52 1152,47 1152,28 Z"
            fill="#19324D"
          />
        </svg>

        <div className="relative z-10 flex h-14 items-center px-6 md:px-8">
          <Image
            src="/images/logotype-0.png"
            alt="Scholaid"
            width={120}
            height={32}
            className="object-contain"
            priority
          />
        </div>
      </div>
    </nav>
  );
}
