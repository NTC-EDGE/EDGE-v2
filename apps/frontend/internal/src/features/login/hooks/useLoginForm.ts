import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOAuth } from "@clerk/expo";
import { isGoogleSsoEnabled, safeAsync } from "@edge/api";
import { useAuthContext } from "../../auth/context/AuthContext";
import { loginSchema, LoginFormData } from "../schemas/authSchemas";

export function useLoginForm() {
  const { loginWithClerk } = useAuthContext();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const showGoogleSso = isGoogleSsoEnabled({
    clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    enableGoogleSso: process.env.EXPO_PUBLIC_ENABLE_GOOGLE_SSO,
  });

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
    if (!showGoogleSso) return;
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

  return {
    form,
    onSubmit,
    handleGoogleSignIn,
    isSubmitting: form.formState.isSubmitting,
    isGoogleSubmitting,
    showGoogleSso,
    toastMessage,
    dismissToast,
  };
}
