// import React, { useEffect, useMemo, useState } from "react";
// import type { NodeType, NodeDoc } from "../api/firestore";
// import { createNode, getMaxOrder } from "../api/firestore";

// type Props = {
//   open: boolean;
//   parentId: string | null;
//   defaultType?: NodeType;
//   onClose: () => void;
//   onCreated?: (id: string) => void;
// };

// const TYPES: NodeType[] = ["folder", "video", "pdf", "link"];

// export default function CreateModal({ open, parentId, defaultType = "folder", onClose, onCreated }: Props) {
//   const [type, setType] = useState<NodeType>(defaultType);
//   const [name, setName] = useState("");
//   const [url, setUrl] = useState("");
//   const [order, setOrder] = useState<number>(0);
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     if (!open) return;
//     setType(defaultType);
//     setName("");
//     setUrl("");
//     (async () => {
//       const max = await getMaxOrder(parentId ?? null);
//       setOrder(max + 1);
//     })();
//   }, [open, parentId, defaultType]);

//   const requiresUrl = type !== "folder";

//   async function handleSave() {
//     if (!name.trim()) return;
//     setSaving(true);
//     const payload: Omit<NodeDoc, "createdAt" | "updatedAt"> = {
//       type,
//       name: name.trim(),
//       parentId: parentId ?? null,
//       order,
//       isActive: true,
//       url: requiresUrl ? url.trim() : undefined,
//     };
//     const id = await createNode(payload);
//     setSaving(false);
//     onCreated?.(id);
//     onClose();
//   }

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-2xl p-5 w-full max-w-lg shadow-xl">
//         <h3 className="text-lg font-semibold mb-4">Create new</h3>

//         <div className="grid gap-3">
//           <label className="text-sm">Type</label>
//           <select
//             className="border rounded px-3 py-2"
//             value={type}
//             onChange={(e) => setType(e.target.value as NodeType)}
//           >
//             {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
//           </select>

//           <label className="text-sm mt-2">Name</label>
//           <input
//             className="border rounded px-3 py-2"
//             value={name}
//             onChange={e => setName(e.target.value)}
//             placeholder={type === "folder" ? "Folder name" : "File title"}
//           />

//           {requiresUrl && (
//             <>
//               <label className="text-sm mt-2">URL</label>
//               <input
//                 className="border rounded px-3 py-2"
//                 value={url}
//                 onChange={e => setUrl(e.target.value)}
//                 placeholder={type === "video" ? "YouTube/Drive link" : "https://..."}
//               />
//             </>
//           )}

//           <label className="text-sm mt-2">Order</label>
//           <input
//             type="number"
//             className="border rounded px-3 py-2"
//             value={order}
//             onChange={e => setOrder(parseInt(e.target.value || "0", 10))}
//           />
//         </div>

//         <div className="flex gap-2 justify-end mt-6">
//           <button className="px-4 py-2 rounded bg-gray-200" onClick={onClose} disabled={saving}>Cancel</button>
//           <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={handleSave} disabled={saving}>
//             {saving ? "Saving..." : "Create"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


// import React, { useEffect, useState } from "react";
// import type { NodeType, NodeDoc } from "../api/firestore";
// import { createNode, getMaxOrder } from "../api/firestore";

// // -----------------------------
// // CHOOSE ONE PROVIDER BELOW
// // A) Cloudinary (no server needed)
// // B) S3 Presigned (needs tiny server)
// // -----------------------------

// // === A) Cloudinary (unsigned preset) ===
// async function uploadBgImage(file: File): Promise<string> {
//   const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
//   const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET as string;
//   if (!CLOUD_NAME || !UPLOAD_PRESET) throw new Error("Cloudinary env not set");

//   const form = new FormData();
//   form.append("file", file);
//   form.append("upload_preset", UPLOAD_PRESET);

//   const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
//     method: "POST",
//     body: form,
//   });
//   if (!res.ok) throw new Error("Cloudinary upload failed");
//   const json = await res.json();
//   return json.secure_url as string; // public URL
// }

