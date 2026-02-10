// // // src/App.tsx
// // import React, { useMemo, useState } from "react";

// // // ── Admin UI (your existing components) ───────────────────────────────────────
// // import FolderView from "./components/FolderView";
// // import CreateModal from "./components/CreateModal";
// // import BulkUploadModal from "./components/BulkUploadModal";
// // import Breadcrumbs, { type Crumb } from "./components/Breadcrumbs";
// // import AnnouncementsPanel from "./components/AnnouncementPanel";
// // import AnnouncementCreatePage from "./components/AnnouncementCreatePage";

// // // ── Auth glue ────────────────────────────────────────────────────────────────
// // import { AuthProvider, useAuth } from "./context/AuthContext"; // from earlier step
// // import LoginPage from "./pages/Login";                         // from earlier step

// // type StackItem = { id: string | null; name: string };

// // /**
// //  * Wraps children with auth state:
// //  *  - While loading: small loader
// //  *  - Signed out: shows <LoginPage/>
// //  *  - Signed in: renders children (admin UI)
// //  */
// // function AuthGate({ children }: { children: React.ReactNode }) {
// //   const { user, loading } = useAuth();
// //   if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
// //   if (!user) return <LoginPage />;
// //   return <>{children}</>;
// // }

// // /**
// //  * Your existing admin UI moved into its own component (unchanged logic)
// //  */
// // function AdminApp() {
// //   const [tab, setTab] = useState<"explorer" | "announcements" | "announcement-create">("explorer");
// //   const [stack, setStack] = useState<StackItem[]>([{ id: null, name: "Root" }]);
// //   const current = stack[stack.length - 1];
// //   const [createOpen, setCreateOpen] = useState(false);
// //   const [createParent, setCreateParent] = useState<string | null>(null);
// //   const [refreshKey, setRefreshKey] = useState(0);
// //   const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
// //   const { user, signOut } = useAuth();

// //   function enterFolder(id: string, name: string) {
// //     setStack(prev => [...prev, { id, name }]);
// //   }

// //   function jumpTo(id: string | null) {
// //     const idx = stack.findIndex(s => s.id === id);
// //     if (idx >= 0) setStack(stack.slice(0, idx + 1));
// //     else setStack([{ id: null, name: "Root" }]);
// //   }

// //   const crumbs: Crumb[] = useMemo(
// //     () => stack.map(s => ({ id: s.id, name: s.name })),
// //     [stack]
// //   );

// //   function handleBulkUploadComplete() {
// //     setRefreshKey(k => k + 1);
// //   }

// //   return (
// //     <div className="p-4 max-w-6xl mx-auto space-y-4">
// //       <div className="flex justify-between items-center">
// //         <h1 className="text-2xl font-bold">Content Explorer</h1><button
// //           onClick={async () => { try { await signOut(); } catch { } }}
// //           className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-800"
// //           title="Sign out"
// //         >
// //           Logout
// //         </button>

// //         {/* Top-right quick actions */}
// //         <div className="flex items-center gap-2">
// //           {tab === "explorer" && (
// //             <button
// //               className="px-4 py-2 rounded bg-green-600 text-white"
// //               onClick={() => setBulkUploadOpen(true)}
// //             >
// //               Bulk Upload
// //             </button>
// //           )}

// //           {/* {user?.email && (
// //             <span className="hidden sm:inline text-sm text-gray-600">
// //               {user.email}
// //             </span>
// //           )} */}


// //           {tab === "announcements" && (
// //             <button
// //               className="px-4 py-2 rounded bg-blue-600 text-white"
// //               onClick={() => setTab("announcement-create")}
// //             >
// //               Create Announcement
// //             </button>
// //           )}
// //         </div>
// //       </div>

// //       {/* Tabs */}
// //       <div className="flex justify-between items-center">
// //         <div className="flex items-center gap-2">
// //           <button
// //             className={`px-3 py-2 rounded ${tab === "explorer" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
// //             onClick={() => setTab("explorer")}
// //           >
// //             Explorer
// //           </button>
// //           <button
// //             className={`px-3 py-2 rounded ${tab === "announcements" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
// //             onClick={() => setTab("announcements")}
// //           >
// //             Announcements
// //           </button>
// //         </div>
// //       </div>

// //       <Breadcrumbs trail={crumbs} onJump={jumpTo} />

