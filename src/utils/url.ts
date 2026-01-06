// src/utils/url.ts
export type Provider = "youtube" | "gdrive" | "direct" | "unknown";

/** Parse a pasted video URL and return lightweight metadata (NO embedUrl). */
export function parseVideoUrl(raw: string): {
  provider: Provider;
  url: string;           // original, untouched
  videoId?: string;      // for YouTube
  driveId?: string;      // for Google Drive
  directUrl?: string;    // if the URL is a direct mp4/m3u8/mov
  thumbUrl?: string;     // optional: YouTube thumb only (safe to keep)
} {
  const url = (raw || "").trim();
  const out: ReturnType<typeof parseVideoUrl> = { provider: "unknown", url };

  if (!url) return out;

  try {
    const u = new URL(url);
    const host = (u.hostname || "").replace(/^www\./, "");

    // ---- YouTube ----
    if (host === "youtu.be") {
      out.provider = "youtube";
      out.videoId = u.pathname.slice(1);
      if (out.videoId) out.thumbUrl = `https://img.youtube.com/vi/${out.videoId}/hqdefault.jpg`;
      return out;
    }
    if (host.endsWith("youtube.com")) {
      out.provider = "youtube";
      if (u.pathname === "/watch") {
        out.videoId = u.searchParams.get("v") || undefined;
      } else if (u.pathname.startsWith("/shorts/")) {
        out.videoId = u.pathname.split("/")[2];
      } else if (u.pathname.startsWith("/embed/")) {
        out.videoId = u.pathname.split("/")[2];
      }
      if (out.videoId) out.thumbUrl = `https://img.youtube.com/vi/${out.videoId}/hqdefault.jpg`;
      return out;
    }

    // ---- Google Drive ----
    if (host.endsWith("drive.google.com")) {
      out.provider = "gdrive";
      const m = u.pathname.match(/\/file\/d\/([^/]+)/);
      out.driveId = (m && m[1]) || u.searchParams.get("id") || undefined;
      return out;
    }

    // ---- Direct files (.mp4/.m3u8/.mov) ----
    if (/\.(mp4|m3u8|mov)(\?|#|$)/i.test(u.pathname)) {
      out.provider = "direct";
      out.directUrl = url;
      return out;
    }

    // Unknown → keep original url only
    return out;
  } catch {
    return out;
  }
}

/** Convenience for saving: minimal fields to persist alongside your node. */
export function buildMetaForSave(url: string) {
  const meta = parseVideoUrl(url);
  // NOTE: NO embedUrl here on purpose.
  // Safe fields to store:
  const { provider, videoId, driveId, thumbUrl } = meta;
  return { provider, videoId, driveId, thumbUrl };
}

/** Optional preview link for admin table (no embeds). */
export function previewHrefFromMeta(row: {
  url?: string;
  provider?: Provider;
  videoId?: string;
  driveId?: string;
}) {
  if (row?.provider === "youtube" && row?.videoId) {
    return `https://www.youtube.com/watch?v=${row.videoId}`;
  }
  if (row?.provider === "gdrive" && row?.driveId) {
    return `https://drive.google.com/file/d/${row.driveId}/view`;
  }
  return row?.url || "#";
}
