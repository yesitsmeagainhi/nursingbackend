// // src/api/firestore.ts
// import {
//   collection, addDoc, updateDoc, deleteDoc, doc,
//   serverTimestamp, query, where, orderBy, getDocs, getDoc,
//   Timestamp,
// } from "firebase/firestore";
// import { getDb } from "../firebase";
// // NOTE: no buildEmbedAndThumb import anymore
// import { buildMetaForSave, type Provider } from "../utils/url";

// export type NodeType = "folder" | "video" | "pdf" | "link";

// export type NodeDoc = {
//   id?: string;
//   type: NodeType;
//   name: string;
//   name_lowercase?: string;
//   parentId: string | null; // null = root
//   order: number;
//   isActive: boolean;
//   createdAt?: Timestamp;
//   updatedAt?: Timestamp;

//   // files:
//   url?: string;
//   provider?: Provider; // "youtube" | "gdrive" | "direct" | "unknown"
//   // embedUrl?: string; // ❌ removed
//   thumbUrl?: string;   // optional (YouTube)
//   videoId?: string;    // YouTube
//   driveId?: string;    // Google Drive
//   cdnUrl?: string;     // optional: if you later mirror to Storage/CDN
//   mime?: string;
// };

// const NODES = () => collection(getDb(), "nodes");

// // --- helpers ---
// function onlyDefined<T extends object>(obj: T): Partial<T> {
//   const out: any = {};
//   Object.entries(obj).forEach(([k, v]) => {
//     if (v !== undefined) out[k] = v;
//   });
//   return out;
// }

// export async function listChildren(parentId: string | null): Promise<NodeDoc[]> {
//   const q = query(
//     NODES(),
//     where("parentId", "==", parentId),
//     orderBy("order", "asc"),
//     orderBy("name", "asc"),
//   );
//   const snap = await getDocs(q);
//   return snap.docs.map(d => ({ id: d.id, ...(d.data() as NodeDoc) }));
// }

// export async function getMaxOrder(parentId: string | null): Promise<number> {
//   const items = await listChildren(parentId);
//   return items.length ? Math.max(...items.map(i => i.order ?? 0)) : 0;
// }

// <<<<<<< HEAD
// export async function createNode(input: Omit<NodeDoc, "createdAt" | "updatedAt">): Promise<string> {
// =======
// /**
//  * Create a node.
//  * We DO NOT store embedUrl. Only raw url + lightweight meta.
//  */
// export async function createNode(
//   input: Omit<NodeDoc, 'createdAt' | 'updatedAt'>
// ): Promise<string> {
// >>>>>>> 29295a6 (Update in Project files)
//   const now = serverTimestamp();

//   // Build base (no sanitize yet)
//   const base: NodeDoc = {
//     ...input,
//     name_lowercase: input.name.toLowerCase(), // Automatically set lowercase name
//     parentId: input.parentId ?? null,
//     createdAt: now as any,
//     updatedAt: now as any,
//   };

// <<<<<<< HEAD
//   // files → enrich
//   if (payload.type !== "folder" && payload.url) {
//     payload.provider = detectProvider(payload.url);
//     const { embedUrl, thumbUrl } = buildEmbedAndThumb(payload.url);
//     if (embedUrl) payload.embedUrl = embedUrl;
//     if (thumbUrl) payload.thumbUrl = thumbUrl;
// =======
//   // Merge in lightweight meta (but ONLY defined keys)
//   let payload: any = { ...base };
//   if (base.type !== 'folder' && base.url) {
//     const meta = buildMetaForSave(base.url);
//     payload = {
//       ...payload,
//       ...onlyDefined({
//         provider: meta.provider,   // always defined
//         videoId: meta.videoId,     // only if present
//         driveId: meta.driveId,     // only if present
//         thumbUrl: meta.thumbUrl,   // only if present
//       }),
//     };
// >>>>>>> 29295a6 (Update in Project files)
//   }

