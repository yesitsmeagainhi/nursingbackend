// const raw = import.meta.env.VITE_ANNOUNCE_PUSH_URL || '';
// if (!raw) console.warn('VITE_ANNOUNCE_PUSH_URL is not set');
// const PUSH_URL = raw;

// export async function sendAnnouncementPush(input: {
//     id: string;
//     title: string;
//     body?: string;
//     audience?: string; // 'all' => topic 'announcements'
//     data?: Record<string, string | undefined>;
// }) {
//     if (!PUSH_URL) throw new Error('VITE_ANNOUNCE_PUSH_URL missing');

//     const topic = !input.audience || input.audience === 'all'
//         ? 'announcements'
//         : input.audience;

//     const payload = {
//         id: input.id,
//         title: input.title,
//         body: input.body || '',
//         topic,                    // backend should send to this topic
//         type: 'announcement',     // your app routes by this
//         screen: 'notifications',  // deep-link in app
//         ...(input.data || {}),
//     };

//     const res = await fetch(PUSH_URL, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//     });

//     if (!res.ok) {
//         const t = await res.text().catch(() => '');
//         throw new Error(`Push failed (${res.status}) ${t}`);
//     }
// }
// src/lib/notifyApi.ts
import { auth } from '../firebase/firebaseInstance';

export async function apiFetch(input: RequestInfo, init?: RequestInit) {
    const u = auth.currentUser;
    const token = u ? await u.getIdToken() : null;

    return fetch(input, {
        ...(init || {}),
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
    });
}
