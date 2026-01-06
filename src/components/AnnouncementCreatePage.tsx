// // src/components/AnnouncementCreatePage.tsx
// import React, { useState } from 'react';
// import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
// import { getDb } from '../firebase';
// import { sendAnnouncement, type AnnType } from '../services/announce';

// const AnnouncementCreatePage = ({ onClose }: { onClose: () => void }) => {
//     const [title, setTitle] = useState('');
//     const [body, setBody] = useState('');
//     const [audience, setAudience] = useState('all');
//     const [type, setType] = useState<AnnType>('announcement'); // optional type
//     const [nodeId, setNodeId] = useState('');                  // optional
//     const [url, setUrl] = useState('');                        // optional
//     const [saving, setSaving] = useState(false);
//     const db = getDb();

//     const handleSave = async () => {
//         if (!title.trim()) return alert('Title is required');
//         setSaving(true);
//         try {
//             // (Optional) keep a record in Firestore
//             await addDoc(collection(db, 'announcements'), {
//                 title: title.trim(),
//                 body: body.trim(),
//                 audience,
//                 type,
//                 nodeId: nodeId.trim() || null,
//                 url: url.trim() || null,
//                 createdAt: serverTimestamp(),
//             });

//             // ACTUAL PUSH → Node sender
//             const data: Record<string, string> = { type };
//             if (nodeId.trim()) data.nodeId = nodeId.trim();
//             if (url.trim()) data.url = url.trim();

//             console.log('[announce] sending via sender', { audience, title, body, data });
//             const resp = await sendAnnouncement({ audience, title: title.trim(), body: body.trim(), data });
//             console.log('[announce] sender response', resp);

//             alert('Announcement sent');
//             onClose();
//         } catch (err: any) {
//             console.error('[announce] send failed', err);
//             alert('Send failed: ' + (err?.message || String(err)));
//         } finally {
//             setSaving(false);
//         }
//     };

//     return (
//         <div className="p-4 max-w-3xl mx-auto space-y-4">
//             <h2 className="text-xl font-bold">Create New Announcement</h2>

//             <div>
//                 <label className="text-sm">Title</label>
//                 <input
//                     className="border rounded px-3 py-2 w-full"
//                     value={title}
//                     onChange={(e) => setTitle(e.target.value)}
//                     placeholder="Announcement Title"
//                 />
//             </div>

//             <div>
//                 <label className="text-sm">Message</label>
//                 <textarea
//                     className="border rounded px-3 py-2 w-full"
//                     value={body}
//                     onChange={(e) => setBody(e.target.value)}
//                     placeholder="What should users see in the notification?"
//                 />
//             </div>

//             <div className="grid grid-cols-3 gap-3">
//                 <div>
//                     <label className="text-sm">Audience (topic)</label>
//                     <input
//                         className="border rounded px-3 py-2 w-full"
//                         value={audience}
//                         onChange={(e) => setAudience(e.target.value)}
//                         placeholder="all or course_pharma"
//                     />
//                 </div>
//                 <div>
//                     <label className="text-sm">Type</label>
//                     <select
//                         className="border rounded px-3 py-2 w-full"
//                         value={type}
//                         onChange={(e) => setType(e.target.value as AnnType)}
//                     >
//                         <option value="announcement">announcement</option>
//                         <option value="video">video</option>
//                         <option value="pdf">pdf</option>
//                         <option value="folder">folder</option>
//                     </select>
//                 </div>
//                 <div />
//             </div>

//             <div className="grid grid-cols-2 gap-3">
//                 <div>
//                     <label className="text-sm">nodeId (optional)</label>
//                     <input
//                         className="border rounded px-3 py-2 w-full"
//                         value={nodeId}
//                         onChange={(e) => setNodeId(e.target.value)}
//                         placeholder="node id to open"
//                     />
//                 </div>
//                 <div>
//                     <label className="text-sm">url (optional)</label>
//                     <input
//                         className="border rounded px-3 py-2 w-full"
//                         value={url}
//                         onChange={(e) => setUrl(e.target.value)}
//                         placeholder="https://…"
//                     />
//                 </div>
//             </div>

