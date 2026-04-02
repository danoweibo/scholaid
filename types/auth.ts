import { useRouter } from "next/navigation";

export type SignOutOptions = {
  router?: ReturnType<typeof useRouter>;
  redirectTo?: string;
  onSuccess?: () => void;
};