//   const finalPayload = onlyDefined(payload); // ensure no undefined reaches Firestore
//   const ref = await addDoc(NODES(), finalPayload);
//   return ref.id;
// }

// <<<<<<< HEAD
// // Finds a node by its name within a specific parent folder.
// async function findNodeByName(name: string, parentId: string | null): Promise<NodeDoc | null> {
//   const q = query(
//     NODES(),
//     where("parentId", "==", parentId),
//     where("name", "==", name)
//   );
//   const snap = await getDocs(q);
//   if (snap.empty) {
//     return null;
//   }
//   // Assuming name is unique within a parent
//   const doc = snap.docs[0];
//   return { id: doc.id, ...(doc.data() as NodeDoc) };
// }

// // This function now enriches the URL for videos and other links,
// // ensuring that updates also get the correct embed and thumbnail URLs.
// export async function updateNode(id: string, patch: Partial<NodeDoc>): Promise<void> {
//   const ref = doc(getDb(), "nodes", id);
//   const dataToUpdate: Partial<NodeDoc> = { ...patch };
// =======
// /**
//  * Update a node.
//  * If url changes, recompute lightweight meta (no embedUrl).
//  */
// export async function updateNode(
//   id: string,
//   patch: Partial<NodeDoc>
// ): Promise<void> {
//   const ref = doc(getDb(), "nodes", id);
//   let dataToUpdate: Partial<NodeDoc> = { ...patch };
// >>>>>>> 29295a6 (Update in Project files)

//   // If name is being updated, also update name_lowercase
//   if (patch.name) {
//     dataToUpdate.name_lowercase = patch.name.toLowerCase();
//   }

// <<<<<<< HEAD
//   // If URL is being updated, re-enrich the data
//   if (patch.type !== "folder" && patch.url) {
//     dataToUpdate.provider = detectProvider(patch.url);
//     const { embedUrl, thumbUrl } = buildEmbedAndThumb(patch.url);
//     dataToUpdate.embedUrl = embedUrl || undefined;
//     dataToUpdate.thumbUrl = thumbUrl || undefined;
// =======
//   if (patch.type !== "folder" && patch.url) {
//     const meta = buildMetaForSave(patch.url);
//     dataToUpdate = {
//       ...dataToUpdate,
//       ...onlyDefined({
//         provider: meta.provider,
//         videoId: meta.videoId,
//         driveId: meta.driveId,
//         thumbUrl: meta.thumbUrl,
//       }),
//     };
// >>>>>>> 29295a6 (Update in Project files)
//   }

//   const finalData = onlyDefined({
//     ...dataToUpdate,
//     parentId: patch.parentId === undefined ? undefined : (patch.parentId ?? null),
//     updatedAt: serverTimestamp() as any,
//   });

//   await updateDoc(ref, finalData as any);
// }

// export async function deleteNode(id: string): Promise<void> {
//   const ref = doc(getDb(), "nodes", id);
//   await deleteDoc(ref);
//   console.log(`Document with ID ${id} deleted from Firestore.`);
// }

// <<<<<<< HEAD
// =======
// /** Recursive delete of a folder and all its descendants (depth-first). */
// >>>>>>> 29295a6 (Update in Project files)
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

//   const children = await listChildren(id);
//   for (const child of children) {
//     if (child.type === "folder") {
//       await recursiveDelete(child.id!);
//     } else {
//       await deleteDoc(doc(db, "nodes", child.id!));
//     }
//   }
// <<<<<<< HEAD
// =======

// >>>>>>> 29295a6 (Update in Project files)
//   await deleteDoc(ref);
//   console.log(`Folder with ID ${id} and all its contents deleted from Firestore.`);
// }

// <<<<<<< HEAD
// =======
// /**
//  * Bulk create/update.
//  * Relies on createNode/updateNode which already set metadata and avoid embedUrl.
//  */
// >>>>>>> 29295a6 (Update in Project files)
// export async function bulkCreateNodes(
//   data: any[],
//   onProgress?: (percentage: number) => void
// ) {
//   const pathIdCache = new Map<string, string | null>();
//   pathIdCache.set("", null); // Root path

