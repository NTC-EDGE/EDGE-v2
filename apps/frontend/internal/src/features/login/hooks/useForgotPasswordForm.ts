import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isClerkAPIResponseError } from "@clerk/expo";
import { useSignIn } from "@clerk/expo/legacy";
import { parseApiError, safeAsync } from "@edge/api";
import {
  forgotPasswordRequestSchema,
  forgotPasswordResetSchema,
  ForgotPasswordRequestFormData,
  ForgotPasswordResetFormData,
} from "../schemas/authSchemas";

type ResetSupportedStrategy = "reset_password_email_code" | "email_code";

interface ClerkSupportedResetFactor {
  strategy: ResetSupportedStrategy;
  emailAddressId: string;
}

interface ClerkFutureSendCodeCapable {
  sendCode: () => Promise<unknown>;
}

interface ClerkFutureResetCapable {
  verifyCode: (params: { code: string }) => Promise<unknown>;
  submitPassword: (params: { password: string }) => Promise<unknown>;
}

interface ClerkSignInWithFinalize {
  finalize: () => Promise<unknown>;
}

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

/**
 * Safely reads a property from an unknown target object using guarded property lookup.
 * Protects against non-object targets, missing keys, and throwing getters/proxies
 * across varying Clerk SDK versions.
 */
function getSafeProperty(target: unknown, key: string): unknown {
  if (!isRecord(target)) {
    return undefined;
  }
  try {
    if (!(key in target)) {
      return undefined;
    }
    return target[key];
  } catch {
    return undefined;
  }
}

function getNonEmptyStringProp(target: unknown, key: string): string | undefined {
  const val = getSafeProperty(target, key);
  if (typeof val === "string" && val.trim().length > 0) {
    return val.trim();
  }
  return undefined;
}

function getRecordProp(target: unknown, key: string): Record<string, unknown> | null {
  const val = getSafeProperty(target, key);
  return isRecord(val) ? val : null;
}

function getArrayProp(target: unknown, key: string): unknown[] | null {
  const val = getSafeProperty(target, key);
  return Array.isArray(val) ? val : null;
}

function isFutureSendCodeCapable(val: unknown): val is ClerkFutureSendCodeCapable {
  return isRecord(val) && typeof getSafeProperty(val, "sendCode") === "function";
}

function isFutureResetCapable(val: unknown): val is ClerkFutureResetCapable {
  return (
    isRecord(val) &&
    typeof getSafeProperty(val, "verifyCode") === "function" &&
    typeof getSafeProperty(val, "submitPassword") === "function"
  );
}

function isSignInWithFinalize(val: unknown): val is ClerkSignInWithFinalize {
  return isRecord(val) && typeof getSafeProperty(val, "finalize") === "function";
}

function throwIfResultHasError(result: unknown): void {
  const errorProp = getSafeProperty(result, "error");
  if (errorProp !== undefined && errorProp !== null) {
    throw errorProp;
  }
}

function isResetSupportedStrategy(val: unknown): val is ResetSupportedStrategy {
  return val === "reset_password_email_code" || val === "email_code";
}

function extractSupportedResetFactor(
  primarySignIn: unknown,
  fallbackSignIn: unknown
): ClerkSupportedResetFactor | null {
  const rawFactors =
    getArrayProp(primarySignIn, "supportedFirstFactors") ??
    getArrayProp(fallbackSignIn, "supportedFirstFactors") ??
    [];

  let resetFactor: ClerkSupportedResetFactor | null = null;
  let emailFactor: ClerkSupportedResetFactor | null = null;

  for (const factor of rawFactors) {
    if (!isRecord(factor)) {
      continue;
    }
    const strategy = getSafeProperty(factor, "strategy");
    if (!isResetSupportedStrategy(strategy)) {
      continue;
    }
    const emailAddressId =
      getNonEmptyStringProp(factor, "emailAddressId") ??
      getNonEmptyStringProp(factor, "email_address_id") ??
      "";

    const parsedFactor: ClerkSupportedResetFactor = {
      strategy,
      emailAddressId,
    };

    if (strategy === "reset_password_email_code" && resetFactor === null) {
      resetFactor = parsedFactor;
    } else if (strategy === "email_code" && emailFactor === null) {
      emailFactor = parsedFactor;
    }
  }

  return resetFactor ?? emailFactor;
}

function isStrategyInvalidError(err: unknown): boolean {
  if (!isRecord(err)) {
    return false;
  }
  if (getNonEmptyStringProp(err, "code") === "strategy_for_user_invalid") {
    return true;
  }
  const errors = getArrayProp(err, "errors");
  if (errors !== null) {
    const matched = errors.some((item) => {
      if (!isRecord(item)) {
        return false;
      }
      if (getNonEmptyStringProp(item, "code") === "strategy_for_user_invalid") {
        return true;
      }
      const itemMsg = getNonEmptyStringProp(item, "message");
      return itemMsg !== undefined && itemMsg.toLowerCase().includes("strategy");
    });
    if (matched) {
      return true;
    }
  }
  const directMsg = getNonEmptyStringProp(err, "message");
  return directMsg !== undefined && directMsg.toLowerCase().includes("strategy");
}

