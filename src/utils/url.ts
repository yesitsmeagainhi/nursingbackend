export type Provider = "youtube" | "drive" | "gdocs" | "custom";

export function detectProvider(raw: string): Provider {
  const s = (raw || "").toLowerCase();
  if (s.includes("youtu.be") || s.includes("youtube.com")) return "youtube";
  if (s.includes("drive.google.com")) return "drive";
  if (s.includes("docs.google.com")) return "gdocs";
  return "custom";
}

export function buildEmbedAndThumb(url: string): { embedUrl?: string; thumbUrl?: string } {
  const p = detectProvider(url);
  try {
    const u = new URL(url);
    if (p === "youtube") {
      let id = "";
      if (u.hostname.includes("youtu.be")) id = u.pathname.slice(1);
      else id = u.searchParams.get("v") || "";
      if (!id) {
        const m = u.pathname.match(/\/embed\/([^/]+)/);
        if (m) id = m[1];
      }
      const embedUrl = `https://www.youtube.com/embed/${id}`;
      const thumbUrl = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      return { embedUrl, thumbUrl };
    }
    if (p === "drive") {
      // try to extract file id: /file/d/<id>/view
      const m = url.match(/\/file\/d\/([^/]+)/);
      const id = m?.[1];
      const embedUrl = id
        ? `https://drive.google.com/file/d/${id}/preview`
        : url;
      const thumbUrl = id
        ? `https://drive.google.com/thumbnail?id=${id}`
        : undefined;
      return { embedUrl, thumbUrl };
    }
    if (p === "gdocs") {
      // let Google Docs/Sheets/Slides viewer handle it
      return { embedUrl: url };
    }
    // custom: nothing fancy
    return {};
  } catch {
    return {};
  }
}