// //       {tab === "explorer" && (
// //         <FolderView
// //           parentId={current.id}
// //           onEnterFolder={enterFolder}
// //           onCreateHere={(pid) => { setCreateParent(pid); setCreateOpen(true); }}
// //           onCreateInside={(pid) => { setCreateParent(pid); setCreateOpen(true); }}
// //           refreshKey={refreshKey}
// //         />
// //       )}

// //       {tab === "announcement-create" && (
// //         <AnnouncementCreatePage onClose={() => setTab("announcements")} />
// //       )}

// //       {/* Modals */}
// //       <CreateModal
// //         open={createOpen}
// //         parentId={createParent ?? current.id}
// //         onClose={() => setCreateOpen(false)}
// //         onCreated={() => setRefreshKey(k => k + 1)}
// //         isRoot={current.id === null && stack.length === 1}
// //       />

// //       <BulkUploadModal
// //         open={bulkUploadOpen}
// //         onClose={() => setBulkUploadOpen(false)}
// //         onComplete={handleBulkUploadComplete}
// //       />

// //       {tab === "announcements" && <AnnouncementsPanel />}
// //     </div>
// //   );
// // }

// // /**
// //  * Root: provides auth and gates the UI
// //  *  - Session is persisted via browserLocalPersistence (set in firebaseInstance.ts)
// //  */
// // export default function App() {
// //   return (
// //     <AuthProvider>
// //       <AuthGate>
// //         <AdminApp />
// //       </AuthGate>
// //     </AuthProvider>
// //   );
// // }

// //App.tsx
// import React, { useMemo, useState, useEffect } from "react";
// import "./App.css";

// // Admin UI
// import FolderView from "./components/FolderView";
// import CreateModal from "./components/CreateModal";
// import BulkUploadModal from "./components/BulkUploadModal";
// import Breadcrumbs, { type Crumb } from "./components/Breadcrumbs";
// import AnnouncementsPanel from "./components/AnnouncementPanel";
// import AnnouncementCreatePage from "./components/AnnouncementCreatePage";

// // Auth
// import { AuthProvider, useAuth } from "./context/AuthContext";
// import LoginPage from "./pages/Login";

// type StackItem = { id: string | null; name: string };

// function AuthGate({ children }: { children: React.ReactNode }) {
//   const { user, loading } = useAuth();
//   if (loading) return <div className="p-6 text-sm text-muted">Loading…</div>;
//   if (!user) return <LoginPage />;
//   return <>{children}</>;
// }

// function AdminApp() {
//   const [tab, setTab] = useState<"explorer" | "announcement" | "announcements" | "announcement-create">("explorer");
//   const [stack, setStack] = useState<StackItem[]>([{ id: null, name: "Root" }]);
//   const current = stack[stack.length - 1];
//   const [createOpen, setCreateOpen] = useState(false);
//   const [createParent, setCreateParent] = useState<string | null>(null);
//   const [refreshKey, setRefreshKey] = useState(0);
//   const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
//   const { user, signOut } = useAuth();
//   useEffect(() => {
//     const BASE =
//       import.meta.env.VITE_FCM_SENDER_URL ||
//       import.meta.env.VITE_FCM_SERVER_URL ||
//       'http://localhost:4000';
//     // const BASE =
//     //   (window as any).__SENDER_URL ||
//     //   import.meta.env.VITE_FCM_SENDER_URL ||
//     //   ''; // if you use Vite proxy, leave empty and call '/api/...'
//     async function pingSender() {
//       const res = await fetch(`${BASE}/api/fcm/ping`);
//       const text = await res.text();           // tolerate non-JSON on errors
//       if (!res.ok) {
//         console.error('[PING error]', res.status, text);
//         return;
//       }
//       try {
//         console.log('[PING]', JSON.parse(text));
//       } catch {
//         console.error('[PING error] non-JSON:', text);
//       }
//     }
//     if (!BASE) {
//       console.log('[PING] No sender URL configured (using Vite proxy or missing env)');
//     }

