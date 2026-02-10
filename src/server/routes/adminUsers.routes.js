// src/server/routes/adminUsers.routes.js (ESM)
import express from "express";
import admin from "firebase-admin";

const router = express.Router();

/**
 * Domain config:
 * - Set PHONE_USER_DOMAIN in src/server/.env
 *   PHONE_USER_DOMAIN=phoneuser.nursinglecture.com
 */
const EMAIL_DOMAIN = (process.env.PHONE_USER_DOMAIN || "phoneuser.nursinglecture.com")
    .trim()
    .toLowerCase();
const EMAIL_SUFFIX = `@${EMAIL_DOMAIN}`;

/**
 * Verify Firebase ID token from Authorization: Bearer <token>
 */
async function verifyFirebaseToken(req, res, next) {
    try {
        const header = req.headers.authorization || "";
        const token = header.startsWith("Bearer ") ? header.slice(7) : null;
        if (!token) return res.status(401).send("Missing Bearer token");

        const decoded = await admin.auth().verifyIdToken(token);
        req.user = decoded;
        next();
    } catch (e) {
        console.error("verifyFirebaseToken error:", e);
        return res.status(401).send("Invalid token");
    }
}

/**
 * Basic admin allowlist by email
 * ADMIN_EMAILS=bvtnnaresh@gmail.com,other@gmail.com
 */
function isAdmin(decoded) {
    const allow = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

    return !!decoded?.email && allow.includes(decoded.email.toLowerCase());
}

router.use(verifyFirebaseToken);

/**
 * GET /api/admin/users
 * Lists users from Firestore "profiles" and filters only users with the configured domain
 */
router.get("/", async (req, res) => {
    try {
        if (!isAdmin(req.user)) return res.status(403).send("Forbidden");

        // Build a map of Firestore profiles keyed by uid
        const snap = await admin.firestore().collection("profiles").limit(1000).get();
        const profilesByUid = new Map();
        for (const d of snap.docs) {
            const x = d.data() || {};
            if (x.uid) profilesByUid.set(x.uid, { ...x, id: d.id });
        }

        // List all users from Firebase Auth
        const allUsers = [];
        let nextPageToken;
        do {
            const listResult = await admin.auth().listUsers(1000, nextPageToken);
            allUsers.push(...listResult.users);
            nextPageToken = listResult.pageToken;
        } while (nextPageToken);

        const users = allUsers.map((u) => {
            const profile = profilesByUid.get(u.uid) || {};
            return {
                uid: u.uid,
                phone: profile.phone || u.phoneNumber || null,
                email: u.email || profile.email || null,
                name: profile.name || u.displayName || null,
                courseName: profile.courseName || "",
                createdAt: u.metadata?.creationTime || null,
            };
        });

        console.log("[LIST USERS] Auth users:", allUsers.length, "Profiles:", snap.size);

        return res.json({ ok: true, users });
    } catch (e) {
        console.error("GET /api/admin/users error:", e);
        return res.status(500).send("Failed to list users");
    }
});

/**
 * POST /api/admin/users
 * Creates user in Firebase Auth + Firestore profiles
 * Body: { phone, password, name?, courseName }
 */
router.post("/", async (req, res) => {
    try {
        if (!isAdmin(req.user)) return res.status(403).send("Forbidden");

        // Safety check so we never accidentally create abs.local users again
        if (!EMAIL_DOMAIN.includes("nursinglecture.com")) {
            return res.status(500).send("PHONE_USER_DOMAIN is misconfigured");
        }

        const { phone, password, name, courseName } = req.body || {};
        const cleanPhone = String(phone || "").replace(/\D/g, "").slice(0, 10);

        if (!/^\d{10}$/.test(cleanPhone)) return res.status(400).send("Invalid phone");
        if (!password || String(password).length < 6) return res.status(400).send("Weak password");
        if (!courseName || String(courseName).trim().length < 2) {
            return res.status(400).send("Please enter course name");
        }

        const email = `${cleanPhone}${EMAIL_SUFFIX}`;
        console.log("[CREATE USER] domain:", EMAIL_DOMAIN, "email:", email);

        // ✅ Optional anti-duplicate: if profile exists, block creation
        const existingProfile = await admin.firestore().collection("profiles").doc(cleanPhone).get();
        if (existingProfile.exists) {
            const existingEmail = String(existingProfile.data()?.email || "").toLowerCase();
            // If the phone already exists with any email, stop duplicates
            return res.status(409).send(
                existingEmail
                    ? `This phone already exists (${existingEmail}).`
                    : "This phone already exists."
            );
        }

        // 1) Create Firebase Auth user
        let authUser;
        try {
            authUser = await admin.auth().createUser({
                email,
                password: String(password),
                displayName: name || cleanPhone,
            });
        } catch (e) {
            // Firebase Auth email duplication
            if (e?.code === "auth/email-already-exists") {
                return res.status(409).send("This mobile is already registered.");
            }
            throw e;
        }

        // 2) Create Firestore profile doc with docId = phone
        const profile = {
            uid: authUser.uid,
            phone: cleanPhone,
            email,
            name: name || "",
            courseName: String(courseName).trim(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await admin.firestore().collection("profiles").doc(cleanPhone).set(profile, { merge: true });

        return res.json({ ok: true, uid: authUser.uid, email, phone: cleanPhone });
    } catch (e) {
        console.error("POST /api/admin/users error:", e);
        return res.status(500).send(e?.message || "Failed to create user");
    }
});

export default router;