//             <div className="flex justify-end gap-2 mt-6">
//                 <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200" disabled={saving}>
//                     Cancel
//                 </button>
//                 <button
//                     className="px-4 py-2 rounded bg-blue-600 text-white"
//                     onClick={handleSave}
//                     disabled={saving}
//                 >
//                     {saving ? 'Sending…' : 'Create & Send'}
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default AnnouncementCreatePage;
// src/components/AnnouncementCreatePage.tsx
import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDb } from '../firebase';
import { sendAnnouncement, type AnnType } from '../services/announce';

const AnnouncementCreatePage = ({ onClose }: { onClose: () => void }) => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [audience, setAudience] = useState('all');
    const [type, setType] = useState<AnnType>('info');   // ← use 'info' for plain announcements
    const [nodeId, setNodeId] = useState('');
    const [url, setUrl] = useState('');
    const [saving, setSaving] = useState(false);
    const db = getDb();
    console.log('[UI] AnnouncementCreatePage loaded from', import.meta.url);

    const handleSave = async () => {
        console.log('[UI] handleSave() fired');

        const t = title.trim();
        const b = body.trim();
        const a = (audience || 'all').trim();
        console.log('[announce] handleSave clicked');
        if (!t) return alert('Title is required');
        setSaving(true);
        try {
            // 1) optional: record in Firestore
            await addDoc(collection(db, 'announcements'), {
                title: t,
                body: b,
                audience: a,
                type,                              // 'info' | 'video' | 'pdf' | 'folder'
                nodeId: nodeId.trim() || null,
                url: url.trim() || null,
                createdAt: serverTimestamp(),
            });

            // 2) actual push → Node sender
            const data: Record<string, string> = {
                type,                              // mobile expects this
                ...(nodeId.trim() ? { nodeId: nodeId.trim() } : {}),
                ...(url.trim() ? { url: url.trim() } : {}),
            };

            console.log('[announce] send → /api/fcm/announce', { audience: a, title: t, body: b, data });
            const resp = await sendAnnouncement({ audience: a, title: t, body: b, data });
            console.log('[announce] sender response', resp);

            alert('Announcement sent');
            onClose();
        } catch (err: any) {
            console.error('[announce] send failed', err);
            alert('Send failed: ' + (err?.message || String(err)));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4 max-w-3xl mx-auto space-y-4">
            <h2 className="text-xl font-bold">Create New Announcement</h2>

            <div>
                <label className="text-sm">Title</label>
                <input className="border rounded px-3 py-2 w-full"
                    value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="Announcement Title" />
            </div>

            <div>
                <label className="text-sm">Message</label>
                <textarea className="border rounded px-3 py-2 w-full"
                    value={body} onChange={(e) => setBody(e.target.value)}
                    placeholder="What should users see in the notification?" />
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="text-sm">Audience (topic)</label>
                    <input className="border rounded px-3 py-2 w-full"
                        value={audience} onChange={(e) => setAudience(e.target.value)}
                        placeholder="all or pharma (server adds course_…)" />
                </div>

                <div>
                    <label className="text-sm">Type</label>
                    <select className="border rounded px-3 py-2 w-full"
                        value={type} onChange={(e) => setType(e.target.value as AnnType)}>
                        <option value="info">info (plain announcement)</option>
                        <option value="video">video</option>
                        <option value="pdf">pdf</option>
                        <option value="folder">folder</option>
                    </select>
                </div>
                <div />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-sm">nodeId (optional)</label>
                    <input className="border rounded px-3 py-2 w-full"
                        value={nodeId} onChange={(e) => setNodeId(e.target.value)}
                        placeholder="node id to open" />
                </div>
                <div>
                    <label className="text-sm">url (optional)</label>
                    <input className="border rounded px-3 py-2 w-full"
                        value={url} onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://…" />
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200" disabled={saving}>Cancel</button>
                <button className="px-4 py-2 rounded bg-blue-600 text-white"
                    onClick={handleSave} disabled={saving}>
                    {saving ? 'Sending…' : 'Create & Send'}
                </button>
            </div>
        </div>
    );
};

export default AnnouncementCreatePage;
