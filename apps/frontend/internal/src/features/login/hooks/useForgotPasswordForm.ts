import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isClerkAPIResponseError } from "@clerk/expo";
import { useSignIn } from "@clerk/expo/legacy";
import {
  forgotPasswordRequestSchema,
  forgotPasswordResetSchema,
  ForgotPasswordRequestFormData,
  ForgotPasswordResetFormData,
} from "../schemas/authSchemas";

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null;
}

function getCallableMethod(
  target: unknown,
  methodName: string
): ((...args: unknown[]) => Promise<unknown>) | null {
  if (isObject(target)) {
    const fn = Reflect.get(target, methodName);
    if (typeof fn === "function") {
      return (...args: unknown[]) => fn.apply(target, args);
    }
  }
  return null;
}

function isStrategyInvalidError(err: unknown): boolean {
  if (isObject(err)) {
    if (err.code === "strategy_for_user_invalid") {
      return true;
    }
    const errors = Reflect.get(err, "errors");
    if (Array.isArray(errors)) {
      return errors.some(
        (e) =>
          isObject(e) &&
          (e.code === "strategy_for_user_invalid" ||
            (typeof e.message === "string" && e.message.toLowerCase().includes("strategy")))
      );
    }
    if (typeof err.message === "string" && err.message.toLowerCase().includes("strategy")) {
      return true;
    }
  }
  return false;
}

/**
 * Extracts the real backend error message from Clerk or API error response objects,
 * avoiding generic frontend fallback messages and prioritizing actual server details.
 */
function extractBackendErrorMessage(err: unknown): string {
  if (err === null || err === undefined) {
    return "An unexpected error occurred. Please try again.";
  }
  if (typeof err === "string" && err.trim().length > 0) {
    return err.trim();
  }

  // 1. Official Clerk API response error
  if (isClerkAPIResponseError(err)) {
    const firstErr = err.errors[0];
    if (firstErr !== undefined) {
      if (typeof firstErr.longMessage === "string" && firstErr.longMessage.trim().length > 0) {
        return firstErr.longMessage.trim();
      }
      if (typeof firstErr.message === "string" && firstErr.message.trim().length > 0) {
        return firstErr.message.trim();
      }
    }
  }

  if (isObject(err)) {
    // 2. Clerk API errors array: { errors: [{ message, longMessage, long_message }] }
    const errors = Reflect.get(err, "errors");
    if (Array.isArray(errors) && errors.length > 0) {
      const firstErr = errors[0];
      if (isObject(firstErr)) {
        const longMsg =
          Reflect.get(firstErr, "longMessage") ??
          Reflect.get(firstErr, "long_message");
        if (typeof longMsg === "string" && longMsg.trim().length > 0) {
          return longMsg.trim();
        }
        const msg = Reflect.get(firstErr, "message");
        if (typeof msg === "string" && msg.trim().length > 0) {
          return msg.trim();
        }
      }
    }

    // 3. Direct longMessage on error object (e.g. ClerkError)
    const directLongMsg =
      Reflect.get(err, "longMessage") ??
      Reflect.get(err, "long_message");
    if (typeof directLongMsg === "string" && directLongMsg.trim().length > 0) {
      return directLongMsg.trim();
    }

    // 4. Direct verification error property: { firstFactorVerification: { error: { message, longMessage } } }
    const firstFactorVerification = Reflect.get(err, "firstFactorVerification");
    if (isObject(firstFactorVerification)) {
      const vErr = Reflect.get(firstFactorVerification, "error");
      if (isObject(vErr)) {
        const longMsg =
          Reflect.get(vErr, "longMessage") ??
          Reflect.get(vErr, "long_message");
        if (typeof longMsg === "string" && longMsg.trim().length > 0) {
          return longMsg.trim();
        }
        const msg = Reflect.get(vErr, "message");
        if (typeof msg === "string" && msg.trim().length > 0) {
          return msg.trim();
        }
      }
    }

    // 5. Direct error property: { error: { message, longMessage } }
    const singleErr = Reflect.get(err, "error");
    if (isObject(singleErr)) {
      const subMsg = extractBackendErrorMessage(singleErr);
      if (subMsg.length > 0 && !subMsg.includes("unexpected error")) {
        return subMsg;
      }
    }

    // 6. Cause property
    const cause = Reflect.get(err, "cause");
    if (cause !== undefined && cause !== null) {
      const causeMsg = extractBackendErrorMessage(cause);
      if (causeMsg.length > 0 && !causeMsg.includes("unexpected error")) {
        return causeMsg;
      }
    }

    // 7. Backend ApiResponse / ProblemDetails format
    const response = Reflect.get(err, "response");
    if (isObject(response)) {
      const data = Reflect.get(response, "data");
      if (isObject(data)) {
        const message = Reflect.get(data, "message");
        if (typeof message === "string" && message.trim().length > 0) {
          return message.trim();
        }
        const detail = Reflect.get(data, "detail");
        if (typeof detail === "string" && detail.trim().length > 0) {
          return detail.trim();
        }
      }
    }

    // 8. Standard message property
    const message = Reflect.get(err, "message");
    if (typeof message === "string" && message.trim().length > 0) {
      return message.trim();
    }
  }

  if (err instanceof Error && err.message.trim().length > 0) {
    return err.message.trim();
  }

  return "An unexpected error occurred. Please try again.";
}

