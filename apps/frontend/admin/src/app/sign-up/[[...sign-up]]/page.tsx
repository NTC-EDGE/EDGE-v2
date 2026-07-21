import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12 dark:bg-black">
      <div className="w-full max-w-[440px] flex flex-col justify-center">
        <SignUp appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-2xl border border-slate-800 bg-slate-950 text-white"
          }
        }} />
      </div>
    </div>
  );
}
