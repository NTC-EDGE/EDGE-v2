import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignIn } from "@clerk/expo";
import { safeAsync } from "@edge/api";
import {
  forgotPasswordRequestSchema,
  forgotPasswordResetSchema,
  ForgotPasswordRequestFormData,
  ForgotPasswordResetFormData,
} from "../schemas/authSchemas";

export function useForgotPasswordForm() {
  const { signIn } = useSignIn();

  const [step, setStep] = useState<"request" | "reset" | "success">("request");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [requestedEmail, setRequestedEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestForm = useForm<ForgotPasswordRequestFormData>({
    resolver: zodResolver(forgotPasswordRequestSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ForgotPasswordResetFormData>({
    resolver: zodResolver(forgotPasswordResetSchema),
    defaultValues: { code: "", newPassword: "", confirmPassword: "" },
  });

  const dismissToast = () => {
    setToastMessage(null);
  };

  const onRequestSubmit = requestForm.handleSubmit(async (data) => {
    setToastMessage(null);
    setIsSubmitting(true);

    if (signIn === null || signIn === undefined) {
      setToastMessage("Authentication service is not loaded yet.");
      setIsSubmitting(false);
      return;
    }

    const [, error] = await safeAsync(async () => {
      const signInObj = signIn as unknown as {
        create: (opts: { strategy: string; identifier: string }) => Promise<unknown>;
      };
      if (typeof signInObj.create === "function") {
        await signInObj.create({
          strategy: "reset_password_email_code",
          identifier: data.email.trim(),
        });
      }
    });

    if (error !== null) {
      setToastMessage(error);
    } else {
      setRequestedEmail(data.email.trim());
      setStep("reset");
    }
    setIsSubmitting(false);
  });

  const onResetSubmit = resetForm.handleSubmit(async (data) => {
    setToastMessage(null);
    setIsSubmitting(true);

    if (signIn === null || signIn === undefined) {
      setToastMessage("Authentication service is not loaded yet.");
      setIsSubmitting(false);
      return;
    }

    const [, error] = await safeAsync(async () => {
      const signInObj = signIn as unknown as {
        resetPassword: (opts: { code: string; password: string }) => Promise<unknown>;
      };
      if (typeof signInObj.resetPassword === "function") {
        await signInObj.resetPassword({
          code: data.code.trim(),
          password: data.newPassword,
        });
      }
    });

    if (error !== null) {
      setToastMessage(error);
    } else {
      setStep("success");
    }
    setIsSubmitting(false);
  });

  return {
    step,
    requestForm,
    resetForm,
    requestedEmail,
    isSubmitting,
    toastMessage,
    dismissToast,
    onRequestSubmit,
    onResetSubmit,
  };
}