export function useForgotPasswordForm() {
  const { signIn, setActive, isLoaded } = useSignIn();

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

    if (!isLoaded || signIn === null || signIn === undefined) {
      setToastMessage("Authentication service is not loaded yet. Please wait a moment.");
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Support Clerk Expo v3 Future API if resetPasswordEmailCode is present on runtime signIn
      const resetEmailObj = isObject(signIn) ? Reflect.get(signIn, "resetPasswordEmailCode") : null;
      const sendCodeFn = resetEmailObj && isObject(resetEmailObj) ? Reflect.get(resetEmailObj, "sendCode") : null;

      if (typeof sendCodeFn === "function") {
        if (typeof signIn.create === "function") {
          const createRes = await signIn.create({
            identifier: data.email.trim(),
          });
          if (isObject(createRes) && Reflect.get(createRes, "error")) {
            throw Reflect.get(createRes, "error");
          }
        }
        const sendCodeMethod = getCallableMethod(resetEmailObj, "sendCode");
        if (sendCodeMethod !== null) {
          const sendRes = await sendCodeMethod();
          if (isObject(sendRes) && Reflect.get(sendRes, "error")) {
            throw Reflect.get(sendRes, "error");
          }
        }
      } else {
        // 2. Standard Clerk Legacy flow (SignInResource)
        let si: typeof signIn = signIn;
        try {
          si = await signIn.create({
            strategy: "reset_password_email_code",
            identifier: data.email.trim(),
          });
        } catch {
          si = await signIn.create({
            identifier: data.email.trim(),
          });
        }

        const rawFactors = si?.supportedFirstFactors ?? signIn.supportedFirstFactors;
        const factors = Array.isArray(rawFactors) ? rawFactors : [];
        const resetFactor = factors.find(
          (f) => f.strategy === "reset_password_email_code"
        );
        const emailFactor = factors.find(
          (f) => f.strategy === "email_code"
        );
        const targetFactor = resetFactor ?? emailFactor;

        if (targetFactor !== undefined && typeof signIn.prepareFirstFactor === "function") {
          const strategy =
            targetFactor.strategy === "reset_password_email_code"
              ? "reset_password_email_code"
              : "email_code";
          const rawEmailId =
            "emailAddressId" in targetFactor && typeof targetFactor.emailAddressId === "string"
              ? targetFactor.emailAddressId
              : "email_address_id" in targetFactor && typeof targetFactor.email_address_id === "string"
              ? targetFactor.email_address_id
              : "";

          if (rawEmailId.length > 0) {
            if (strategy === "reset_password_email_code") {
              await signIn.prepareFirstFactor({
                strategy: "reset_password_email_code",
                emailAddressId: rawEmailId,
              });
            } else {
              await signIn.prepareFirstFactor({
                strategy: "email_code",
                emailAddressId: rawEmailId,
              });
            }
          }
        }
      }

      setRequestedEmail(data.email.trim());
      setStep("reset");
    } catch (err: unknown) {
      console.error("[useForgotPasswordForm] Request error:", err);
      const errMsg = extractBackendErrorMessage(err);
      setToastMessage(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  });

  const onResetSubmit = resetForm.handleSubmit(async (data) => {
    setToastMessage(null);
    setIsSubmitting(true);

    if (!isLoaded || signIn === null || signIn === undefined) {
      setToastMessage("Authentication service is not loaded yet. Please wait a moment.");
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Support Clerk Expo v3 Future API if resetPasswordEmailCode is present on runtime signIn
      const resetEmailObj = isObject(signIn) ? Reflect.get(signIn, "resetPasswordEmailCode") : null;
      const verifyCodeFn = resetEmailObj && isObject(resetEmailObj) ? Reflect.get(resetEmailObj, "verifyCode") : null;
      const submitPasswordFn = resetEmailObj && isObject(resetEmailObj) ? Reflect.get(resetEmailObj, "submitPassword") : null;

      if (typeof verifyCodeFn === "function" && typeof submitPasswordFn === "function") {
        const verifyCodeMethod = getCallableMethod(resetEmailObj, "verifyCode");
        if (verifyCodeMethod !== null) {
          const verifyRes = await verifyCodeMethod({
            code: data.code.trim(),
          });
          if (isObject(verifyRes) && Reflect.get(verifyRes, "error")) {
            throw Reflect.get(verifyRes, "error");
          }
        }

        const submitPasswordMethod = getCallableMethod(resetEmailObj, "submitPassword");
        if (submitPasswordMethod !== null) {
          const submitRes = await submitPasswordMethod({
            password: data.newPassword,
          });
          if (isObject(submitRes) && Reflect.get(submitRes, "error")) {
            throw Reflect.get(submitRes, "error");
          }
        }

        const finalizeMethod = getCallableMethod(signIn, "finalize");
        if (finalizeMethod !== null) {
          const finRes = await finalizeMethod();
          if (isObject(finRes) && Reflect.get(finRes, "error")) {
            throw Reflect.get(finRes, "error");
          }
        } else if (typeof setActive === "function") {
          const createdSessionId = Reflect.get(signIn, "createdSessionId");
          if (typeof createdSessionId === "string" && createdSessionId.length > 0) {
            await setActive({ session: createdSessionId });
          }
        }

        setStep("success");
        return;
      }

      // 2. Standard Clerk Legacy flow (attemptFirstFactor)
      if (typeof signIn.attemptFirstFactor === "function") {
        const preparedStrategy =
          isObject(signIn.firstFactorVerification) &&
          typeof signIn.firstFactorVerification.strategy === "string"
            ? signIn.firstFactorVerification.strategy
            : undefined;

        let result: unknown = null;

        // If Clerk prepared "email_code", verify the code first, then submit the new password
        if (preparedStrategy === "email_code") {
          const verifyResult = await signIn.attemptFirstFactor({
            strategy: "email_code",
            code: data.code.trim(),
          });

          if (
            isObject(verifyResult) &&
            (verifyResult.status === "needs_new_password" || signIn.status === "needs_new_password") &&
            typeof signIn.resetPassword === "function"
          ) {
            result = await signIn.resetPassword({
              password: data.newPassword,
            });
          } else {
            result = verifyResult;
          }
        } else {
          // Prepared strategy is reset_password_email_code (or unknown/default)
          try {
            result = await signIn.attemptFirstFactor({
              strategy: "reset_password_email_code",
              code: data.code.trim(),
              password: data.newPassword,
            });
          } catch (firstErr: unknown) {
            // Fallback: if Clerk rejected with strategy_for_user_invalid, the session has email_code pending
            if (isStrategyInvalidError(firstErr)) {
              const verifyResult = await signIn.attemptFirstFactor({
                strategy: "email_code",
                code: data.code.trim(),
              });

              if (
                isObject(verifyResult) &&
                (verifyResult.status === "needs_new_password" || signIn.status === "needs_new_password") &&
                typeof signIn.resetPassword === "function"
              ) {
                result = await signIn.resetPassword({
                  password: data.newPassword,
                });
              } else {
                result = verifyResult;
              }
            } else {
              throw firstErr;
            }
          }
        }

        if (
          (isObject(result) && result.status === "complete") ||
          signIn.status === "complete"
        ) {
          if (typeof setActive === "function") {
            const resultSessionId =
              isObject(result) && typeof result.createdSessionId === "string"
                ? result.createdSessionId
                : undefined;
            const sessionId = resultSessionId ?? signIn.createdSessionId;
            if (typeof sessionId === "string" && sessionId.length > 0) {
              await setActive({ session: sessionId });
            }
          }
          setStep("success");
          return;
        }

        // Check if backend returned specific error details
        const backendError = extractBackendErrorMessage(result);
        if (backendError.length > 0 && !backendError.toLowerCase().includes("unexpected error")) {
          throw new Error(backendError);
        }

        const statusStr =
          isObject(result) && typeof result.status === "string"
            ? result.status
            : "unverified";
        throw new Error(`Verification status: ${statusStr}. Please check your code and try again.`);
      }

      // 3. Alternative legacy resetPassword
      if (typeof signIn.resetPassword === "function") {
        await signIn.resetPassword({
          password: data.newPassword,
        });
        setStep("success");
        return;
      }

      // 4. If none of the known reset methods are available, surface an actionable error with details
      const methodKeys = Object.keys(signIn).filter((k) => typeof Reflect.get(signIn, k) === "function");
      console.warn("[useForgotPasswordForm] No supported reset method found on signIn. Available methods:", methodKeys);
      throw new Error("Password reset is not supported by the current authentication session. Please refresh and try again.");
    } catch (err: unknown) {
      console.error("[useForgotPasswordForm] Reset error:", err);
      const errMsg = extractBackendErrorMessage(err);
      setToastMessage(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  });

  return {
    step,
    toastMessage,
    requestedEmail,
    isSubmitting,
    requestForm,
    resetForm,
    dismissToast,
    onRequestSubmit,
    onResetSubmit,
  };
}
