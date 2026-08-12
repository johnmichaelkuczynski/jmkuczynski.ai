import type { Request, Response, NextFunction } from "express";
import { getSession } from "./session";

export const ADMIN_EMAIL = "johnmichaelkuczynski@gmail.com";

export function isAdmin(req: Request): boolean {
  const user = getSession(req);
  return !!user && user.email.toLowerCase() === ADMIN_EMAIL;
}

/** Only the site owner (signed in with the admin Google account) may proceed. */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!isAdmin(req)) {
    res.status(403).json({ error: "Only the site owner can make changes." });
    return;
  }
  next();
}
