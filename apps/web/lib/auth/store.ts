// @/lib/auth/store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ScholaidUser } from "@/lib/auth/types";

interface AuthStore {
  user: ScholaidUser | null;
  token: string | null;
  setAuth: (user: ScholaidUser, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      clearAuth: () => set({ user: null, token: null }),
    }),
    { name: "scholaid-auth" }, // persists to localStorage
  ),
);
