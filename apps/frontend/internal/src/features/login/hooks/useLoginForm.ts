import { useState } from "react";
import { Platform } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSSO, useSignIn } from "@clerk/expo";
import { isGoogleSsoEnabled, safeAsync } from "@edge/api";
import { useAuthContext } from "../../auth/context/AuthContext";
import { loginSchema, LoginFormData } from "../schemas/authSchemas";

export function useLoginForm() {
  const { loginWithClerk } = useAuthContext();
  const { signIn } = useSignIn();
  const { startSSOFlow } = useSSO();
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
      // On Web, perform a same-tab OAuth redirect via Clerk's signIn.sso() so the
      // browser stays in the current tab instead of spawning a new popup/window.
      if (Platform.OS === "web" && typeof window !== "undefined") {
        const ssoFn =
          typeof signIn === "object" && signIn !== null ? Reflect.get(signIn, "sso") : undefined;
        if (typeof ssoFn === "function") {
          const origin = window.location.origin;
          const res: unknown = await Reflect.apply(ssoFn, signIn, [
            {
              strategy: "oauth_google",
              redirectCallbackUrl: `${origin}/internal/login?sso_callback=1`,
              redirectUrl: `${origin}/dashboard`,
            },
          ]);
          const resError =
            typeof res === "object" && res !== null ? Reflect.get(res, "error") : undefined;
          if (resError !== null && resError !== undefined) {
            throw resError;
          }
          return res;
        }
      }

      // On Native (iOS / Android), use Expo's non-deprecated useSSO flow
      const flowRes = await startSSOFlow({ strategy: "oauth_google" });
      if (
        flowRes !== null &&
        flowRes !== undefined &&
        flowRes.createdSessionId &&
        typeof flowRes.setActive === "function"
      ) {
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