//     fetch(`${BASE}/api/fcm/ping`)
//       .then(r => r.json())
//       .then(j => console.log('[PING]', j))  // expect: { ok:true, project:'nursing-387c8' }
//       .catch(e => console.log('[PING error]', e));
//   }, []);
//   function enterFolder(id: string, name: string) {
//     setStack((prev) => [...prev, { id, name }]);
//   }
//   function jumpTo(id: string | null) {
//     const idx = stack.findIndex((s) => s.id === id);
//     if (idx >= 0) setStack(stack.slice(0, idx + 1));
//     else setStack([{ id: null, name: "Root" }]);
//   }
//   const crumbs: Crumb[] = useMemo(() => stack.map((s) => ({ id: s.id, name: s.name })), [stack]);

//   return (
//     <div className="app-shell">
//       {/* Topbar */}
//       <header className="topbar">
//         <div className="container topbar__row">
//           <div className="brand">
//             <div className="brand__logo" />
//             <div className="brand__text">
//               <span className="brand__title">ABS Admin</span>
//               <span className="brand__sep">/</span>
//               <span className="brand__section">
//                 {tab === "explorer"
//                   ? "Content Explorer"
//                   : tab === "announcements"
//                     ? "Announcements"
//                     : "Create Announcement"}
//               </span>
//             </div>
//           </div>

//           <div className="toolbar">
//             {user?.email && <span className="user-chip">{user.email}</span>}
//             <button
//               className="btn btn-ghost"
//               title="Sign out"
//               onClick={async () => {
//                 try {
//                   await signOut();
//                 } catch { }
//               }}
//             >
//               Logout
//             </button>
//           </div>
//         </div>

//         {/* Tabs / Actions */}
//         <div className="tabbar">
//           <div className="container tabbar__row">
//             <nav className="tabs">
//               <button
//                 className={`tab ${tab === "explorer" ? "tab--active" : ""}`}
//                 onClick={() => setTab("explorer")}
//               >
//                 Explorer
//               </button>
//               <button
//                 className={`tab ${tab === "announcements" ? "tab--active" : ""}`}
//                 onClick={() => setTab("announcements")}
//               >
//                 Announcements
//               </button>
//             </nav>

//             <div className="toolbar">
//               {tab === "explorer" && (
//                 <button className="btn btn-success" onClick={() => setBulkUploadOpen(true)}>
//                   Bulk Upload
//                 </button>
//               )}
//               {tab === "announcements" && (
//                 <button
//                   className="btn btn-primary"
//                   onClick={() => setTab("announcement-create")}
//                 >
//                   Create Announcement
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main */}
//       <main className="container main">
//         <section className="card card--light">
//           <Breadcrumbs trail={crumbs} onJump={jumpTo} />
//         </section>

//         {tab === "explorer" && (
//           <section className="card">
//             <FolderView
//               parentId={current.id}
//               onEnterFolder={enterFolder}
//               onCreateHere={(pid) => {
//                 setCreateParent(pid);
//                 setCreateOpen(true);
//               }}
//               onCreateInside={(pid) => {
//                 setCreateParent(pid);
//                 setCreateOpen(true);
//               }}
//               refreshKey={refreshKey}
//             />
//           </section>
//         )}

//         {tab === "announcements" && (
//           <section className="card">
//             <AnnouncementsPanel />
//           </section>
//         )}

//         {tab === "announcement-create" && (
//           <section className="card">
//             <AnnouncementCreatePage onClose={() => setTab("announcements")} />
//           </section>
//         )}
//       </main>

//       {/* Modals */}
//       <CreateModal
//         open={createOpen}
//         parentId={createParent ?? current.id}
//         onClose={() => setCreateOpen(false)}
//         onCreated={() => setRefreshKey((k) => k + 1)}
//         isRoot={current.id === null && stack.length === 1}
//       />
//       <BulkUploadModal
//         open={bulkUploadOpen}
//         onClose={() => setBulkUploadOpen(false)}
//         onComplete={() => setRefreshKey((k) => k + 1)}
//       />
//     </div>
//   );
// }

// export default function App() {
//   return (
//     <AuthProvider>
//       <AuthGate>
//         <AdminApp />
//       </AuthGate>
//     </AuthProvider>
//   );
// }
















// // import React, { useMemo, useState } from "react";

// // // Admin UI
// // import FolderView from "./components/FolderView";
// // import CreateModal from "./components/CreateModal";
// // import BulkUploadModal from "./components/BulkUploadModal";
// // import Breadcrumbs, { type Crumb } from "./components/Breadcrumbs";
// // import AnnouncementsPanel from "./components/AnnouncementPanel";
// // import AnnouncementCreatePage from "./components/AnnouncementCreatePage";