//   for (let i = 0; i < data.length; i++) {
//     const row = data[i];
//     const { path, type, name, url, order } = row;

//     let parentId: string | null = null;

//     if (path && typeof path === 'string' && path.trim()) {
//       const pathParts = path.split('/');
//       let currentPath = "";

//       for (const part of pathParts) {
//         const folderPath = currentPath ? `${currentPath}/${part}` : part;
//         if (pathIdCache.has(folderPath)) {
//           parentId = pathIdCache.get(folderPath)!;
//           currentPath = folderPath;
//         } else {
//           const parentFolderId = pathIdCache.get(currentPath)!;
//           let existingFolder = await findNodeByName(part, parentFolderId);
//           if (existingFolder) {
//             pathIdCache.set(folderPath, existingFolder.id!);
//             parentId = existingFolder.id!;
//           } else {
//             const newFolder: Omit<NodeDoc, "createdAt" | "updatedAt"> = {
//               type: "folder",
//               name: part,
//               parentId: parentFolderId,
//               order: 0,
//               isActive: true,
//             };
//             const newFolderId = await createNode(newFolder);
//             pathIdCache.set(folderPath, newFolderId);
//             parentId = newFolderId;
//           }
//           currentPath = folderPath;
//         }
//       }
//     } else {
//       parentId = null;
//     }

//     const existingNode = await findNodeByName(name, parentId);
//     const payload: Partial<NodeDoc> = {
//       type,
//       order: Number(order) || 0,
//       isActive: true,
//       url: url || undefined, // meta added by createNode/updateNode
//     };

//     if (existingNode) {
//       await updateNode(existingNode.id!, payload);
//     } else {
//       await createNode({ ...payload, name, parentId } as Omit<NodeDoc, "createdAt" | "updatedAt">);
//     }

//     if (onProgress) {
//       const percentage = ((i + 1) / data.length) * 100;
//       onProgress(percentage);
//     }
//   }
// }

// /** Helper used by bulkCreateNodes. */
// export async function findNodeByName(name: string, parentId: string | null): Promise<NodeDoc | null> {
//   const q = query(
//     NODES(),
//     where("parentId", "==", parentId),
//     where("name_lowercase", "==", name.toLowerCase()),
//     orderBy("order", "asc")
//   );
//   const snap = await getDocs(q);
//   if (snap.empty) return null;
//   const d = snap.docs[0];
//   return { id: d.id, ...(d.data() as NodeDoc) };
// }

// src/api/firestore.ts
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { getDb } from "../firebase";
import { buildMetaForSave, type Provider } from "../utils/url";

export type NodeType = "folder" | "video" | "pdf" | "link";

export type NodeDoc = {
  id?: string;
  type: NodeType;
  name: string;
  name_lowercase?: string;
  parentId: string | null; // null = root
  order: number;
  isActive: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;

  // files:
  url?: string;
  provider?: Provider; // "youtube" | "gdrive" | "direct" | "unknown"
  thumbUrl?: string; // optional (YouTube)
  videoId?: string; // YouTube
  driveId?: string; // Google Drive
  cdnUrl?: string; // optional: if you later mirror to Storage/CDN
  mime?: string;
};

const NODES = () => collection(getDb(), "nodes");

// --- helpers ---
function onlyDefined<T extends object>(obj: T): Partial<T> {
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
    orderBy("name", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as NodeDoc) }));
}

export async function getMaxOrder(parentId: string | null): Promise<number> {
  const items = await listChildren(parentId);
  return items.length ? Math.max(...items.map((i) => i.order ?? 0)) : 0;
}

/**
 * Create a node.
 * We DO NOT store embedUrl. Only raw url + lightweight meta.
 */
