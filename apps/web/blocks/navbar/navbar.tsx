// apps/web/blocks/navbar/navbar.tsx
"use client";

import Link from "next/link";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

const RECTIRCLE_PATH =
  "M 100%,50% C 100%,17% 98.4%,7% 97.7%,2.7% C 96.9%,0 95.3%,0 93.8%,0 L 6.3%,0 C 4.7%,0 3.1%,0 2.3%,2.7% C 1.6%,7% 0,17% 0,50% C 0,83% 1.6%,93% 2.3%,97.3% C 3.1%,100% 4.7%,100% 6.3%,100% L 93.8%,100% C 95.3%,100% 96.9%,100% 97.7%,97.3% C 98.4%,93% 100%,83% 100%,50% Z";

export function Navbar() {
  return (
    <nav className="relative h-14 w-full" aria-label="Main navigation">
      {/* Rectircle background */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 640 56"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M 640,28 C 640,9.5 635,4 625,1.5 C 618,0 610,0 600,0 L 40,0 C 30,0 22,0 15,1.5 C 5,4 0,9.5 0,28 C 0,46.5 5,52 15,54.5 C 22,56 30,56 40,56 L 600,56 C 610,56 618,56 625,54.5 C 635,52 640,46.5 640,28 Z"
          fill="#19324D"
        />
        {/* Subtle inner rim */}
        <path
          d="M 640,28 C 640,9.5 635,4 625,1.5 C 618,0 610,0 600,0 L 40,0 C 30,0 22,0 15,1.5 C 5,4 0,9.5 0,28 C 0,46.5 5,52 15,54.5 C 22,56 30,56 40,56 L 600,56 C 610,56 618,56 625,54.5 C 635,52 640,46.5 640,28 Z"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
      </svg>

      {/* Content layer */}
      <div className="relative z-10 flex h-full items-center px-7">
        {/* Logo */}
        <Link
          href="/"
          className="mr-6 shrink-0 text-[15px] font-semibold tracking-tight text-white"
        >
          Acme
        </Link>

        {/* Nav links */}
        <ul className="flex flex-1 items-center gap-1" role="list">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                className="rounded-md px-3 py-1.5 text-[13px] font-medium text-white/65 transition-colors duration-150 hover:bg-white/10 hover:text-white/95 data-[active]:bg-white/[0.16] data-[active]:text-white/95"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Auth buttons */}
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/login"
            className="rounded-md bg-white/[0.14] px-4 py-1.5 text-[12.5px] text-white/85 transition-colors duration-150 hover:bg-white/20"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-white px-4 py-1.5 text-[12.5px] font-semibold text-[#b90103] transition-colors duration-150 hover:bg-white/90"
          >
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
}
