import { Suspense } from "react";
import ResetPasswordPage from "./ResetPage";

function ResetPasswordWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}

export default ResetPasswordWrapper;
