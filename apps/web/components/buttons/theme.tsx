"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "lucide-react";

export function ModeToggle() {
  const { setTheme } = useTheme();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative inline-block text-left">
      {/* Trigger */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-8 w-8 items-center justify-center"
      >
        <SunIcon className="h-[1.2rem] w-[1.2rem] transition-all dark:scale-0 dark:-rotate-90" />
        <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        <span className="sr-only">Toggle theme</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-32 rounded-md border bg-white shadow-md dark:bg-black">
          <button
            onClick={() => {
              setTheme("light");
              setOpen(false);
            }}
            className="block w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Light
          </button>

          <button
            onClick={() => {
              setTheme("dark");
              setOpen(false);
            }}
            className="block w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Dark
          </button>

          <button
            onClick={() => {
              setTheme("system");
              setOpen(false);
            }}
            className="block w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            System
          </button>
        </div>
      )}
    </div>
  );
}
