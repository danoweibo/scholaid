// @/lib/auth/store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ScholaidUser } from "@/lib/auth/types";

const TOKEN_KEY = "scholaid_token";

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
      setAuth: (user, token) => {
        // Keep localStorage in sync so authClient's Bearer getter always has
        // the latest token, even after a hard refresh where the store
        // rehydrates from its own persisted key.
        localStorage.setItem(TOKEN_KEY, token);
        set({ user, token });
      },
      clearAuth: () => {
        localStorage.removeItem(TOKEN_KEY);
        set({ user: null, token: null });
      },
    }),
    { name: "scholaid-auth" },
  ),
);

/**
 * Call once at app startup (e.g. in a top-level layout) to re-sync the token
 * from the persisted Zustand store into the bare localStorage key that
 * authClient reads. Handles the case where the store has rehydrated but
 * "scholaid_token" was somehow cleared independently.
 */
export function syncTokenFromStore() {
  const token = useAuthStore.getState().token;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}
