import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const RSVP_ACCESS_COOKIE = "wedding-rsvp-access";
export const RSVP_SESSION_LIFETIME_SECONDS = 60 * 60 * 24 * 30;

const RSVP_SESSION_VERSION = "v2";

function getSessionSecret() {
  const secret = process.env.RSVP_SESSION_SECRET;

  return secret && secret.length >= 32 ? secret : undefined;
}

function safelyMatches(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();

  return timingSafeEqual(leftHash, rightHash);
}

function signSessionPayload(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function isRsvpAccessConfigured() {
  return Boolean(getSessionSecret());
}

export function createRsvpAccessToken() {
  const secret = getSessionSecret();

  if (!secret) {
    throw new Error("RSVP_SESSION_SECRET is not configured.");
  }

  const expiresAt = Date.now() + RSVP_SESSION_LIFETIME_SECONDS * 1000;
  const payload = `${RSVP_SESSION_VERSION}.${expiresAt}`;
  const signature = signSessionPayload(payload, secret);

  return `${payload}.${signature}`;
}

export function verifyRsvpAccessToken(token: string | undefined) {
  const secret = getSessionSecret();

  if (!token || !secret) {
    return false;
  }

  const [version, expiresAtValue, suppliedSignature, ...extraParts] =
    token.split(".");
  const expiresAt = Number(expiresAtValue);

  if (
    extraParts.length > 0 ||
    version !== RSVP_SESSION_VERSION ||
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= Date.now() ||
    !suppliedSignature
  ) {
    return false;
  }

  const payload = `${version}.${expiresAtValue}`;
  const expectedSignature = signSessionPayload(payload, secret);

  return safelyMatches(suppliedSignature, expectedSignature);
}

export async function hasRsvpAccess() {
  const cookieStore = await cookies();
  const token = cookieStore.get(RSVP_ACCESS_COOKIE)?.value;

  return verifyRsvpAccessToken(token);
}