// // // Auth
// // import { AuthProvider, useAuth } from "./context/AuthContext";
// // import LoginPage from "./pages/Login";

// // type StackItem = { id: string | null; name: string };

// // function AuthGate({ children }: { children: React.ReactNode }) {
// //   const { user, loading } = useAuth();
// //   if (loading) return <div className="p-6 text-sm text-slate-600">Loading…</div>;
// //   if (!user) return <LoginPage />;
// //   return <>{children}</>;
// // }

// // function AdminApp() {
// //   const [tab, setTab] = useState<"explorer" | "announcements" | "announcement-create">("explorer");
// //   const [stack, setStack] = useState<StackItem[]>([{ id: null, name: "Root" }]);
// //   const current = stack[stack.length - 1];
// //   const [createOpen, setCreateOpen] = useState(false);
// //   const [createParent, setCreateParent] = useState<string | null>(null);
// //   const [refreshKey, setRefreshKey] = useState(0);
// //   const [bulkUploadOpen, setBulkUploadOpen] = useState(false);

// //   const { user, signOut } = useAuth();

// //   function enterFolder(id: string, name: string) {
// //     setStack(prev => [...prev, { id, name }]);
// //   }
// //   function jumpTo(id: string | null) {
// //     const idx = stack.findIndex(s => s.id === id);
// //     if (idx >= 0) setStack(stack.slice(0, idx + 1));
// //     else setStack([{ id: null, name: "Root" }]);
// //   }
// //   const crumbs: Crumb[] = useMemo(
// //     () => stack.map(s => ({ id: s.id, name: s.name })),
// //     [stack]
// //   );

// //   function handleBulkUploadComplete() {
// //     setRefreshKey(k => k + 1);
// //   }

// //   return (
// //     <div className="min-h-screen bg-slate-50">
// //       {/* Top bar */}
// //       <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
// //         <div className="max-w-7xl mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
// //           <div className="flex items-center gap-3">
// //             <div className="h-8 w-8 rounded-lg bg-blue-600" />
// //             <h1 className="text-lg font-bold text-slate-900">ABS Admin</h1>
// //             <span className="hidden sm:inline text-slate-400">/</span>
// //             <span className="hidden sm:inline text-slate-600">
// //               {tab === "explorer" ? "Content Explorer" :
// //                 tab === "announcements" ? "Announcements" : "Create Announcement"}
// //             </span>
// //           </div>

// //           <div className="flex items-center gap-3">
// //             {user?.email && (
// //               <span className="hidden md:inline text-sm text-slate-600">{user.email}</span>
// //             )}
// //             <button
// //               onClick={async () => { try { await signOut(); } catch { } }}
// //               className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm"
// //               title="Sign out"
// //             >
// //               Logout
// //             </button>
// //           </div>
// //         </div>

// //         {/* Tabs row */}
// //         <div className="border-t border-slate-200 bg-white">
// //           <div className="max-w-7xl mx-auto px-4 lg:px-8 h-12 flex items-center justify-between">
// //             <nav className="flex items-center gap-2">
// //               <button
// //                 className={`px-3.5 py-1.5 rounded-md text-sm ${tab === "explorer"
// //                     ? "bg-blue-600 text-white"
// //                     : "bg-slate-100 text-slate-700 hover:bg-slate-200"
// //                   }`}
// //                 onClick={() => setTab("explorer")}
// //               >
// //                 Explorer
// //               </button>
// //               <button
// //                 className={`px-3.5 py-1.5 rounded-md text-sm ${tab === "announcements"
// //                     ? "bg-blue-600 text-white"
// //                     : "bg-slate-100 text-slate-700 hover:bg-slate-200"
// //                   }`}
// //                 onClick={() => setTab("announcements")}
// //               >
// //                 Announcements
// //               </button>
// //             </nav>

// //             {/* Right-side tab actions */}
// //             <div className="flex items-center gap-2">
// //               {tab === "explorer" && (
// //                 <button
// //                   className="px-3.5 py-1.5 rounded-md text-sm bg-green-600 text-white hover:bg-green-700"
// //                   onClick={() => setBulkUploadOpen(true)}
// //                 >
// //                   Bulk Upload
// //                 </button>
// //               )}
// //               {tab === "announcements" && (
// //                 <button
// //                   className="px-3.5 py-1.5 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700"
// //                   onClick={() => setTab("announcement-create")}
// //                 >
// //                   Create Announcement
// //                 </button>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       </header>