export async function createNode(
  input: Omit<NodeDoc, "createdAt" | "updatedAt">
): Promise<string> {
  const now = serverTimestamp();

  const base: NodeDoc = {
    ...input,
    name_lowercase: input.name.toLowerCase(),
    parentId: input.parentId ?? null,
    createdAt: now as any,
    updatedAt: now as any,
  };

  // Merge lightweight meta for non-folder urls
  let payload: any = { ...base };
  if (base.type !== "folder" && base.url) {
    const meta = buildMetaForSave(base.url);
    payload = {
      ...payload,
      ...onlyDefined({
        provider: meta.provider,
        videoId: meta.videoId,
        driveId: meta.driveId,
        thumbUrl: meta.thumbUrl,
      }),
    };
  }

  const finalPayload = onlyDefined(payload);
  const ref = await addDoc(NODES(), finalPayload);
  return ref.id;
}

/**
 * Update a node.
 * If url changes, recompute lightweight meta (no embedUrl).
 */
export async function updateNode(id: string, patch: Partial<NodeDoc>): Promise<void> {
  const ref = doc(getDb(), "nodes", id);
  let dataToUpdate: Partial<NodeDoc> = { ...patch };

  if (patch.name) {
    dataToUpdate.name_lowercase = patch.name.toLowerCase();
  }

  if (patch.type !== "folder" && patch.url) {
    const meta = buildMetaForSave(patch.url);
    dataToUpdate = {
      ...dataToUpdate,
      ...onlyDefined({
        provider: meta.provider,
        videoId: meta.videoId,
        driveId: meta.driveId,
        thumbUrl: meta.thumbUrl,
      }),
    };
  }

  const finalData = onlyDefined({
    ...dataToUpdate,
    parentId: patch.parentId === undefined ? undefined : patch.parentId ?? null,
    updatedAt: serverTimestamp() as any,
  });

  await updateDoc(ref, finalData as any);
}

export async function deleteNode(id: string): Promise<void> {
  const ref = doc(getDb(), "nodes", id);
  await deleteDoc(ref);
  console.log(`Document with ID ${id} deleted from Firestore.`);
}

/** Recursive delete of a folder and all its descendants (depth-first). */
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

  const children = await listChildren(id);
  for (const child of children) {
    if (child.type === "folder") {
      await recursiveDelete(child.id!);
    } else {
      await deleteDoc(doc(db, "nodes", child.id!));
    }
  }

  await deleteDoc(ref);
  console.log(`Folder with ID ${id} and all its contents deleted from Firestore.`);
}

/**
 * Bulk create/update.
 * Relies on createNode/updateNode which already set metadata and avoid embedUrl.
 */
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

    if (path && typeof path === "string" && path.trim()) {
      const pathParts = path.split("/");
      let currentPath = "";

      for (const part of pathParts) {
        const folderPath = currentPath ? `${currentPath}/${part}` : part;

        if (pathIdCache.has(folderPath)) {
          parentId = pathIdCache.get(folderPath)!;
          currentPath = folderPath;
          continue;
        }

        const parentFolderId = pathIdCache.get(currentPath)!;

        const existingFolder = await findNodeByName(part, parentFolderId);
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
    } else {
      parentId = null;
    }

    const existingNode = await findNodeByName(name, parentId);

    const payload: Partial<NodeDoc> = {
      type,
      order: Number(order) || 0,
      isActive: true,
      url: url || undefined, // meta added by createNode/updateNode
    };

    if (existingNode) {
      await updateNode(existingNode.id!, payload);
    } else {
      await createNode({
        ...(payload as any),
        name,
        parentId,
      } as Omit<NodeDoc, "createdAt" | "updatedAt">);
    }

    if (onProgress) {
      const percentage = ((i + 1) / data.length) * 100;
      onProgress(percentage);
    }
  }
}

/** Helper used by bulkCreateNodes. */
export async function findNodeByName(
  name: string,
  parentId: string | null
): Promise<NodeDoc | null> {
  const q = query(
    NODES(),
    where("parentId", "==", parentId),
    where("name_lowercase", "==", name.toLowerCase())
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as NodeDoc) };
}
