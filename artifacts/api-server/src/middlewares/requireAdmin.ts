import { type Request, type Response, type NextFunction } from "express";

const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!ADMIN_USER_ID || req.user?.id !== ADMIN_USER_ID) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  next();
}
