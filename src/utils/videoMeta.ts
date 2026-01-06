// utils/videoMeta.ts
export type Provider = "youtube" | "drive" | "gdocs" | "custom";

export function detectProvider(raw: string): Provider {
    const s = (raw || "").toLowerCase();
    if (s.includes("youtu.be") || s.includes("youtube.com")) return "youtube";
    if (s.includes("drive.google.com")) return "drive";
    if (s.includes("docs.google.com")) return "gdocs";
    return "custom";
}

export type VideoMeta = {
    provider: Provider;
    url: string;        // original URL (unchanged)
    videoId?: string;   // YouTube id if detected
    driveId?: string;   // Google Drive file id if detected
    thumbUrl?: string;  // optional thumbnail you can show in lists
};

/**
 * Build meta WITHOUT creating any embed URL.
 * Use this in your admin save flow and store the returned fields on the node.
 */
export function buildVideoMeta(url: string): VideoMeta {
    const provider = detectProvider(url);
    const meta: VideoMeta = { provider, url };

    try {
        const u = new URL(url);
        const host = (u.hostname || "").replace(/^www\./, "");

        if (provider === "youtube") {
            let id = "";
            if (host === "youtu.be") {
                id = u.pathname.replace("/", "");
            } else if (u.pathname === "/watch") {
                id = u.searchParams.get("v") || "";
            } else if (u.pathname.startsWith("/shorts/")) {
                id = u.pathname.split("/")[2] || "";
            } else if (u.pathname.startsWith("/embed/")) {
                id = u.pathname.split("/")[2] || "";
            }
            if (id) {
                meta.videoId = id;
                meta.thumbUrl = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
            }
        }

        if (provider === "drive") {
            const m1 = u.pathname.match(/\/file\/d\/([^/]+)/);
            const id1 = m1?.[1];
            const id2 = u.searchParams.get("id");
            const id = id1 || id2 || "";
            if (id) {
                meta.driveId = id;
                // NOTE: Drive thumbs may need auth depending on file privacy
                meta.thumbUrl = `https://drive.google.com/thumbnail?id=${id}`;
            }
        }

        // gdocs/custom: nothing else to parse
    } catch {
        // keep what we have
    }

    return meta;
}

/**
 * Back-compat shim so existing imports keep working.
 * Previously returned { embedUrl?, thumbUrl? } and forced embedding.
 * Now it NEVER returns an embedUrl (undefined) and adds parsed meta.
 */
export function buildEmbedAndThumb(url: string): {
    embedUrl?: undefined;           // <- always undefined now
    thumbUrl?: string;
    provider: Provider;
    url: string;
    videoId?: string;
    driveId?: string;
} {
    const meta = buildVideoMeta(url);
    return {
        embedUrl: undefined,          // do not force embedding anymore
        thumbUrl: meta.thumbUrl,
        provider: meta.provider,
        url: meta.url,
        videoId: meta.videoId,
        driveId: meta.driveId,
    };
}
