import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  serverTimestamp, query, where, orderBy, getDocs, getDoc,
  Timestamp,
} from "firebase/firestore";
import { getDb } from "../firebase";
import { buildEmbedAndThumb, detectProvider, type Provider } from "../utils/url";

export type NodeType = "folder" | "video" | "pdf" | "link";

export type NodeDoc = {
  id?: string;
  type: NodeType;
  name: string;
  name_lowercase?: string; // Added field
  parentId: string | null;   // null = root
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
    name_lowercase: input.name.toLowerCase(), // Automatically set lowercase name
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

// Finds a node by its name within a specific parent folder.
async function findNodeByName(name: string, parentId: string | null): Promise<NodeDoc | null> {
  const q = query(
    NODES(),
    where("parentId", "==", parentId),
    where("name", "==", name)
  );
  const snap = await getDocs(q);
  if (snap.empty) {
    return null;
  }
  // Assuming name is unique within a parent
  const doc = snap.docs[0];
  return { id: doc.id, ...(doc.data() as NodeDoc) };
}

// This function now enriches the URL for videos and other links,
// ensuring that updates also get the correct embed and thumbnail URLs.
export async function updateNode(id: string, patch: Partial<NodeDoc>): Promise<void> {
  const ref = doc(getDb(), "nodes", id);
  const dataToUpdate: Partial<NodeDoc> = { ...patch };

  // If name is being updated, also update name_lowercase
  if (patch.name) {
    dataToUpdate.name_lowercase = patch.name.toLowerCase();
  }

  // If URL is being updated, re-enrich the data
  if (patch.type !== "folder" && patch.url) {
    dataToUpdate.provider = detectProvider(patch.url);
    const { embedUrl, thumbUrl } = buildEmbedAndThumb(patch.url);
    dataToUpdate.embedUrl = embedUrl || undefined;
    dataToUpdate.thumbUrl = thumbUrl || undefined;
  }

  const finalData = sanitize({
    ...dataToUpdate,
    parentId: patch.parentId === undefined ? undefined : (patch.parentId ?? null),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(ref, finalData as any);
}

// export async function deleteNode(id: string): Promise<void> {
//   const ref = doc(getDb(), "nodes", id);
//   await deleteDoc(ref);
// }
export async function deleteNode(id: string): Promise<void> {
  const ref = doc(getDb(), "nodes", id);  // Reference to the Firestore document
  await deleteDoc(ref);  // Deleting the document from Firestore
  console.log(`Document with ID ${id} deleted from Firestore.`);
}

// Recursive delete of a folder and all its descendants (use with confirmation)
// export async function recursiveDelete(id: string): Promise<void> {
//   const db = getDb();
//   const ref = doc(db, "nodes", id);
//   const snap = await getDoc(ref);
//   if (!snap.exists()) return;

//   const node = snap.data() as NodeDoc;
//   if (node.type !== "folder") {
//     await deleteDoc(ref);
//     return;
//   }
//   // collect children
//   const kids = await listChildren(id);
//   // batch deletes (depth-first)
//   for (const k of kids) {
//     if (k.type === "folder") {
//       await recursiveDelete(k.id!);
//     } else {
//       await deleteDoc(doc(db, "nodes", k.id!));
//     }
//   }
//   await deleteDoc(ref);
// }
export async function recursiveDelete(id: string): Promise<void> {
  const db = getDb();
  const ref = doc(db, "nodes", id);  // Firestore reference to the document
  const snap = await getDoc(ref);  // Get the document snapshot
  if (!snap.exists()) return;  // If the document doesn't exist, exit

  const node = snap.data() as NodeDoc;
  if (node.type !== "folder") {
    await deleteDoc(ref);  // If it's not a folder, delete it
    return;
  }

  // If it's a folder, delete all children first (depth-first)
  const children = await listChildren(id);
  for (const child of children) {
    if (child.type === "folder") {
      await recursiveDelete(child.id!);  // Recursively delete child folders
    } else {
      await deleteDoc(doc(db, "nodes", child.id!));  // Delete individual files/nodes
    }
  }

  // After deleting all children, delete the folder itself
  await deleteDoc(ref);
  console.log(`Folder with ID ${id} and all its contents deleted from Firestore.`);
}

// This is the core of the new logic. It now checks for existing nodes
// before creating new ones.
export async function bulkCreateNodes(
  data: any[],
  onProgress?: (percentage: number) => void
) {
  const pathIdCache = new Map<string, string | null>();
  pathIdCache.set("", null); // Root path

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const { path, type, name, url, order } = row;

    let parentId: string | null = null;

    // --- Part 1: Determine the Parent Folder ---
    if (path && typeof path === 'string' && path.trim()) {
      const pathParts = path.split('/');
      let currentPath = "";

      for (const part of pathParts) {
        const folderPath = currentPath ? `${currentPath}/${part}` : part;
        if (pathIdCache.has(folderPath)) {
          parentId = pathIdCache.get(folderPath)!;
          currentPath = folderPath;
        } else {
          const parentFolderId = pathIdCache.get(currentPath)!;

          // Check if folder already exists in Firestore before creating
          let existingFolder = await findNodeByName(part, parentFolderId);
          if (existingFolder) {
            pathIdCache.set(folderPath, existingFolder.id!);
            parentId = existingFolder.id!;
          } else {
            const newFolder: Omit<NodeDoc, "createdAt" | "updatedAt"> = {
              type: "folder",
              name: part,
              parentId: parentFolderId,
              order: 0,
              isActive: true,
            };
            const newFolderId = await createNode(newFolder);
            pathIdCache.set(folderPath, newFolderId);
            parentId = newFolderId;
          }
          currentPath = folderPath;
        }
      }
    } else {
      parentId = null; // Item is at the root
    }

    // --- Part 2: Upsert (Update or Insert) the Node ---
    const existingNode = await findNodeByName(name, parentId);

    const payload: Partial<NodeDoc> = {
      type,
      order: Number(order) || 0,
      isActive: true,
      url: url || undefined,
    };

    if (existingNode) {
      // If node exists, UPDATE it with the new data
      await updateNode(existingNode.id!, payload);
    } else {
      // If node does not exist, CREATE it
      await createNode({ ...payload, name, parentId } as Omit<NodeDoc, "createdAt" | "updatedAt">);
    }

    if (onProgress) {
      const percentage = ((i + 1) / data.length) * 100;
      onProgress(percentage);
    }
  }
}