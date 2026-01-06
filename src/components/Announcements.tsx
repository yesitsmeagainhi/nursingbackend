// import { useState } from 'react';
// import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
// import { getDb } from '../firebase'; // your existing v9 Firestore init

// type AnnType = 'info' | 'video' | 'pdf' | 'folder';

// export default function AddAnnouncementForm({ onCreated }: { onCreated?: () => void }) {
//     const [title, setTitle] = useState('');
//     const [body, setBody] = useState('');
//     const [type, setType] = useState<AnnType>('info');
//     const [audience, setAudience] = useState('all');
//     const db = getDb();
//     const [nodeId, setNodeId] = useState('');
//     const [url, setUrl] = useState('');
//     const [embedUrl, setEmbedUrl] = useState('');

//     const [published, setPublished] = useState(true);
//     const [saving, setSaving] = useState(false);

//     async function handleSubmit(e: React.FormEvent) {
//         e.preventDefault();
//         if (!title.trim()) return alert('Title is required');

//         try {
//             setSaving(true);
//             await addDoc(collection(db, 'announcements'), {
//                 title: title.trim(),
//                 body: body.trim(),
//                 type,
//                 audience: (audience || 'all').trim(),
//                 data: {
//                     nodeId: nodeId.trim(),
//                     url: url.trim(),
//                     embedUrl: embedUrl.trim(),
//                     screen: type === 'folder' ? 'Explorer' : 'Viewer',
//                 },
//                 published,
//                 createdAt: serverTimestamp(),
//                 scheduledAt: null,
//             });
//             setTitle(''); setBody(''); setNodeId(''); setUrl(''); setEmbedUrl('');
//             onCreated?.();
//             alert('Announcement created');
//         } catch (err: any) {
//             alert('Failed: ' + (err?.message || String(err)));
//         } finally {
//             setSaving(false);
//         }
//     }

//     return (
//         <form onSubmit={handleSubmit} className="grid gap-3 max-w-2xl">
//             <h2 className="text-xl font-semibold">Create Announcement</h2>

//             <input className="border rounded px-3 py-2" placeholder="Title *"
//                 value={title} onChange={e => setTitle(e.target.value)} />

//             <textarea className="border rounded px-3 py-2" placeholder="Body (optional)"
//                 value={body} onChange={e => setBody(e.target.value)} />

//             <div className="grid grid-cols-2 gap-3">
//                 <label className="text-sm">
//                     Type
//                     <select className="border rounded px-2 py-2 w-full"
//                         value={type} onChange={e => setType(e.target.value as AnnType)}>
//                         <option value="info">info</option>
//                         <option value="video">video</option>
//                         <option value="pdf">pdf</option>
//                         <option value="folder">folder</option>
//                     </select>
//                 </label>

//                 <input className="border rounded px-3 py-2" placeholder="Audience (e.g. all)"
//                     value={audience} onChange={e => setAudience(e.target.value)} />
//             </div>

//             <div className="grid grid-cols-3 gap-3">
//                 <input className="border rounded px-3 py-2" placeholder="nodeId (optional)"
//                     value={nodeId} onChange={e => setNodeId(e.target.value)} />
//                 <input className="border rounded px-3 py-2" placeholder="url (optional)"
//                     value={url} onChange={e => setUrl(e.target.value)} />
//                 <input className="border rounded px-3 py-2" placeholder="embedUrl (optional)"
//                     value={embedUrl} onChange={e => setEmbedUrl(e.target.value)} />
//             </div>

//             <label className="inline-flex items-center gap-2">
//                 <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} />
//                 <span>Published</span>
//             </label>

//             <button disabled={saving}
//                 className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50">
//                 {saving ? 'Saving…' : 'Create'}
//             </button>
//         </form>
//     );
// }


import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDb } from '../firebase';

type AnnType = 'info' | 'video' | 'pdf' | 'folder';

export default function AddAnnouncementForm({ onCreated }: { onCreated?: () => void }) {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [type, setType] = useState<AnnType>('info');
    const [audience, setAudience] = useState('all');

    const [nodeId, setNodeId] = useState('');
    const [url, setUrl] = useState('');

    const [published, setPublished] = useState(true);
    const [saving, setSaving] = useState(false);
    const db = getDb();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) return alert('Title is required');

        try {
            setSaving(true);

            // Build data only with non-empty fields
            const data: Record<string, any> = {
                screen: type === 'folder' ? 'Explorer' : 'Viewer',
            };
            if (nodeId.trim()) data.nodeId = nodeId.trim();
            if (url.trim()) data.url = url.trim();

            await addDoc(collection(db, 'announcements'), {
                title: title.trim(),
                body: body.trim(),
                type,
                audience: (audience || 'all').trim(),
                data,
                published,
                createdAt: serverTimestamp(),
                scheduledAt: null,
            });

            setTitle('');
            setBody('');
            setNodeId('');
            setUrl('');
            onCreated?.();
            alert('Announcement created');
        } catch (err: any) {
            alert('Failed: ' + (err?.message || String(err)));
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-3 max-w-2xl">
            <h2 className="text-xl font-semibold">Create Announcement</h2>

            <input
                className="border rounded px-3 py-2"
                placeholder="Title *"
                value={title}
                onChange={e => setTitle(e.target.value)}
            />

            <textarea
                className="border rounded px-3 py-2"
                placeholder="Body (optional)"
                value={body}
                onChange={e => setBody(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">
                    Type
                    <select
                        className="border rounded px-2 py-2 w-full"
                        value={type}
                        onChange={e => setType(e.target.value as AnnType)}
                    >
                        <option value="info">info</option>
                        <option value="video">video</option>
                        <option value="pdf">pdf</option>
                        <option value="folder">folder</option>
                    </select>
                </label>

                <input
                    className="border rounded px-3 py-2"
                    placeholder="Audience (e.g. all)"
                    value={audience}
                    onChange={e => setAudience(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-3 gap-3">
                <input
                    className="border rounded px-3 py-2"
                    placeholder="nodeId (optional)"
                    value={nodeId}
                    onChange={e => setNodeId(e.target.value)}
                />
                <input
                    className="border rounded px-3 py-2"
                    placeholder="url (optional)"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                />
                {/* embedUrl removed */}
            </div>

            <label className="inline-flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={published}
                    onChange={e => setPublished(e.target.checked)}
                />
                <span>Published</span>
            </label>

            <button
                disabled={saving}
                className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
            >
                {saving ? 'Saving…' : 'Create'}
            </button>
        </form>
    );
}
