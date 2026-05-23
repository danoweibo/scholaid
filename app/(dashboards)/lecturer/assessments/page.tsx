import AssessmentsPage from "./assessments-page"; // move everything to this file
import { Suspense } from "react";

export default function AssessmentPageWrapper() {
  return (
    <Suspense>
      <AssessmentsPage />
    </Suspense>
  );
}
