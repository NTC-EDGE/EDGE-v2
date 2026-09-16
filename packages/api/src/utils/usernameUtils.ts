/**
 * Generates a safe, Clerk-compliant, collision-resistant username derived from user names or email.
 * Ensures username length is between 4 and 64 characters, containing only alphanumeric characters and underscores.
 *
 * NOTE: Parity Requirement
 * Any changes to the generation algorithm, sanitization rules, or length boundaries in this function
 * MUST be mirrored in the backend C# implementation at:
 * `apps/backend/EDGE.Infrastructure/Services/ClerkUserService.cs` (`GenerateSafeFallbackUsername`)
 * and verified with the test suites in both:
 * - TypeScript: `packages/api/src/utils/usernameUtils.test.ts`
 * - C# / .NET: `apps/backend/EDGE.Application.UnitTests/Users/GenerateSafeFallbackUsernameTests.cs`
 */
export function generateSafeUsername(firstName?: string, lastName?: string, email?: string): string {
  const cleanFirst = (firstName ?? '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const cleanLast = (lastName ?? '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  let base = '';
  if (cleanFirst.length > 0 && cleanLast.length > 0) {
    base = `${cleanFirst}_${cleanLast}`;
  } else if (cleanFirst.length > 0) {
    base = cleanFirst;
  } else if (cleanLast.length > 0) {
    base = cleanLast;
  } else {
    const emailPrefix = (email?.split('@')[0] ?? '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    base = emailPrefix.length > 0 ? emailPrefix : 'user';
  }

  if (base.length < 3) {
    base = `${base}user`;
  }

  const randomSuffix = Math.random().toString(36).substring(2, 8);
  let username = `${base}_${randomSuffix}`;
  if (username.length < 4) {
    username = `user_${randomSuffix}`;
  }
  if (username.length > 64) {
    username = username.substring(0, 64);
  }
  return username;
}

interface ClerkErrorItem {
  code?: unknown;
  message?: unknown;
  long_message?: unknown;
}

interface ClerkErrorResponseShape {
  errors: ClerkErrorItem[];
}

function hasErrorsArray(val: object): val is ClerkErrorResponseShape {
  if (!Reflect.has(val, 'errors')) {
    return false;
  }
  const errors = Reflect.get(val, 'errors');
  return Array.isArray(errors);
}

/**
 * Determines whether a Clerk API error or generic Error indicates that an optional/experimental
 * parameter (such as `username`) was rejected because it is not configured, unknown, or not allowed
 * on the target Clerk instance.
 *
 * Checks standard Clerk error codes (e.g. `form_param_unknown`, `form_param_not_allowed`, `param_unknown`)
 * as well as fallback message strings.
 */
export function isClerkUnknownParamError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  // Check Clerk API response error structure: { errors: [{ code, message }] }
  if (hasErrorsArray(error)) {
    for (const errItem of error.errors) {
      if (typeof errItem === 'object' && errItem !== null) {
        const rawCode = Reflect.get(errItem, 'code');
        const rawMsg = Reflect.get(errItem, 'message');
        const rawLongMsg = Reflect.get(errItem, 'long_message');

        const code = typeof rawCode === 'string' ? rawCode.toLowerCase() : '';
        const msg = typeof rawMsg === 'string' ? rawMsg.toLowerCase() : '';
        const longMsg = typeof rawLongMsg === 'string' ? rawLongMsg.toLowerCase() : '';

        if (
          code === 'form_param_unknown' ||
          code === 'form_param_not_allowed' ||
          code === 'param_unknown' ||
          code === 'param_not_allowed' ||
          msg.includes('unrecognized') ||
          msg.includes('unknown parameter') ||
          msg.includes('unexpected parameter') ||
          msg.includes('not allowed') ||
          msg.includes('unknown attribute') ||
          longMsg.includes('unrecognized') ||
          longMsg.includes('unknown parameter') ||
          longMsg.includes('unexpected parameter') ||
          longMsg.includes('not allowed') ||
          longMsg.includes('unknown attribute')
        ) {
          return true;
        }
      }
    }
  }

  // Check generic JavaScript Error object
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes('form_param_unknown') ||
      msg.includes('form_param_not_allowed') ||
      msg.includes('param_unknown') ||
      msg.includes('param_not_allowed') ||
      msg.includes('unrecognized') ||
      msg.includes('unknown parameter') ||
      msg.includes('unexpected parameter') ||
      msg.includes('not allowed') ||
      msg.includes('unknown attribute')
    ) {
      return true;
    }
  }

  return false;
}

