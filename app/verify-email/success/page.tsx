import VerifySuccessContent from "./verify-success-content";
import { Suspense } from "react";

export default function VerifySuccessPage() {
  return (
    <Suspense>
      <VerifySuccessContent />
    </Suspense>
  );
}