// /*
// // === B) S3 Presigned (if you prefer S3) ===
// // - You’ll need a backend endpoint /sign that returns { url, key }
// // - Then PUT file to url and construct your public URL (CloudFront recommended)
// async function uploadBgImage(file: File): Promise<string> {
//   const contentType = file.type || "image/jpeg";
//   const sign = await fetch(`/api/sign?name=${encodeURIComponent(file.name)}&type=${encodeURIComponent(contentType)}`);
//   if (!sign.ok) throw new Error("Failed to get presigned URL");
//   const { url, key, publicBase } = await sign.json(); // publicBase = https://cdn.yourdomain.com

//   const put = await fetch(url, { method: "PUT", headers: { "Content-Type": contentType }, body: file });
//   if (!put.ok) throw new Error("Upload to S3 failed");

//   return `${publicBase}/${key}`; // public URL to store in Firestore
// }
// */

// type Props = {
//   open: boolean;
//   parentId: string | null;
//   defaultType?: NodeType;
//   onClose: () => void;
//   onCreated?: (id: string) => void;
//   isRoot?: boolean; // ✅ new
// };

// const TYPES: NodeType[] = ["folder", "video", "pdf", "link"];

// export default function CreateModal({
//   open,
//   parentId,
//   defaultType = "folder",
//   onClose,
//   onCreated,
//   isRoot = false,
// }: Props) {
//   const [type, setType] = useState<NodeType>(defaultType);
//   const [name, setName] = useState("");
//   const [url, setUrl] = useState("");
//   const [order, setOrder] = useState<number>(0);
//   const [saving, setSaving] = useState(false);

//   // Root-only background image
//   const [bgImage, setBgImage] = useState<File | null>(null);
//   const [uploadingImage, setUploadingImage] = useState(false);

//   useEffect(() => {
//     if (!open) return;
//     setType(defaultType);
//     setName("");
//     setUrl("");
//     setBgImage(null);
//     (async () => {
//       const max = await getMaxOrder(parentId ?? null);
//       setOrder(max + 1);
//     })();
//   }, [open, parentId, defaultType]);

//   const requiresUrl = type !== "folder";

//   async function handleSave() {
//     if (!name.trim()) return;
//     setSaving(true);

//     try {
//       let bgImageUrl: string | undefined;

//       // ✅ only when creating a Root-level folder
//       if (isRoot && type === "folder" && bgImage) {
//         setUploadingImage(true);
//         bgImageUrl = await uploadBgImage(bgImage);
//         setUploadingImage(false);
//       }

//       const payload: Omit<NodeDoc, "createdAt" | "updatedAt"> = {
//         type,
//         name: name.trim(),
//         parentId: parentId ?? null,
//         order,
//         isActive: true,
//         url: requiresUrl ? url.trim() : undefined,
//         ...(bgImageUrl ? { bgImageUrl } : {}),
//       };

//       const id = await createNode(payload);
//       onCreated?.(id);
//       onClose();
//     } catch (err) {
//       console.error(err);
//       alert("Failed to create item. Please try again.");
//     } finally {
//       setSaving(false);
//       setUploadingImage(false);
//     }
//   }

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-2xl p-5 w-full max-w-lg shadow-xl">
//         <h3 className="text-lg font-semibold mb-4">Create new</h3>

//         <div className="grid gap-3">
//           <label className="text-sm">Type</label>
//           <select
//             className="border rounded px-3 py-2"
//             value={type}
//             onChange={(e) => setType(e.target.value as NodeType)}
//           >
//             {TYPES.map((t) => (
//               <option key={t} value={t}>{t}</option>
//             ))}
//           </select>

//           <label className="text-sm mt-2">Name</label>
//           <input
//             className="border rounded px-3 py-2"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             placeholder={type === "folder" ? "Folder name" : "File title"}
//           />

//           {requiresUrl && (
//             <>
//               <label className="text-sm mt-2">URL</label>
//               <input
//                 className="border rounded px-3 py-2"
//                 value={url}
//                 onChange={(e) => setUrl(e.target.value)}
//                 placeholder={type === "video" ? "YouTube/Drive link" : "https://..."}
//               />
//             </>
//           )}

//           {/* ✅ Only show for Root-level FOLDER */}
//           {isRoot && type === "folder" && (
//             <>
//               <label className="text-sm mt-2">Course Background Image (optional)</label>
//               <input
//                 type="file"
//                 accept="image/*"
//                 className="border rounded px-3 py-2"
//                 onChange={(e) => setBgImage(e.target.files?.[0] || null)}
//               />
//               {bgImage && <p className="text-xs text-gray-600">Selected: {bgImage.name}</p>}
//             </>
//           )}

