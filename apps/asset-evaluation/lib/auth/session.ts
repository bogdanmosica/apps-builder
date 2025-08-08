import { compare, hash } from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { config } from "@/lib/config";
import type { NewUser } from "@/lib/db/schema";

// Ensure AUTH_SECRET is available
if (!config.authSecret) {
  throw new Error("AUTH_SECRET environment variable is required");
}

const key = new TextEncoder().encode(config.authSecret);
const SALT_ROUNDS = 10;

export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string,
) {
  return compare(plainTextPassword, hashedPassword);
}

type SessionData = {
  user: { id: number; role: string };
  expires: string;
};

export async function signToken(payload: SessionData) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1 day from now")
    .sign(key);
}

export async function verifyToken(input: string) {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload as SessionData;
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) return null;

  try {
    return await verifyToken(session);
  } catch (error) {
    // If token verification fails, clear the invalid session cookie
    console.error("Invalid session token, clearing cookie:", error);
    cookieStore.delete("session");
    return null;
  }
}

export async function setSession(user: NewUser) {
  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session: SessionData = {
    user: { id: user.id!, role: user.role || "member" },
    expires: expiresInOneDay.toISOString(),
  };
  const encryptedSession = await signToken(session);

  // Set cookie with mobile-friendly settings
  const cookieStore = await cookies();
  cookieStore.set("session", encryptedSession, {
    expires: expiresInOneDay,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Only secure in production
    sameSite: "lax",
    path: "/", // Ensure cookie is available site-wide
  });
}
