// // src/server/server.js  (ESM)
// import express from 'express';
// import cors from 'cors';
// import axios from 'axios';
// import dotenv from 'dotenv';
// import { GoogleAuth } from 'google-auth-library';
// import { fileURLToPath } from 'url';
// import path from 'path';
// import fs from 'fs';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // load .env that sits next to this file
// dotenv.config({ path: path.join(__dirname, '.env') });

// const PROJECT_ID = process.env.PROJECT_ID;
// if (!PROJECT_ID) {
//     throw new Error('PROJECT_ID missing in .env');
// }

// const FCM_ENDPOINT = `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`;

// /** Load service account creds, if provided */
// function readServiceAccountFromEnvOrFile() {
//     if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
//         try { return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON); }
//         catch { /* fall through */ }
//     }
//     const p = process.env.GOOGLE_APPLICATION_CREDENTIALS;
//     if (p && fs.existsSync(p)) {
//         const raw = fs.readFileSync(p, 'utf8');
//         return JSON.parse(raw);
//     }
//     return undefined; // use Application Default Credentials
// }

// const creds = readServiceAccountFromEnvOrFile();
// console.log(
//     'FCM sender using SA:',
//     creds?.client_email || '(none)',
//     'project:',
//     PROJECT_ID
// );

// async function getAccessToken() {
//     const auth = new GoogleAuth({
//         scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
//         credentials: creds, // undefined is fine (ADC)
//     });
//     const client = await auth.getClient();
//     const token = await client.getAccessToken();
//     return token.token;
// }

// const app = express();
// app.use(cors({ origin: true }));
// app.use(express.json());

// app.get('/', (_req, res) => res.json({ ok: true, service: 'fcm-sender' }));
// app.get('/api/fcm/ping', (_req, res) => res.json({ ok: true, project: PROJECT_ID }));

// // --- send to TOPIC -----------------------------------------------------------
// app.post('/api/fcm/announce', async (req, res) => {
//     try {
//         const { audience = 'all', title = 'Announcement', body = '', data = {} } = req.body || {};

//         // Normalize topic first (define BEFORE logging!)
//         const raw = String(audience).trim().toLowerCase();
//         const topic =
//             raw === 'all' ? 'all'
//                 : raw.startsWith('course_') ? raw
//                     : `course_${raw}`;

//         // strings-only data for FCM v1
//         const strData = Object.fromEntries(
//             Object.entries({
//                 nav: 'notifications',
//                 screen: 'notifications',
//                 type: data?.type ?? 'announcement',
//                 ...data,
//             }).map(([k, v]) => [k, v == null ? '' : String(v)])
//         );

//         console.log('[SEND topic]', { project: PROJECT_ID, topic, title, sa: creds?.client_email });

//         const payload = {
//             message: {
//                 topic,
//                 notification: { title: String(title), body: String(body) },
//                 data: strData,
//                 android: { priority: 'high' },
//                 apns: { payload: { aps: { sound: 'default' } } },
//             },
//         };

//         const accessToken = await getAccessToken();
//         const resp = await axios.post(FCM_ENDPOINT, payload, {
//             headers: { Authorization: `Bearer ${accessToken}` },
//         });

//         return res.status(200).json(resp.data); // contains `name: "projects/.../messages/..."`
//     } catch (err) {
//         const msg = err?.response?.data || err?.message || 'FCM send failed';
//         console.error('[SEND topic] error', msg);
//         return res.status(500).json({ error: msg });
//     }
// });

// // --- send to DEVICE TOKEN (for quick diagnostics) ---------------------------
// app.post('/api/fcm/testToken', async (req, res) => {
//     try {
//         const { token, title = 'Test', body = '', data = {} } = req.body || {};
//         if (!token) return res.status(400).json({ error: 'token required' });

//         const strData = Object.fromEntries(
//             Object.entries({
//                 nav: 'notifications',
//                 screen: 'notifications',
//                 type: data?.type ?? 'announcement',
//                 ...data,
//             }).map(([k, v]) => [k, v == null ? '' : String(v)])
//         );

//         console.log('[SEND token]', { project: PROJECT_ID, token: token.slice(0, 12) + '…' });

//         const payload = {
//             message: {
//                 token,
//                 notification: { title: String(title), body: String(body) },
//                 data: strData,
//                 android: { priority: 'high' },
//                 apns: { payload: { aps: { sound: 'default' } } },
//             },
//         };

//         const accessToken = await getAccessToken();
//         const resp = await axios.post(FCM_ENDPOINT, payload, {
//             headers: { Authorization: `Bearer ${accessToken}` },
//         });

//         return res.status(200).json(resp.data);
//     } catch (err) {
//         const msg = err?.response?.data || err?.message || 'FCM send failed';
//         console.error('[SEND token] error', msg);
//         return res.status(500).json({ error: msg });
//     }
// });

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => console.log(`FCM sender listening on :${PORT}`));


import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

import admin from "firebase-admin";
import adminUsersRoutes from "./routes/adminUsers.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, ".env") });

const PORT = process.env.PORT || 4000;

// ✅ Initialize Firebase Admin (required)
function initFirebaseAdmin() {
    if (admin.apps.length) return;

    // Option A: GOOGLE_APPLICATION_CREDENTIALS points to serviceAccountKey.json
    // Option B: Put SERVICE_ACCOUNT_PATH in .env
    const saPath =
        process.env.SERVICE_ACCOUNT_PATH ||
        process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (!saPath) {
        throw new Error(
            "Missing SERVICE_ACCOUNT_PATH or GOOGLE_APPLICATION_CREDENTIALS in .env"
        );
    }
    if (!fs.existsSync(saPath)) {
        throw new Error(`Service account file not found: ${saPath}`);
    }

    const serviceAccount = JSON.parse(fs.readFileSync(saPath, "utf8"));

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ firebase-admin initialized:", serviceAccount?.project_id);
}

initFirebaseAdmin();

// ✅ Express app
const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "2mb" }));

// Ping
app.get("/api/fcm/ping", (_req, res) => res.json({ ok: true }));

// Users API
app.use("/api/admin/users", adminUsersRoutes);
app.get("/api/debug/whoami", (_req, res) => {
    res.json({
        cwd: process.cwd(),
        file: import.meta.url,
        PHONE_USER_DOMAIN: process.env.PHONE_USER_DOMAIN || null,
    });
});

// Root
app.get("/", (_req, res) => res.json({ ok: true, service: "backend" }));

app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
