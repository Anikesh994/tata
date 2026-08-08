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
      return res.status(401).json({ success: false, message: "Missing auth token." });
    }

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    req.clerkUserId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
}

module.exports = requireAuth;
