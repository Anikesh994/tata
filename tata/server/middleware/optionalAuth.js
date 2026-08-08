/**
 * middleware/optionalAuth.js
 * Attaches req.clerkUserId if a valid Bearer token is present.
 * Does NOT block the request if no token is sent.
 * Used on routes that work for both guests and signed-in users.
 */

const { verifyToken } = require("@clerk/backend");

async function optionalAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (token) {
      const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
      req.clerkUserId = payload.sub;
    }
  } catch {
    // Invalid token — treat as unauthenticated, don't block
  }
  next();
}

module.exports = optionalAuth;
