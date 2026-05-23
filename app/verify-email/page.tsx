import VerifyEmailContent from "./verify-email-content";
import { Suspense } from "react";

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
