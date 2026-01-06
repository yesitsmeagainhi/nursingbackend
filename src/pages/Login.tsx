import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './login.css';

export default function LoginPage() {
    const { signIn } = useAuth();

    const [email, setEmail] = useState('');
    const [pwd, setPwd] = useState('');
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);
        if (!email || !pwd) {
            setErr('Enter your email and password.');
            return;
        }
        setBusy(true);
        try {
            await signIn(email.trim(), pwd);
            // No navigate() here — AuthGate will re-render and show the admin UI automatically
        } catch (e: any) {
            const code = e?.code || '';
            const map: Record<string, string> = {
                'auth/invalid-credential': 'Invalid email/password.',
                'auth/user-not-found': 'No such user.',
                'auth/wrong-password': 'Wrong password.',
                'auth/too-many-requests': 'Too many attempts. Try later.',
            };
            setErr(map[code] || 'Login failed. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="auth-wrap">
            <div className="auth-card">
                <h1>Admin Login</h1>
                <p className="sub">Sign in to manage content & announcements</p>

                <form onSubmit={onSubmit}>
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="you@abs-institute.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="username"
                    />

                    <label>Password</label>
                    <div className="pwd-row">
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={pwd}
                            onChange={(e) => setPwd(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>

                    {err && <div className="error">{err}</div>}

                    <button type="submit" disabled={busy}>
                        {busy ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>

                <div className="muted" style={{ marginTop: 10 }}>
                    Need access? Contact admin.
                </div>
            </div>
        </div>
    );
}
