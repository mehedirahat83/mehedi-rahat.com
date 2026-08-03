import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function key() {
  const secret = process.env.ACTIVATION_CREDENTIALS_SECRET || process.env.ADMIN_SESSION_SECRET || process.env.DATABASE_URL;
  if (!secret) throw new Error("Activation credentials encryption is not configured.");
  return createHash("sha256").update(secret).digest();
}

export function encryptActivationPassword(value: string) {
  if (!value) return null;
  const iv = randomBytes(12), cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), encrypted.toString("base64url")].join(".");
}

export function decryptActivationPassword(value: string | null) {
  if (!value) return null;
  try {
    const [version, iv, tag, encrypted] = value.split(".");
    if (version !== "v1" || !iv || !tag || !encrypted) return null;
    const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64url")), decipher.final()]).toString("utf8");
  } catch { return null; }
}
