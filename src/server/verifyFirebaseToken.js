const admin = require("firebase-admin");

module.exports = async function verifyFirebaseToken(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).send("Missing Bearer token");

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // { uid, email, ... }
    next();
  } catch (e) {
    console.error("verifyFirebaseToken error:", e);
    return res.status(401).send("Invalid token");
  }
};