/**
 * Extracts the real backend error message from Clerk or API error response objects,
 * avoiding generic frontend fallback messages and prioritizing actual server details.
 */
function extractBackendErrorMessage(err: unknown): string {
  const fallbackMessage = "An unexpected error occurred. Please try again.";

  if (err === null || err === undefined) {
    return fallbackMessage;
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

  if (isRecord(err)) {
    // 2. Clerk API errors array: { errors: [{ message, longMessage, long_message }] }
    const errors = getArrayProp(err, "errors");
    if (errors !== null && errors.length > 0) {
      const firstErr = errors[0];
      if (isRecord(firstErr)) {
        const longMsg =
          getNonEmptyStringProp(firstErr, "longMessage") ??
          getNonEmptyStringProp(firstErr, "long_message");
        if (longMsg !== undefined) {
          return longMsg;
        }
        const msg = getNonEmptyStringProp(firstErr, "message");
        if (msg !== undefined) {
          return msg;
        }
      }
    }

    // 3. Direct longMessage on error object (e.g. ClerkError)
    const directLongMsg =
      getNonEmptyStringProp(err, "longMessage") ??
      getNonEmptyStringProp(err, "long_message");
    if (directLongMsg !== undefined) {
      return directLongMsg;
    }

    // 4. Direct verification error property: { firstFactorVerification: { error: { message, longMessage } } }
    const firstFactorVerification = getRecordProp(err, "firstFactorVerification");
    if (firstFactorVerification !== null) {
      const vErr = getRecordProp(firstFactorVerification, "error");
      if (vErr !== null) {
        const longMsg =
          getNonEmptyStringProp(vErr, "longMessage") ??
          getNonEmptyStringProp(vErr, "long_message");
        if (longMsg !== undefined) {
          return longMsg;
        }
        const msg = getNonEmptyStringProp(vErr, "message");
        if (msg !== undefined) {
          return msg;
        }
      }
    }

    // 5. Direct error property: { error: { message, longMessage } }
    const singleErr = getRecordProp(err, "error");
    if (singleErr !== null) {
      const subMsg = extractBackendErrorMessage(singleErr);
      if (subMsg.length > 0 && !subMsg.includes("unexpected error")) {
        return subMsg;
      }
    }

    // 6. Cause property
    const cause = getSafeProperty(err, "cause");
    if (cause !== undefined && cause !== null) {
      const causeMsg = extractBackendErrorMessage(cause);
      if (causeMsg.length > 0 && !causeMsg.includes("unexpected error")) {
        return causeMsg;
      }
    }

    // 7. Backend ApiResponse / ProblemDetails format
    const response = getRecordProp(err, "response");
    if (response !== null) {
      const data = getRecordProp(response, "data");
      if (data !== null) {
        const message = getNonEmptyStringProp(data, "message");
        if (message !== undefined) {
          return message;
        }
        const detail = getNonEmptyStringProp(data, "detail");
        if (detail !== undefined) {
          return detail;
        }
      }
    }

    // 8. Standard message property
    const message = getNonEmptyStringProp(err, "message");
    if (message !== undefined) {
      return message;
    }
  }

  if (err instanceof Error && err.message.trim().length > 0) {
    return err.message.trim();
  }

  return parseApiError(err, fallbackMessage);
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

    const trimmedEmail = data.email.trim();

    const [, error] = await safeAsync(async () => {
      try {
        // 1. Support Clerk Expo v3 Future API if resetPasswordEmailCode is present on runtime signIn
        const resetEmailObj = getRecordProp(signIn, "resetPasswordEmailCode");

        if (isFutureSendCodeCapable(resetEmailObj)) {
          if (typeof signIn.create === "function") {
            const createRes = await signIn.create({
              identifier: trimmedEmail,
            });
            throwIfResultHasError(createRes);
          }

          const sendRes = await resetEmailObj.sendCode();
          throwIfResultHasError(sendRes);
          return;
        }

        // 2. Standard Clerk Legacy flow (SignInResource)
        let createdSignIn: unknown = signIn;
        try {
          createdSignIn = await signIn.create({
            strategy: "reset_password_email_code",
            identifier: trimmedEmail,
          });
        } catch {
          createdSignIn = await signIn.create({
            identifier: trimmedEmail,
          });
        }

        const targetFactor = extractSupportedResetFactor(createdSignIn, signIn);

        if (
          targetFactor !== null &&
          targetFactor.emailAddressId.length > 0 &&
          typeof signIn.prepareFirstFactor === "function"
        ) {
          if (targetFactor.strategy === "reset_password_email_code") {
            await signIn.prepareFirstFactor({
              strategy: "reset_password_email_code",
              emailAddressId: targetFactor.emailAddressId,
            });
          } else {
            await signIn.prepareFirstFactor({
              strategy: "email_code",
              emailAddressId: targetFactor.emailAddressId,
            });
          }
        }
      } catch (err: unknown) {
        throw new Error(extractBackendErrorMessage(err));
      }
    });

    if (error !== null) {
      setToastMessage(error);
    } else {
      setRequestedEmail(trimmedEmail);
      setStep("reset");
    }
    setIsSubmitting(false);
  });

  const onResetSubmit = resetForm.handleSubmit(async (data) => {
    setToastMessage(null);
    setIsSubmitting(true);

    if (!isLoaded || signIn === null || signIn === undefined) {
      setToastMessage("Authentication service is not loaded yet. Please wait a moment.");
      setIsSubmitting(false);
      return;
    }

    const trimmedCode = data.code.trim();

    const [, error] = await safeAsync(async () => {
      try {
        // 1. Support Clerk Expo v3 Future API if resetPasswordEmailCode is present on runtime signIn
        const resetEmailObj = getRecordProp(signIn, "resetPasswordEmailCode");

        if (isFutureResetCapable(resetEmailObj)) {
          const verifyRes = await resetEmailObj.verifyCode({
            code: trimmedCode,
          });
          throwIfResultHasError(verifyRes);

          const submitRes = await resetEmailObj.submitPassword({
            password: data.newPassword,
          });
          throwIfResultHasError(submitRes);

          if (isSignInWithFinalize(signIn)) {
            const finRes = await signIn.finalize();
            throwIfResultHasError(finRes);
          } else if (typeof setActive === "function") {
            const createdSessionId = getNonEmptyStringProp(signIn, "createdSessionId");
            if (createdSessionId !== undefined) {
              await setActive({ session: createdSessionId });
            }
          }

          return;
        }

        // 2. Standard Clerk Legacy flow (attemptFirstFactor)
        if (typeof signIn.attemptFirstFactor === "function") {
          const verificationRecord = getRecordProp(signIn, "firstFactorVerification");
          const preparedStrategy =
            verificationRecord !== null
              ? getNonEmptyStringProp(verificationRecord, "strategy")
              : undefined;

          let result: unknown = null;

          // If Clerk prepared "email_code", verify the code first, then submit the new password
          if (preparedStrategy === "email_code") {
            const verifyResult = await signIn.attemptFirstFactor({
              strategy: "email_code",
              code: trimmedCode,
            });

            const verifyStatus = getNonEmptyStringProp(verifyResult, "status");
            if (
              (verifyStatus === "needs_new_password" || signIn.status === "needs_new_password") &&
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
                code: trimmedCode,
                password: data.newPassword,
              });
            } catch (firstErr: unknown) {
              // Fallback: if Clerk rejected with strategy_for_user_invalid, the session has email_code pending
              if (isStrategyInvalidError(firstErr)) {
                const verifyResult = await signIn.attemptFirstFactor({
                  strategy: "email_code",
                  code: trimmedCode,
                });

                const verifyStatus = getNonEmptyStringProp(verifyResult, "status");
                if (
                  (verifyStatus === "needs_new_password" || signIn.status === "needs_new_password") &&
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

          const resultStatus = getNonEmptyStringProp(result, "status");
          if (resultStatus === "complete" || signIn.status === "complete") {
            if (typeof setActive === "function") {
              const sessionId =
                getNonEmptyStringProp(result, "createdSessionId") ??
                getNonEmptyStringProp(signIn, "createdSessionId");
              if (sessionId !== undefined) {
                await setActive({ session: sessionId });
              }
            }
            return;
          }

          // Check if backend returned specific error details
          const backendError = extractBackendErrorMessage(result);
          if (backendError.length > 0 && !backendError.toLowerCase().includes("unexpected error")) {
            throw new Error(backendError);
          }

          const statusStr = resultStatus ?? "unverified";
          throw new Error(`Verification status: ${statusStr}. Please check your code and try again.`);
        }

        // 3. Alternative legacy resetPassword
        if (typeof signIn.resetPassword === "function") {
          await signIn.resetPassword({
            password: data.newPassword,
          });
          return;
        }

        // 4. If none of the known reset methods are available, surface an actionable error
        throw new Error(
          "Password reset is not supported by the current authentication session. Please refresh and try again."
        );
      } catch (err: unknown) {
        throw new Error(extractBackendErrorMessage(err));
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

