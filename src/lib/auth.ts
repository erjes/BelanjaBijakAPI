import { headers } from "next/headers";

export function getAuthenticatedUserId() {
  const sub = headers().get("x-auth-sub");
  const userId = Number(sub);

  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  return userId;
}

export function sanitizeUser<T extends { passwordHash?: string }>(user: T) {
  const { passwordHash: _passwordHash, ...safeUser } = user;

  return safeUser;
}
