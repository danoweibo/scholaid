import { useRouter } from "next/navigation";

/* `better-auth` signout interface. */
export type SignOutOptions = {
  router?: ReturnType<typeof useRouter>;
  redirectTo?: string;
  onSuccess?: () => void;
};
