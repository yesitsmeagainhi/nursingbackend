// src/components/BulkUploadModal.tsx

import React, { useState } from "react";
import Papa from "papaparse";
import { bulkCreateNodes } from "../api/firestore";

type Props = {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
};

export default function BulkUploadModal({ open, onClose, onComplete }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setError(null);
    }
  }

  async function handleUpload() {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const data = results.data as any[];
          await bulkCreateNodes(data, (p) => setProgress(p));
          onComplete();
          onClose();
        } catch (err: any) {
          setError(err.message || "An unknown error occurred.");
        } finally {
          setUploading(false);
        }
      },
      error: (err: any) => {
        setError(err.message);
        setUploading(false);
      },
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-5 w-full max-w-lg shadow-xl">
        <h3 className="text-lg font-semibold mb-4">Bulk Upload CSV</h3>

        <div className="grid gap-3">
          <label className="text-sm">CSV File</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="border rounded px-3 py-2"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {uploading && (
            <div className="w-full bg-gray-200 rounded-full mt-2">
              <div
                className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
                style={{ width: `${progress}%` }}
              >
                {Math.round(progress)}%
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end mt-6">
          <button className="px-4 py-2 rounded bg-gray-200" onClick={onClose} disabled={uploading}>Cancel</button>
          <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}