// //       {/* Main content */}
// //       <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-4">
// //         {/* Breadcrumbs in a light card for separation */}
// //         <section className="bg-white border border-slate-200 rounded-xl p-3">
// //           <Breadcrumbs trail={crumbs} onJump={jumpTo} />
// //         </section>

// //         {/* Content area */}
// //         {tab === "explorer" && (
// //           <section className="bg-white border border-slate-200 rounded-xl p-4">
// //             <FolderView
// //               parentId={current.id}
// //               onEnterFolder={enterFolder}
// //               onCreateHere={(pid) => { setCreateParent(pid); setCreateOpen(true); }}
// //               onCreateInside={(pid) => { setCreateParent(pid); setCreateOpen(true); }}
// //               refreshKey={refreshKey}
// //             />
// //           </section>
// //         )}

// //         {tab === "announcements" && (
// //           <section className="bg-white border border-slate-200 rounded-xl p-4">
// //             <AnnouncementsPanel />
// //           </section>
// //         )}

// //         {tab === "announcement-create" && (
// //           <section className="bg-white border border-slate-200 rounded-xl p-4">
// //             <AnnouncementCreatePage onClose={() => setTab("announcements")} />
// //           </section>
// //         )}
// //       </main>

// //       {/* Modals (outside flow for layering) */}
// //       <CreateModal
// //         open={createOpen}
// //         parentId={createParent ?? current.id}
// //         onClose={() => setCreateOpen(false)}
// //         onCreated={() => setRefreshKey(k => k + 1)}
// //         isRoot={current.id === null && stack.length === 1}
// //       />

// //       <BulkUploadModal
// //         open={bulkUploadOpen}
// //         onClose={() => setBulkUploadOpen(false)}
// //         onComplete={handleBulkUploadComplete}
// //       />
// //     </div>
// //   );
// // }

// // export default function App() {
// //   return (
// //     <AuthProvider>
// //       <AuthGate>
// //         <AdminApp />
// //       </AuthGate>
// //     </AuthProvider>
// //   );
// // }



// App.tsx
import React, { useMemo, useState, useEffect } from "react";
import "./App.css";

// Admin UI
import FolderView from "./components/FolderView";
import CreateModal from "./components/CreateModal";
import BulkUploadModal from "./components/BulkUploadModal";
import Breadcrumbs, { type Crumb } from "./components/Breadcrumbs";
import AnnouncementsPanel from "./components/AnnouncementPanel";
import AnnouncementCreatePage from "./components/AnnouncementCreatePage";

// ✅ NEW
import UsersPanel from "../src/components/UsersPanel";
import UserCreatePage from "../src/components/UserCreatePage";

// Auth
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/Login";

type StackItem = { id: string | null; name: string };

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6 text-sm text-muted">Loading…</div>;
  if (!user) return <LoginPage />;
  return <>{children}</>;
}

