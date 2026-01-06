import { useAuth } from '../context/AuthContext';

export default function Topbar() {
    const { signOut, user } = useAuth();

    return (
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
            <div>ABS Admin</div>
            <div>
                <span style={{ marginRight: 10, color: '#555' }}>{user?.email}</span>
                <button onClick={signOut}>Sign out</button>
            </div>
        </div>
    );
}
