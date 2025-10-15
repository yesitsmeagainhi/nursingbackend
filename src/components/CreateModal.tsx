import React, { useEffect, useMemo, useState } from "react";
import type { NodeType, NodeDoc } from "../api/firestore";
import { createNode, getMaxOrder } from "../api/firestore";

type Props = {
  open: boolean;
  parentId: string | null;
  defaultType?: NodeType;
  onClose: () => void;
  onCreated?: (id: string) => void;
};

const TYPES: NodeType[] = ["folder", "video", "pdf", "link"];

export default function CreateModal({ open, parentId, defaultType="folder", onClose, onCreated }: Props) {
  const [type, setType] = useState<NodeType>(defaultType);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [order, setOrder] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setType(defaultType);
    setName("");
    setUrl("");
    (async () => {
      const max = await getMaxOrder(parentId ?? null);
      setOrder(max + 1);
    })();
  }, [open, parentId, defaultType]);

  const requiresUrl = type !== "folder";

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    const payload: Omit<NodeDoc, "createdAt" | "updatedAt"> = {
      type,
      name: name.trim(),
      parentId: parentId ?? null,
      order,
      isActive: true,
      url: requiresUrl ? url.trim() : undefined,
    };
    const id = await createNode(payload);
    setSaving(false);
    onCreated?.(id);
    onClose();
  }

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
            onChange={(e) => setType(e.target.value as NodeType)}
          >
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <label className="text-sm mt-2">Name</label>
          <input
            className="border rounded px-3 py-2"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={type === "folder" ? "Folder name" : "File title"}
          />

          {requiresUrl && (
            <>
              <label className="text-sm mt-2">URL</label>
              <input
                className="border rounded px-3 py-2"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder={type === "video" ? "YouTube/Drive link" : "https://..."}
              />
            </>
          )}

          <label className="text-sm mt-2">Order</label>
          <input
            type="number"
            className="border rounded px-3 py-2"
            value={order}
            onChange={e => setOrder(parseInt(e.target.value || "0", 10))}
          />
        </div>

        <div className="flex gap-2 justify-end mt-6">
          <button className="px-4 py-2 rounded bg-gray-200" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
