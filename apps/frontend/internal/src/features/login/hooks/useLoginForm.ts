import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOAuth } from "@clerk/expo";
import { safeAsync } from "@edge/api";
import { useAuthContext } from "../../auth/context/AuthContext";
import { loginSchema, LoginFormData } from "../schemas/authSchemas";

export function useLoginForm() {
  const { loginWithClerk } = useAuthContext();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const dismissToast = () => {
    setToastMessage(null);
  };

  const onSubmit = form.handleSubmit(async (data: LoginFormData) => {
    setToastMessage(null);
    const [, error] = await safeAsync(loginWithClerk(data.identifier.trim(), data.password));
    if (error !== null) {
      setToastMessage(error);
    }
  });

  const handleGoogleSignIn = async () => {
    setToastMessage(null);
    setIsGoogleSubmitting(true);

    const [, error] = await safeAsync(async () => {
      const flowRes = await startOAuthFlow();
      if (flowRes !== null && flowRes !== undefined && flowRes.createdSessionId && typeof flowRes.setActive === "function") {
        await flowRes.setActive({ session: flowRes.createdSessionId });
        return flowRes;
      }

      throw new Error(
        "The selected Google account is not yet registered. Please make sure to sign in with a registered account."
      );
    });

    if (error !== null) {
      setToastMessage(error);
    }
    setIsGoogleSubmitting(false);
  };

  const handleApplyPreset = (email: string) => {
    form.setValue("identifier", email, { shouldValidate: true });
    form.setValue("password", "NtcStaff123!", { shouldValidate: true });
    setToastMessage(null);
  };

  return {
    form,
    onSubmit,
    handleGoogleSignIn,
    handleApplyPreset,
    isSubmitting: form.formState.isSubmitting,
    isGoogleSubmitting,
    toastMessage,
    dismissToast,
  };
}
