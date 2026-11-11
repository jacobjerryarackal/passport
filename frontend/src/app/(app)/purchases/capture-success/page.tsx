import { Suspense } from "react";
import CaptureSuccessClient from "./CaptureSuccessClient";

export default function CaptureSuccessPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-white">Loading...</div>}>
      <CaptureSuccessClient />
    </Suspense>
  );
}