//           <label className="text-sm mt-2">Order</label>
//           <input
//             type="number"
//             className="border rounded px-3 py-2"
//             value={order}
//             onChange={(e) => setOrder(parseInt(e.target.value || "0", 10))}
//           />
//         </div>

//         <div className="flex gap-2 justify-end mt-6">
//           <button className="px-4 py-2 rounded bg-gray-200" onClick={onClose} disabled={saving}>
//             Cancel
//           </button>
//           <button
//             className="px-4 py-2 rounded bg-blue-600 text-white"
//             onClick={handleSave}
//             disabled={saving || uploadingImage}
//           >
//             {saving ? "Saving..." : uploadingImage ? "Uploading Image..." : "Create"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { createNode, getMaxOrder } from "../api/firestore";
import { uploadBgImage } from "../utils/cloudinary"; // Utility for uploading image to Cloudinary

type Props = {
  open: boolean;
  parentId: string | null;
  defaultType?: "folder" | "video" | "pdf" | "link";
  onClose: () => void;
  onCreated?: (id: string) => void;
  isRoot?: boolean; // New prop to check if it's a root folder
};

export default function CreateModal({
  open,
  parentId,
  defaultType = "folder",
  onClose,
  onCreated,
  isRoot = false, // Check if it's a root folder
}: Props) {
  const [type, setType] = useState(defaultType);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [order, setOrder] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [bgImage, setBgImage] = useState<File | null>(null); // For uploading background image
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!open) return;
    setType(defaultType);
    setName("");
    setUrl("");
    setBgImage(null);
    (async () => {
      const max = await getMaxOrder(parentId ?? null);
      setOrder(max + 1);
    })();
  }, [open, parentId, defaultType]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);

    try {
      let bgImageUrl: string | undefined;

      // Upload bg image only for Root-level folders
      if (isRoot && type === "folder" && bgImage) {
        setUploadingImage(true);
        bgImageUrl = await uploadBgImage(bgImage); // Upload to Cloudinary
        setUploadingImage(false);
      }

      const payload = {
        type,
        name: name.trim(),
        parentId: parentId ?? null,
        order,
        isActive: true,
        url: type !== "folder" ? url.trim() : undefined,
        ...(bgImageUrl ? { bgImageUrl } : {}),
      };

      const id = await createNode(payload);  // Save to Firestore
      onCreated?.(id);  // Inform parent component of successful creation
      onClose();  // Close modal
    } catch (err) {
      console.error(err);
      alert("Failed to create item. Please try again.");
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-5 w-full max-w-lg shadow-xl">
        <h3 className="text-lg font-semibold mb-4">Create new</h3>

        <div className="grid gap-3">
          <label className="text-sm">Type</label>
          <select
            className="border rounded px-3 py-2"
            value={type}
            onChange={(e) => setType(e.target.value as "folder" | "video" | "pdf" | "link")}
          >
            {["folder", "video", "pdf", "link"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <label className="text-sm mt-2">Name</label>
          <input
            className="border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={type === "folder" ? "Folder name" : "File title"}
          />

          {type !== "folder" && (
            <>
              <label className="text-sm mt-2">URL</label>
              <input
                className="border rounded px-3 py-2"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL"
              />
            </>
          )}

          {/* Show image uploader only for Root-level folders */}
          {isRoot && type === "folder" && (
            <>
              <label className="text-sm mt-2">Course Background Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                className="border rounded px-3 py-2"
                onChange={(e) => setBgImage(e.target.files?.[0] || null)}
              />
              {bgImage && <p className="text-xs text-gray-600">Selected: {bgImage.name}</p>}
            </>
          )}

          <label className="text-sm mt-2">Order</label>
          <input
            type="number"
            className="border rounded px-3 py-2"
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value || "0", 10))}
          />
        </div>

        <div className="flex gap-2 justify-end mt-6">
          <button className="px-4 py-2 rounded bg-gray-200" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white"
            onClick={handleSave}
            disabled={saving || uploadingImage}
          >
            {saving ? "Saving..." : uploadingImage ? "Uploading Image..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
