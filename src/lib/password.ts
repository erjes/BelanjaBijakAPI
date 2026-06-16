const encoder = new TextEncoder();
const iterations = 120000;

export async function hashPassword(password: string, salt = crypto.randomUUID()) {
  const key = await deriveKey(password, salt);
  const hash = await crypto.subtle.exportKey("raw", key);

  return `pbkdf2:${iterations}:${salt}:${base64UrlEncodeBytes(new Uint8Array(hash))}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, iterationsValue, salt, expectedHash] = storedHash.split(":");

  if (algorithm !== "pbkdf2" || iterationsValue !== String(iterations) || !salt || !expectedHash) {
    return false;
  }

  const actualHash = await hashPassword(password, salt);

  return timingSafeEqual(actualHash, storedHash);
}

async function deriveKey(password: string, salt: string) {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode(salt),
      iterations,
      hash: "SHA-256",
    },
    baseKey,
    {
      name: "HMAC",
      hash: "SHA-256",
      length: 256,
    },
    true,
    ["sign"],
  );
}

function base64UrlEncodeBytes(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return result === 0;
}
