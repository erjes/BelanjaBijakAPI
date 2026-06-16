import { pbkdf2Sync, randomUUID, timingSafeEqual as nodeTimingSafeEqual } from "node:crypto";

const iterations = 120000;
const keyLength = 32;
const digest = "sha256";

export async function hashPassword(password: string, salt: string = randomUUID()) {
  const hash = pbkdf2Sync(password, salt, iterations, keyLength, digest);

  return `pbkdf2:${iterations}:${salt}:${hash.toString("base64url")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, iterationsValue, salt, expectedHash] = storedHash.split(":");

  if (algorithm !== "pbkdf2" || iterationsValue !== String(iterations) || !salt || !expectedHash) {
    return false;
  }

  const actualHash = await hashPassword(password, salt);

  return timingSafeEqual(actualHash, storedHash);
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) {
    return false;
  }

  return nodeTimingSafeEqual(Buffer.from(a), Buffer.from(b));
}
