


//src/components/UsersPanel.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

type UserRow = {
  uid?: string;
  phone?: string;
  email?: string;
  courseName?: string;
  name?: string;
  createdAt?: string;
};

export default function UsersPanel({ baseUrl }: { baseUrl: string }) {
  const { user } = useAuth();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const token = await user?.getIdToken?.();
      const res = await fetch(`${baseUrl}/api/admin/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || "Failed to load users");
      const data = JSON.parse(text);
      setRows(Array.isArray(data?.users) ? data.users : []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Users</div>
          <div style={{ color: "#6b7280", fontSize: 12 }}>
            View users created in Auth + Firestore profiles.
          </div>
        </div>
        <button className="btn btn-ghost" onClick={load} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {err ? (
        <div className="alert alert-error" style={{ padding: 10 }}>
          {err}
        </div>
      ) : null}

      <div style={{ overflowX: "auto" }}>
        <table className="table" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Phone</th>
              <th>Email</th>
              <th>Name</th>
              <th>CourseName</th>
              <th>UID</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading ? (
              <tr>
                <td colSpan={6} style={{ color: "#6b7280", padding: 12 }}>
                  No users found.
                </td>
              </tr>
            ) : null}

            {rows.map((r, idx) => (
              <tr key={`${r.uid || r.phone || idx}`}>
                <td>{r.phone || "-"}</td>
                <td>{r.email || "-"}</td>
                <td>{r.name || "-"}</td>
                <td>{r.courseName || "12th"}</td>
                <td style={{ fontFamily: "monospace", fontSize: 12 }}>
                  {r.uid || "-"}
                </td>
                <td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
