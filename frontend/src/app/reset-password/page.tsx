import { Suspense } from "react";
import ResponsiveNav from "@/components/layout/ResponsiveNav";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <ResponsiveNav title="Reset Password">
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="w-full max-w-md">
          <Suspense fallback={<div className="animate-pulse text-slate-400 text-center py-8">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>
    </ResponsiveNav>
  );
}