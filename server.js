// import express from "express";
// import cors from "cors";

// const app = express();
// app.use(cors());
// app.use(express.json());

// app.get("/api/fcm/ping", (req, res) => {
//   res.json({ ok: true, ts: new Date().toISOString() });
// });

// app.get("/api/admin/users", (req, res) => {
//   res.json({ users: [] });
// });

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => console.log("✅ API running on http://localhost:" + PORT));
import express from "express";
import cors from "cors";
import { adminAuth, db } from "./firebaseAdmin.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/fcm/ping", (req, res) => {
    res.json({ ok: true, ts: new Date().toISOString() });
});

// ✅ Verify Firebase ID token
async function requireAuth(req, res, next) {
    const h = req.headers.authorization || "";
    const m = h.match(/^Bearer (.+)$/);
    if (!m) return res.status(401).json({ error: "Missing Authorization Bearer token" });

    try {
        req.user = await adminAuth.verifyIdToken(m[1]);
        next();
    } catch (e) {
        return res.status(401).json({ error: "Invalid/expired token" });
    }
}

function toISO(v) {
    if (!v) return null;
    // Firestore Timestamp
    if (typeof v.toDate === "function") return v.toDate().toISOString();
    // already string/date
    try { return new Date(v).toISOString(); } catch { return null; }
}

// ✅ GET users from Firebase Auth + Firestore "profiles"
app.get("/api/admin/users", requireAuth, async (req, res) => {
    try {
        // 1) Read profiles from Firestore
        // IMPORTANT: change "profiles" if your collection name is different
        const snap = await db.collection("nodes").limit(1000).get();
        const profilesByUid = new Map(snap.docs.map(d => [d.id, d.data()]));

        // 2) Read users from Firebase Auth
        const authList = await adminAuth.listUsers(1000);

        // 3) Merge
        const users = authList.users.map(u => {
            const p = profilesByUid.get(u.uid) || {};
            return {
                uid: u.uid,
                phone: u.phoneNumber || p.phone || "",
                email: u.email || p.email || "",
                name: p.name || u.displayName || "",
                courseName: p.courseName || "",
                createdAt: toISO(p.createdAt) || (u.metadata?.creationTime ? new Date(u.metadata.creationTime).toISOString() : null),
            };
        });

        res.json({ users });
    } catch (e) {
        res.status(500).json({ error: e?.message || "Failed to load users" });
    }
});
app.post("/api/admin/users", requireAuth, async (req, res) => {
    try {
        const { phone, password, name, courseName } = req.body || {};

        // basic validation
        const digits = String(phone || "").replace(/\D/g, "");
        if (!/^\d{10}$/.test(digits)) {
            return res.status(400).json({ error: "Phone must be 10 digits" });
        }
        if (!password || String(password).length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        const normalizedCourse = String(courseName || "").trim();
        if (normalizedCourse.length < 2) {
            return res.status(400).json({ error: "Course name is required" });
        }

        // ✅ Create a unique email from phone (as your UI indicates)
        const email = `${digits}@phoneuser.nursinglecture.com`;

        // ✅ Create user in Firebase Auth
        const userRecord = await adminAuth.createUser({
            email,
            password: String(password),
            displayName: name ? String(name).trim() : undefined,
            // If you want phoneNumber in Auth, it must be E.164 format:
            // phoneNumber: `+91${digits}`,
        });

        const uid = userRecord.uid;

        // ✅ Create/merge profile in Firestore
        // IMPORTANT: Use same collection name you used in GET route ("profiles" or "users")
        await db.collection("profiles").doc(uid).set(
            {
                uid,
                phone: digits,
                email,
                name: name ? String(name).trim() : "",
                courseName: normalizedCourse,
                createdAt: new Date(),
            },
            { merge: true }
        );

        return res.json({ ok: true, uid, email });
    } catch (e) {
        // common: email already exists
        return res.status(500).json({ error: e?.message || "Create user failed" });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("✅ API running on http://localhost:" + PORT));
