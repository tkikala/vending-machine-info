import React, { useEffect, useState } from 'react';
import { fetchMyMachines, openBillingPortal } from '../api';

type Row = { id: string; name: string; location: string; description?: string; logo?: string; isActive: boolean };

export default function MyMachines() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchMyMachines();
        setRows(data);
      } catch (e: any) {
        setError(e.message || 'Failed to load your machines');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading…</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>My Machines</h2>
      <div style={{ marginBottom: 12 }}>
        <button className="admin-button" onClick={async () => {
          try {
            const url = await openBillingPortal();
            window.location.href = url;
          } catch (e: any) {
            alert(e.message || 'Failed to open billing portal');
          }
        }}>🧾 Manage Subscription</button>
      </div>
      {rows.length === 0 && <p>You do not own any machines yet.</p>}
      <div style={{ display: 'grid', gap: 12 }}>
        {rows.map((m) => (
          <div key={m.id} style={{ border: '1px solid #333', borderRadius: 8, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            {m.logo && <img src={m.logo} alt={m.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{m.name}</div>
              <div style={{ color: '#888' }}>{m.location}</div>
            </div>
            <span className={`status-badge ${m.isActive ? 'active' : 'inactive'}`}>{m.isActive ? 'Active' : 'Inactive'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
