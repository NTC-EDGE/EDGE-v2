/**
 * Generates a safe, Clerk-compliant, collision-resistant username derived from user names or email.
 * Ensures username length is between 4 and 64 characters, containing only alphanumeric characters and underscores.
 */
export function generateSafeUsername(firstName?: string, lastName?: string, email?: string): string {
  const cleanFirst = (firstName || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const cleanLast = (lastName || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  let base = '';
  if (cleanFirst && cleanLast) {
    base = `${cleanFirst}_${cleanLast}`;
  } else if (cleanFirst) {
    base = cleanFirst;
  } else {
    const emailPrefix = (email?.split('@')[0] || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    base = emailPrefix || 'user';
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
