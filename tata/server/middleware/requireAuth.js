const { verifyToken } = require("@clerk/backend");

/**
 * Express middleware that verifies the Clerk session token from the
 * Authorization header and attaches req.clerkUserId.
 *
 * The client must send:  Authorization: Bearer <session-token>
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ error: "Missing auth token" });
    }

    // verifyToken is a standalone function — pass secretKey explicitly
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // sub is the Clerk User ID (e.g. "user_...")
    req.clerkUserId = payload.sub;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = requireAuth;
