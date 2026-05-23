import { Suspense } from "react";
import VerifySuccessContent from "./verify-success-content";

export default function VerifySuccessPage() {
  return (
    <Suspense>
      <VerifySuccessContent />
    </Suspense>
  );
}
