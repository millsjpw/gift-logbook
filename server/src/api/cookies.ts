import type { CookieOptions } from "express";
import { config } from "../config/runtime.js";

export const SESSION_COOKIE = "session";

export function sessionCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: config.session.duration * 1000, // convert seconds to milliseconds
    path: "/",
  };
}

export function clearCookieOptions(): CookieOptions {
  return { path: "/" };
}
