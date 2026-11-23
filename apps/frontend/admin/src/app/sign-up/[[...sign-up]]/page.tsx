"use client";

import { SignUp } from "@clerk/nextjs";
import { isGoogleSsoEnabled } from "@edge/api";

export default function SignUpPage() {
  const showGoogleSso = isGoogleSsoEnabled({
    clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    enableGoogleSso: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_SSO,
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12 dark:bg-black">
      <div className="w-full max-w-[440px] flex flex-col justify-center">
        <SignUp appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-2xl border border-slate-800 bg-slate-950 text-white",
            ...(showGoogleSso
              ? {}
              : {
                  socialButtons: "hidden",
                  socialButtonsBlockButton: "hidden",
                  dividerRow: "hidden",
                }),
          }
        }} />
      </div>
    </div>
  );
}
