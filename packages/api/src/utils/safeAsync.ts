import { parseApiError } from "../services/apiErrorService";

/**
 * Safe async wrapper to eliminate nested try-catch boilerplate and error scope leakage.
 * Returns a tuple: [data, error]
 * 
 * Example:
 * const [res, err] = await safeAsync(loginWithClerk(email, password));
 * if (err) {
 *   showToast(err);
 *   return;
 * }
 */
export async function safeAsync<T>(
  promiseOrFn: Promise<T> | (() => Promise<T>),
  customErrorMessage?: string
): Promise<[T | null, string | null]> {
  try {
    const promise = typeof promiseOrFn === "function" ? promiseOrFn() : promiseOrFn;
    const data = await promise;
    return [data, null];
  } catch (err: unknown) {
    const parsedMessage = parseApiError(err, customErrorMessage);
    return [null, parsedMessage];
  }
}
