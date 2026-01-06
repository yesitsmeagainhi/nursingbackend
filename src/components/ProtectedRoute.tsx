// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// export default function ProtectedRoute({ children }: { children: JSX.Element }) {
//     const { user, loading } = useAuth();

//     if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
//     if (!user) return <Navigate to="/login" replace />;

//     return children;
// }
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
