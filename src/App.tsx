import React, { useMemo, useState } from "react";
import FolderView from "./components/FolderView";
import CreateModal from "./components/CreateModal";
import BulkUploadModal from "./components/BulkUploadModal";
import Breadcrumbs, { type Crumb } from "./components/Breadcrumbs";
import AnnouncementsPanel from "./components/AnnouncementPanel";
import AnnouncementCreatePage from "../src/components/AnnouncementCreatePage"; // New page for creating announcements
// import AuthGate from "../src/components/AuthGate";

type StackItem = { id: string | null; name: string };

export default function App() {
  const [tab, setTab] = useState<'explorer' | 'announcements' | 'announcement-create'>('explorer'); // Added new state for the create tab
  const [stack, setStack] = useState<StackItem[]>([{ id: null, name: "Root" }]);
  const current = stack[stack.length - 1];
  const [createOpen, setCreateOpen] = useState(false);
  const [createParent, setCreateParent] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);

  // Handle folder navigation and breadcrumb updates
  function enterFolder(id: string, name: string) {
    setStack(prev => [...prev, { id, name }]);
  }

  function jumpTo(id: string | null) {
    const idx = stack.findIndex(s => s.id === id);
    if (idx >= 0) setStack(stack.slice(0, idx + 1));
    else setStack([{ id: null, name: "Root" }]);
  }

  const crumbs: Crumb[] = useMemo(() => stack.map(s => ({ id: s.id, name: s.name })), [stack]);

  function handleBulkUploadComplete() {
    setRefreshKey(k => k + 1); // Refresh the view after upload
  }

  return (
    // <AuthGate>
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Content Explorer</h1>
        <button
          className="px-4 py-2 rounded bg-green-600 text-white"
          onClick={() => setBulkUploadOpen(true)}
        >
          Bulk Upload
        </button>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-2 rounded ${tab === 'explorer' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setTab('explorer')}
          >
            Explorer
          </button>
          <button
            className={`px-3 py-2 rounded ${tab === 'announcements' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setTab('announcements')}
          >
            Announcements
          </button>
        </div>

        {tab === 'explorer' && (
          <button className="px-4 py-2 rounded bg-green-600 text-white"
            onClick={() => setBulkUploadOpen(true)}>Bulk Upload</button>
        )}
      </div>

      <Breadcrumbs trail={crumbs} onJump={jumpTo} />

      {tab === 'explorer' && (
        <FolderView
          parentId={current.id}
          onEnterFolder={enterFolder}
          onCreateHere={(pid) => { setCreateParent(pid); setCreateOpen(true); }}
          onCreateInside={(pid) => { setCreateParent(pid); setCreateOpen(true); }}
          refreshKey={refreshKey}
        />
      )}

      {tab === 'announcement-create' && (
        <AnnouncementCreatePage onClose={() => setTab('announcements')} />
      )}

      {/* Existing CreateModal, BulkUploadModal, AnnouncementsPanel */}
      <CreateModal
        open={createOpen}
        parentId={createParent ?? current.id}
        onClose={() => setCreateOpen(false)}
        onCreated={() => setRefreshKey(k => k + 1)}
        isRoot={current.id === null && stack.length === 1}
      />

      <BulkUploadModal
        open={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
        onComplete={handleBulkUploadComplete}
      />

      {tab === 'announcements' && <AnnouncementsPanel />}
    </div>
    // </AuthGate>
  );
}
