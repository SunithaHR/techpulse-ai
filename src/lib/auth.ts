import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import type { User } from "@prisma/client";

const SESSION_COOKIE = "tp_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export interface SessionPayload {
  sub: string; // user id
  email: string;
  name: string | null;
  role: string;
}

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error("AUTH_SECRET is not configured (min 16 chars). See .env.example");
  }
  return new TextEncoder().encode(s);
}

export async function signSession(user: { id: string; email: string; name: string | null; role: string }) {
  const token = await new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secret());
  return token;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      email: (payload.email as string) ?? "",
      name: (payload.name as string | null) ?? null,
      role: (payload.role as string) ?? "USER",
    };
  } catch {
    return null;
  }
}

/** Read the current session payload from the request cookies. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Server-side guard for protected pages. */
export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireUser();
  if (session.role !== "ADMIN") redirect("/dashboard");
  return session;
}

export async function loadUser(session: SessionPayload | null): Promise<(User & { isNew?: boolean }) | null> {
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  return user ?? null;
}

/** Lightweight serializable profile used by client components. */
export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  image?: string | null;
  prefs: Record<string, unknown>;
};
