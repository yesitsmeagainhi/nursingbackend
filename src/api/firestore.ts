import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  serverTimestamp, query, where, orderBy, getDocs, getDoc,
  Timestamp, writeBatch
} from "firebase/firestore";
import { getDb } from "../firebase";
import { buildEmbedAndThumb, detectProvider, type Provider } from "../utils/url";

export type NodeType = "folder" | "video" | "pdf" | "link";

export type NodeDoc = {
  id?: string;
  type: NodeType;
  name: string;
  parentId: string | null;  // null = root
  order: number;
  isActive: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;

  // files:
  url?: string;
  provider?: Provider;
  embedUrl?: string;
  thumbUrl?: string;
  mime?: string;
};

const NODES = () => collection(getDb(), "nodes");

// --- utils ---
function sanitize<T extends object>(obj: T): T {
  const out: any = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined) out[k] = v;
  });
  return out;
}

export async function listChildren(parentId: string | null): Promise<NodeDoc[]> {
  const q = query(
    NODES(),
    where("parentId", "==", parentId),
    orderBy("order", "asc"),
    orderBy("name", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as NodeDoc) }));
}

export async function getMaxOrder(parentId: string | null): Promise<number> {
  const items = await listChildren(parentId);
  return items.length ? Math.max(...items.map(i => i.order ?? 0)) : 0;
}

export async function createNode(input: Omit<NodeDoc, "createdAt" | "updatedAt">): Promise<string> {
  const now = serverTimestamp();
  const payload: NodeDoc = sanitize({
    ...input,
    parentId: input.parentId ?? null,
    createdAt: now,
    updatedAt: now,
  });

  // files → enrich
  if (payload.type !== "folder" && payload.url) {
    payload.provider = detectProvider(payload.url);
    const { embedUrl, thumbUrl } = buildEmbedAndThumb(payload.url);
    if (embedUrl) payload.embedUrl = embedUrl;
    if (thumbUrl) payload.thumbUrl = thumbUrl;
  }

  const ref = await addDoc(NODES(), payload);
  return ref.id;
}

export async function updateNode(id: string, patch: Partial<NodeDoc>): Promise<void> {
  const ref = doc(getDb(), "nodes", id);
  const data = sanitize({
    ...patch,
    parentId: patch.parentId === undefined ? undefined : (patch.parentId ?? null),
    updatedAt: serverTimestamp(),
  });
  await updateDoc(ref, data as any);
}

export async function deleteNode(id: string): Promise<void> {
  const ref = doc(getDb(), "nodes", id);
  await deleteDoc(ref);
}

// Recursive delete of a folder and all its descendants (use with confirmation)
export async function recursiveDelete(id: string): Promise<void> {
  const db = getDb();
  const ref = doc(db, "nodes", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const node = snap.data() as NodeDoc;
  if (node.type !== "folder") {
    await deleteDoc(ref);
    return;
  }
  // collect children
  const kids = await listChildren(id);
  // batch deletes (depth-first)
  for (const k of kids) {
    if (k.type === "folder") {
      await recursiveDelete(k.id!);
    } else {
      await deleteDoc(doc(db, "nodes", k.id!));
    }
  }
  await deleteDoc(ref);
}
