import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ScholaidUser } from "@/lib/auth/types";

interface AuthStore {
  user: ScholaidUser | null;
  setUser: (user: ScholaidUser) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearAuth: () => set({ user: null }),
    }),
    { name: "scholaid-auth" },
  ),
);
