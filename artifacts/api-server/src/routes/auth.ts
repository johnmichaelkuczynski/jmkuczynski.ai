import { Router, type IRouter, type Request } from "express";
import crypto from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import { setSession, clearSession, getSession } from "../lib/session";
import { ADMIN_EMAIL } from "../lib/admin";

const router: IRouter = Router();

function redirectUri(req: Request): string {
  const proto = (req.headers["x-forwarded-proto"] as string)?.split(",")[0] || req.protocol;
  const host = (req.headers["x-forwarded-host"] as string)?.split(",")[0] || req.get("host");
  return `${proto}://${host}/api/auth/google/callback`;
}

function client(req: Request): OAuth2Client {
  return new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: redirectUri(req),
  });
}

router.get("/auth/google", (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  res.cookie("lr_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60 * 1000,
    path: "/",
  });
  const url = client(req).generateAuthUrl({
    scope: ["openid", "email", "profile"],
    state,
    prompt: "select_account",
  });
  res.redirect(url);
});

router.get("/auth/google/callback", async (req, res): Promise<void> => {
  const { code, state } = req.query as { code?: string; state?: string };
  const cookies = (req as Request & { cookies?: Record<string, string> }).cookies ?? {};
  res.clearCookie("lr_oauth_state", { path: "/" });

  if (!code || !state || state !== cookies["lr_oauth_state"]) {
    res.redirect("/?login=failed");
    return;
  }

  try {
    const oauth = client(req);
    const { tokens } = await oauth.getToken(code);
    if (!tokens.id_token) throw new Error("No id_token in token response");
    const ticket = await oauth.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) throw new Error("Incomplete Google profile");

    setSession(res, {
      sub: payload.sub,
      email: payload.email,
      name: payload.name ?? payload.email,
      picture: payload.picture,
    });
    res.redirect("/");
  } catch (err) {
    req.log.error({ err }, "Google OAuth callback failed");
    res.redirect("/?login=failed");
  }
});

router.get("/auth/me", (req, res) => {
  const user = getSession(req);
  if (!user) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }
  res.json({
    email: user.email,
    name: user.name,
    picture: user.picture ?? null,
    isAdmin: user.email.toLowerCase() === ADMIN_EMAIL,
  });
});

router.post("/auth/logout", (_req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

export default router;
