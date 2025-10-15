import React, { useMemo, useState } from "react";
import FolderView from "./components/FolderView";
import CreateModal from "./components/CreateModal";
import Breadcrumbs, { type Crumb } from "./components/Breadcrumbs";

type StackItem = { id: string | null; name: string };

export default function App() {
  // breadcrumb stack – root at index 0
  const [stack, setStack] = useState<StackItem[]>([{ id: null, name: "Root" }]);
  const current = stack[stack.length - 1];

  // create modal controls
  const [createOpen, setCreateOpen] = useState(false);
  const [createParent, setCreateParent] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function enterFolder(id: string, name: string) {
    setStack(prev => [...prev, { id, name }]);
  }

  function jumpTo(id: string | null) {
    const idx = stack.findIndex(s => s.id === id);
    if (idx >= 0) setStack(stack.slice(0, idx + 1));
    else setStack([{ id: null, name: "Root" }]); // fallback
  }

  const crumbs: Crumb[] = useMemo(() => stack.map(s => ({ id: s.id, name: s.name })), [stack]);

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Content Explorer</h1>

      <Breadcrumbs trail={crumbs} onJump={jumpTo} />

      <FolderView
        parentId={current.id}
        onEnterFolder={enterFolder}                // ← IMPORTANT! fixes your “no-op Open”
        onCreateHere={(pid) => { setCreateParent(pid); setCreateOpen(true); }}
        onCreateInside={(pid) => { setCreateParent(pid); setCreateOpen(true); }}
        refreshKey={refreshKey}
      />

      <CreateModal
        open={createOpen}
        parentId={createParent ?? current.id}
        onClose={() => setCreateOpen(false)}
        onCreated={() => setRefreshKey(k => k + 1)}
      />
    </div>
  );
}
