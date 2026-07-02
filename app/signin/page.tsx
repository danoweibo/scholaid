"use client";

import { useState } from "react";
import Image from "next/image";
import { LoginForm } from "@/components/shadcn/login-form";

export default function LoginPage() {
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <Image
              src="/images/logotype-1.png"
              alt="scholaid"
              width={120}
              height={30}
              className="h-auto w-30 object-contain"
              priority
            />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Right panel — video with shimmer fallback */}
      <div className="bg-muted relative hidden overflow-hidden lg:block">
        {/* Shimmer overlay — visible until video is ready */}
        {!videoLoaded && (
          <div className="bg-muted absolute inset-0 z-10 overflow-hidden">
            <div
              className="absolute inset-0 -translate-x-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)",
                animation: "shimmer 1.5s linear infinite",
              }}
            />
          </div>
        )}

        {/* Video — 720×720, centered, covers the panel */}
        <video
          src="/visuals/square.mp4"
          autoPlay
          loop
          muted
          playsInline
          width={720}
          height={720}
          onCanPlay={() => setVideoLoaded(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            videoLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
    </div>
  );
}
