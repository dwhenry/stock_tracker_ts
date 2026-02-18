import { SignJWT, jwtVerify } from "jose";
import type { IncomingMessage } from "node:http";
import type { NextApiResponse } from "next";

const COOKIE_NAME = "session";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-in-production"
);
const JWT_ISSUER = "stock-tracker";
const JWT_AUDIENCE = "stock-tracker";
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

export type JWTPayload = {
  sub: string; // user id
  email: string;
  role: "basic" | "admin";
  iat: number;
  exp: number;
};

export async function signToken(payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SEC}s`)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

/** Request-like object with cookies (NextApiRequest or GetServerSidePropsContext.req) */
type RequestWithCookies = IncomingMessage | { cookies?: Partial<Record<string, string>> };

function getTokenFromRequest(req: RequestWithCookies): string | undefined {
  const cookies = "cookies" in req && req.cookies ? req.cookies : undefined;
  if (!cookies || typeof cookies !== "object") return undefined;
  const session = (cookies as Record<string, string>)[COOKIE_NAME];
  return session;
}

export async function getSessionFromRequest(req: RequestWithCookies): Promise<JWTPayload | null> {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export function setSessionCookieRes(res: NextApiResponse, token: string): void {
  const secure = process.env.NODE_ENV === "production";
  res.setHeader("Set-Cookie", [
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SEC}${secure ? "; Secure" : ""}`,
  ]);
}

export function deleteSessionCookieRes(res: NextApiResponse): void {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

export function isAdmin(payload: JWTPayload): boolean {
  return payload.role === "admin";
}
