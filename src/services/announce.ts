// src/services/announce.ts
export type AnnType = 'announcement' | 'info' | 'video' | 'pdf' | 'folder';

type AnnPayload = {
    audience: 'all' | string; // 'all' or 'course_xxx'
    title: string;
    body?: string;
    data?: Record<string, string | number | boolean | null | undefined>;

    // allow a strongly-typed optional "type" while keeping other keys flexible
    // data?: { type?: AnnType } & Record<string, string | number | boolean | null | undefined>;
};

// Read from Vite env, fall back to localhost
const BASE =
    import.meta.env.VITE_FCM_SENDER_URL ||
    (window as any).__SENDER_URL || // optional global override
    'http://localhost:5173';

export async function sendAnnouncement(payload: AnnPayload) {
    // always include deep-link hints for your app
    console.log('[announce] POST ', `${BASE}/api/fcm/announce`, payload);

    const merged = {
        ...payload,
        data: {
            nav: 'notifications',
            screen: 'notifications',
            // default to 'announcement' if not provided
            type: (payload.data?.type as AnnType | undefined | string) ?? 'announcement',
            ...payload.data,
        },
    };
    console.log('[announce] POST', `${BASE}/api/fcm/announce`, merged); // <= keep this log

    const res = await fetch(`${BASE}/api/fcm/announce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`FCM send failed: ${res.status} ${res.statusText} ${text}`);
    }
    return res.json();
}
