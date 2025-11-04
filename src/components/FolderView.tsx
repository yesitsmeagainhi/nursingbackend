import { useEffect, useState } from "react";
import { listChildren, updateNode, deleteNode, recursiveDelete, type NodeDoc } from "../api/firestore";
import classNames from "classnames";

type Props = {
  parentId: string | null;
  onEnterFolder?: (id: string, name: string) => void; // IMPORTANT: wire this from parent
  onCreateHere?: (parentId: string | null) => void;
  onCreateInside?: (parentId: string) => void;
  refreshKey?: any; // bump to refresh
};

export default function FolderView({
  parentId, onEnterFolder, onCreateHere, onCreateInside, refreshKey
}: Props) {
  const [items, setItems] = useState<NodeDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  async function load() {
    setLoading(true);
    const rows = await listChildren(parentId ?? null);
    setItems(rows);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentId, refreshKey]);

  function onOpenFolder(row: NodeDoc) {
    if (!onEnterFolder) {
      console.warn("[FolderView] onEnterFolder not provided. 'Open' will do nothing.", row);
      return;
    }
    onEnterFolder(row.id!, row.name);
  }

  async function onRename(row: NodeDoc) {
    if (!editingId) { setEditingId(row.id!); setNewName(row.name); return; }
    if (editingId === row.id) {
      await updateNode(row.id!, { name: newName.trim() || row.name });
      setEditingId(null); setNewName("");
      await load();
    }
  }

  // async function onDelete(row: NodeDoc) {
  //   const ask = row.type === "folder"
  //     ? confirm(`Delete folder "${row.name}" and ALL its contents?`)
  //     : confirm(`Delete "${row.name}"?`);
  //   if (!ask) return;
  //   if (row.type === "folder") await recursiveDelete(row.id!);
  //   else await deleteNode(row.id!);
  //   await load();
  // }
  async function onDelete(row: NodeDoc) {
    const ask = row.type === "folder"
      ? confirm(`Delete folder "${row.name}" and ALL its contents?`)
      : confirm(`Delete "${row.name}"?`);
    if (!ask) return;
    if (row.type === "folder") {
      await recursiveDelete(row.id!);  // Delete folder and its contents
    } else {
      await deleteNode(row.id!);  // Delete individual file or node
    }
    await load();  // Reload the folder after deletion
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-gray-50">
        <div className="font-semibold">Items ({items.length})</div>
        <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={() => onCreateHere?.(parentId ?? null)}>
          New
        </button>
      </div>

      {loading ? (
        <div className="p-6 text-center opacity-60">Loading…</div>
      ) : items.length === 0 ? (
        <div className="p-6 text-center opacity-60">No items here yet.</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Order</th>
              <th className="text-right p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(row => (
              <tr key={row.id} className="border-t">
                <td className="p-2">
                  <div className="flex items-center gap-3">
                    <Thumb row={row} />
                    {editingId === row.id ? (
                      <input
                        className="border rounded px-2 py-1"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                      />
                    ) : (
                      <span className="font-medium">{row.name}</span>
                    )}
                  </div>
                </td>
                <td className="p-2 uppercase">{row.type}</td>
                <td className="p-2">{row.order}</td>
                <td className="p-2">
                  <div className="flex gap-2 justify-end">
                    {row.type === "folder" && (
                      <>
                        <button className="px-2 py-1 rounded bg-gray-200" onClick={() => onOpenFolder(row)}>
                          Open
                        </button>
                        <button className="px-2 py-1 rounded bg-emerald-600 text-white"
                          onClick={() => onCreateInside?.(row.id!)}>New inside</button>
                      </>
                    )}
                    {row.type !== "folder" && row.url && (
                      <a href={row.embedUrl || row.url} target="_blank" className="px-2 py-1 rounded bg-gray-200">Preview</a>
                    )}
                    <button className={classNames("px-2 py-1 rounded",
                      editingId === row.id ? "bg-blue-600 text-white" : "bg-gray-200")}
                      onClick={() => onRename(row)}>
                      {editingId === row.id ? "Save" : "Rename"}
                    </button>
                    <button className="px-2 py-1 rounded bg-red-600 text-white" onClick={() => onDelete(row)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Thumb({ row }: { row: NodeDoc }) {
  const isFolder = row.type === "folder";
  const src = row.thumbUrl;

  if (isFolder) {
    return <div className="w-10 h-10 rounded bg-yellow-100 flex items-center justify-center">📁</div>;
  }
  if (src) {
    return <img className="w-10 h-10 object-cover rounded" src={src} alt="" />;
  }
  const icon = row.type === "pdf" ? "📄" : row.type === "video" ? "🎬" : "🔗";
  return <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">{icon}</div>;
}