function AdminApp() {
  const [tab, setTab] = useState<
    "explorer" | "announcements" | "announcement-create" | "users" | "user-create"
  >("explorer");

  const [stack, setStack] = useState<StackItem[]>([{ id: null, name: "Root" }]);
  const current = stack[stack.length - 1];
  const [createOpen, setCreateOpen] = useState(false);
  const [createParent, setCreateParent] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);

  const { user, signOut } = useAuth();

  const BASE =
    import.meta.env.VITE_FCM_SENDER_URL ||
    import.meta.env.VITE_FCM_SERVER_URL ||
    "http://localhost:4000";


  // const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
  // const BASE = import.meta.env.VITE_API_BASE_URL || "";

  // useEffect(() => {
  //   fetch(`${BASE}/api/fcm/ping`)
  //     .then((r) => r.json())
  //     .then((j) => console.log("[PING]", j))
  //     .catch((e) => console.log("[PING error]", e));
  // }, [BASE]);
  useEffect(() => {
    if (!BASE) return; // ✅ don't ping if backend not configured
    fetch(`${BASE}/api/fcm/ping`)
      .then((r) => r.json())
      .then((j) => console.log("[PING]", j))
      .catch((e) => console.log("[PING error]", e));
  }, [BASE]);

  function enterFolder(id: string, name: string) {
    setStack((prev) => [...prev, { id, name }]);
  }
  function jumpTo(id: string | null) {
    const idx = stack.findIndex((s) => s.id === id);
    if (idx >= 0) setStack(stack.slice(0, idx + 1));
    else setStack([{ id: null, name: "Root" }]);
  }
  const crumbs: Crumb[] = useMemo(
    () => stack.map((s) => ({ id: s.id, name: s.name })),
    [stack]
  );

  const sectionTitle =
    tab === "explorer"
      ? "Content Explorer"
      : tab === "announcements"
        ? "Announcements"
        : tab === "announcement-create"
          ? "Create Announcement"
          : tab === "users"
            ? "Users"
            : "Create User";

  return (
    <div className="app-shell">
      {/* Topbar */}
      <header className="topbar">
        <div className="container topbar__row">
          <div className="brand">
            <div className="brand__logo" />
            <div className="brand__text">
              <span className="brand__title">ABS Admin</span>
              <span className="brand__sep">/</span>
              <span className="brand__section">{sectionTitle}</span>
            </div>
          </div>

          <div className="toolbar">
            {user?.email && <span className="user-chip">{user.email}</span>}
            <button
              className="btn btn-ghost"
              title="Sign out"
              onClick={async () => {
                try {
                  await signOut();
                } catch { }
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs / Actions */}
        <div className="tabbar">
          <div className="container tabbar__row">
            <nav className="tabs">
              <button
                className={`tab ${tab === "explorer" ? "tab--active" : ""}`}
                onClick={() => setTab("explorer")}
              >
                Explorer
              </button>

              <button
                className={`tab ${tab === "announcements" ? "tab--active" : ""}`}
                onClick={() => setTab("announcements")}
              >
                Announcements
              </button>

              {/* ✅ NEW */}
              <button
                className={`tab ${tab === "users" ? "tab--active" : ""}`}
                onClick={() => setTab("users")}
              >
                Users
              </button>
            </nav>

            <div className="toolbar">
              {tab === "explorer" && (
                <button
                  className="btn btn-success"
                  onClick={() => setBulkUploadOpen(true)}
                >
                  Bulk Upload
                </button>
              )}

              {tab === "announcements" && (
                <button
                  className="btn btn-primary"
                  onClick={() => setTab("announcement-create")}
                >
                  Create Announcement
                </button>
              )}

              {/* ✅ NEW */}
              {tab === "users" && (
                <button
                  className="btn btn-primary"
                  onClick={() => setTab("user-create")}
                >
                  Create User
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container main">
        {/* Breadcrumbs only make sense for explorer; keep it there */}
        {tab === "explorer" && (
          <section className="card card--light">
            <Breadcrumbs trail={crumbs} onJump={jumpTo} />
          </section>
        )}

        {tab === "explorer" && (
          <section className="card">
            <FolderView
              parentId={current.id}
              onEnterFolder={enterFolder}
              onCreateHere={(pid) => {
                setCreateParent(pid);
                setCreateOpen(true);
              }}
              onCreateInside={(pid) => {
                setCreateParent(pid);
                setCreateOpen(true);
              }}
              refreshKey={refreshKey}
            />
          </section>
        )}

        {tab === "announcements" && (
          <section className="card">
            <AnnouncementsPanel />
          </section>
        )}

        {tab === "announcement-create" && (
          <section className="card">
            <AnnouncementCreatePage onClose={() => setTab("announcements")} />
          </section>
        )}

        {/* ✅ NEW */}
        {tab === "users" && (
          <section className="card">
            <UsersPanel baseUrl={BASE} />
          </section>
        )}

        {tab === "user-create" && (
          <section className="card">
            <UserCreatePage
              baseUrl={BASE}
              onClose={() => setTab("users")}
              onCreated={() => setTab("users")}
            />
          </section>
        )}
      </main>

      {/* Modals */}
      <CreateModal
        open={createOpen}
        parentId={createParent ?? current.id}
        onClose={() => setCreateOpen(false)}
        onCreated={() => setRefreshKey((k) => k + 1)}
        isRoot={current.id === null && stack.length === 1}
      />
      <BulkUploadModal
        open={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
        onComplete={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <AdminApp />
      </AuthGate>
    </AuthProvider>
  );
}
