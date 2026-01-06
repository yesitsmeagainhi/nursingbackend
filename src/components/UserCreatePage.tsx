



//src/components/UserCreatePage.tsx

import React, { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function UserCreatePage({
  baseUrl,
  onClose,
  onCreated,
}: {
  baseUrl: string;
  onClose: () => void;
  onCreated?: () => void;
}) {
  const { user } = useAuth();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [courseName, setCourseName] = useState(""); // ✅ NEW
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const isValidPhone = useMemo(() => /^\d{10}$/.test(phone), [phone]);
  const isValidPassword = useMemo(() => (password || "").length >= 6, [password]);
  const isValidCourse = useMemo(() => (courseName || "").trim().length >= 2, [courseName]); // ✅ NEW
  const canSubmit = isValidPhone && isValidPassword && isValidCourse && !busy;

  const onChangePhone = (v: string) => {
    const digits = (v || "").replace(/\D/g, "").slice(0, 10);
    setPhone(digits);
    setErr("");
    setOk("");
  };

  async function createUser() {
    if (!canSubmit) {
      if (!isValidPhone) setErr("Enter a valid 10-digit mobile number.");
      else if (!isValidPassword) setErr("Password must be at least 6 characters.");
      else if (!isValidCourse) setErr("Please enter course name.");
      return;
    }

    setBusy(true);
    setErr("");
    setOk("");

    try {
      const token = await user?.getIdToken?.();
      const res = await fetch(`${baseUrl}/api/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          phone,
          password,
          name,
          courseName: courseName.trim(), // ✅ send courseName
        }),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text || "Create user failed");

      const data = JSON.parse(text);
      setOk(`User created: ${data?.email || phone}`);
      setPassword("");
      if (onCreated) onCreated();
    } catch (e: any) {
      setErr(e?.message || "Create user failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 560, display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Create User</div>
          <div style={{ color: "#6b7280", fontSize: 12 }}>
            Creates user in Firebase Auth + Firestore profiles.
          </div>
        </div>
        <button className="btn btn-ghost" onClick={onClose}>
          Back
        </button>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <label style={{ fontSize: 12, fontWeight: 700 }}>Mobile Number</label>
        <input
          className="input"
          value={phone}
          onChange={(e) => onChangePhone(e.target.value)}
          placeholder="10-digit phone"
        />
        {!isValidPhone && phone.length > 0 ? (
          <div style={{ color: "#ef4444", fontSize: 12 }}>
            Enter a 10-digit mobile number.
          </div>
        ) : null}

        <label style={{ fontSize: 12, fontWeight: 700 }}>Password</label>
        <input
          className="input"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErr("");
            setOk("");
          }}
          placeholder="Min 6 characters"
        />
        {!isValidPassword && password.length > 0 ? (
          <div style={{ color: "#ef4444", fontSize: 12 }}>
            Password must be at least 6 characters.
          </div>
        ) : null}

        <label style={{ fontSize: 12, fontWeight: 700 }}>Name (optional)</label>
        <input
          className="input"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErr("");
            setOk("");
          }}
          placeholder="Student name"
        />

        {/* ✅ NEW: Course Name */}
        <label style={{ fontSize: 12, fontWeight: 700 }}>Course Name</label>
        <input
          className="input"
          value={courseName}
          onChange={(e) => {
            setCourseName(e.target.value);
            setErr("");
            setOk("");
          }}
          placeholder="e.g., D.Pharm / B.Pharm / GNM"
        />
        {!isValidCourse && courseName.length > 0 ? (
          <div style={{ color: "#ef4444", fontSize: 12 }}>
            Please enter course name.
          </div>
        ) : null}

        {err ? (
          <div className="alert alert-error" style={{ padding: 10 }}>
            {err}
          </div>
        ) : null}

        {ok ? (
          <div className="alert alert-success" style={{ padding: 10 }}>
            {ok}
          </div>
        ) : null}

        <button className="btn btn-primary" onClick={createUser} disabled={!canSubmit}>
          {busy ? "Creating…" : "Create User"}
        </button>
      </div>

      <div style={{ color: "#6b7280", fontSize: 12 }}>
        Tip: email is auto-generated from phone (example: <b>9876543210@phoneuser.nursinglecture.com</b>).
      </div>
    </div>
  );
}
