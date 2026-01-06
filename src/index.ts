// // functions/src/index.ts
// import { setGlobalOptions } from 'firebase-functions/v2';
// import { onDocumentCreated } from 'firebase-functions/v2/firestore';
// import { initializeApp } from 'firebase-admin/app';
// import { getMessaging } from 'firebase-admin/messaging';

// setGlobalOptions({ region: 'asia-south1' }); // pick your region
// initializeApp();

// const s = (v: any) =>
//     v == null ? undefined : typeof v === 'string' ? v : JSON.stringify(v);

// const toStringData = (obj: any): Record<string, string> =>
//     Object.fromEntries(
//         Object.entries(obj || {}).map(([k, v]) => [k, s(v) ?? ''])
//     );

// export const onAnnouncementCreated = onDocumentCreated(
//     'announcements/{id}',
//     async (event) => {
//         const snap = event.data;
//         if (!snap) return;

//         const ann = snap.data();
//         if (!ann?.published) return; // only push if published

//         // Topic routing: "all" or course-specific
//         const audience = (ann.audience || 'all').toString().toLowerCase();
//         const topic = audience === 'all' ? 'all' : `course_${audience}`;

//         // Ensure strings for notification fields
//         const title = s(ann.title) || 'Announcement';
//         const body = s(ann.body) || '';

//         // Data must be strings for both FCM + Notifee
//         const baseData = {
//             nav: 'notifications',
//             screen: 'notifications',
//             type: (s(ann.type) || 'announcement') as string,
//         };
//         const extra = toStringData(ann.data || {});
//         if (ann.nodeId) extra.nodeId = String(ann.nodeId);
//         if (ann.url) extra.url = String(ann.url);

//         await getMessaging().send({
//             topic,
//             notification: { title, body },             // system banner even when app is closed
//             data: { ...baseData, ...extra },           // deep-link hints for your app
//             android: { priority: 'high' },
//             apns: { payload: { aps: { sound: 'default' } } },
//         });
//     }
// );// functions/src/index.ts
import { setGlobalOptions, logger } from "firebase-functions/v2";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onRequest } from "firebase-functions/v2/https";

import express from "express";
import cors from "cors";

import { initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

const adminUsersRoutes = require("./routes/adminUsers.routes");

initializeApp();
setGlobalOptions({ region: "asia-south1" });

// --------------------
// EXPRESS API (HTTPS)
// --------------------
const app = express();

// If you will call from your admin web (Vite), allow CORS.
// If you want to restrict: replace origin: true with your domain(s).
app.use(cors({ origin: true }));

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ Mount your route
app.use("/api/admin/users", adminUsersRoutes);

// ✅ Export HTTPS function
export const api = onRequest(app);

// --------------------
// FIRESTORE TRIGGER
// --------------------
const s = (v: any) =>
  v == null ? undefined : typeof v === "string" ? v : String(v);

const toStringData = (obj: any): Record<string, string> =>
  Object.fromEntries(Object.entries(obj || {}).map(([k, v]) => [k, s(v) ?? ""]));

export const onAnnouncementCreated = onDocumentCreated(
  "announcements/{id}",
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const ann = snap.data();

    const audience = (s(ann.audience) || "all").toLowerCase();
    const topic = audience === "all" ? "all" : `course_${audience}`;

    const title = s(ann.title) || "Announcement";
    const body = s(ann.body) || "";

    const baseData = {
      nav: "notifications",
      screen: "notifications",
      type: s(ann.type) || "info",
    };

    const extra = toStringData(ann.data || {});
    if (ann.nodeId) extra.nodeId = String(ann.nodeId);
    if (ann.url) extra.url = String(ann.url);

    logger.info("Pushing announcement", { topic, title, baseData, extra });

    await getMessaging().send({
      topic,
      notification: { title, body },
      data: { ...baseData, ...extra }, // must be strings
      android: { priority: "high" },
      apns: { payload: { aps: { sound: "default" } } },
    });
  }
);
