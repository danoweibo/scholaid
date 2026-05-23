import { Suspense } from "react";
import AssessmentsPage from "./assessments-page"; // move everything to this file

export default function AssessmentPageWrapper() {
  return (
    <Suspense>
      <AssessmentsPage />
    </Suspense>
  );
}
