import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDb } from '../firebase'; // your existing v9 Firestore init

const AnnouncementCreatePage = ({ onClose }: { onClose: () => void }) => {
    const [announcementTitle, setAnnouncementTitle] = useState("");
    const [announcementDescription, setAnnouncementDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const db = getDb();
    const handleSave = async () => {
        if (!announcementTitle.trim()) return;

        setSaving(true);

        try {
            const payload = {
                title: announcementTitle.trim(),
                description: announcementDescription.trim(),
                createdAt: serverTimestamp(),
            };

            await addDoc(collection(db, "announcements"), payload);
            onClose();
        } catch (err) {
            console.error("Error creating announcement:", err);
            alert("Error creating announcement. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4 max-w-6xl mx-auto space-y-4">
            <h2 className="text-xl font-bold">Create New Announcement</h2>

            <div>
                <label className="text-sm">Title</label>
                <input
                    className="border rounded px-3 py-2 w-full"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    placeholder="Announcement Title"
                />
            </div>

            <div>
                <label className="text-sm">Description</label>
                <textarea
                    className="border rounded px-3 py-2 w-full"
                    value={announcementDescription}
                    onChange={(e) => setAnnouncementDescription(e.target.value)}
                    placeholder="Announcement Description"
                />
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <button className="px-4 py-2 rounded bg-gray-200" onClick={onClose} disabled={saving}>
                    Cancel
                </button>
                <button
                    className="px-4 py-2 rounded bg-blue-600 text-white"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Create"}
                </button>
            </div>
        </div>
    );
};

export default AnnouncementCreatePage;
