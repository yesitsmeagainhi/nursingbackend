import { useEffect, useState } from 'react';
import {
    collection, onSnapshot, orderBy, query, updateDoc, doc, deleteDoc
} from 'firebase/firestore';

import { getDb } from '../firebase'; // your existing v9 Firestore init



type Row = {
    id: string;
    title: string;
    type: string;
    audience?: string;
    published?: boolean;
    createdAt?: { seconds: number };
};

export default function AnnouncementList() {
    const [rows, setRows] = useState<Row[]>([]);
    const db = getDb();

    useEffect(() => {
        const q = query(
            collection(db, 'announcements'),
            orderBy('createdAt', 'desc')
        );
        const unsub = onSnapshot(q, snap => {
            setRows(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
        });
        return () => unsub();
    }, []);

    const togglePublish = async (r: Row) => {
        await updateDoc(doc(db, 'announcements', r.id), { published: !r.published });
    };

    const remove = async (r: Row) => {
        if (!confirm('Delete this announcement?')) return;
        await deleteDoc(doc(db, 'announcements', r.id));
    };

    return (
        <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Announcements</h2>
            <table className="w-full text-sm border">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="p-2 border">Title</th>
                        <th className="p-2 border">Type</th>
                        <th className="p-2 border">Audience</th>
                        <th className="p-2 border">Published</th>
                        <th className="p-2 border">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(r => (
                        <tr key={r.id} className="border-t">
                            <td className="p-2 border">{r.title}</td>
                            <td className="p-2 border">{r.type}</td>
                            <td className="p-2 border">{r.audience || 'all'}</td>
                            <td className="p-2 border">{r.published ? 'Yes' : 'No'}</td>
                            <td className="p-2 border space-x-2">
                                <button className="px-2 py-1 rounded bg-blue-600 text-white"
                                    onClick={() => togglePublish(r)}>
                                    {r.published ? 'Unpublish' : 'Publish'}
                                </button>
                                <button className="px-2 py-1 rounded bg-red-600 text-white"
                                    onClick={() => remove(r)}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    {rows.length === 0 && (
                        <tr><td className="p-3 text-gray-500" colSpan={5}>No announcements yet</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
