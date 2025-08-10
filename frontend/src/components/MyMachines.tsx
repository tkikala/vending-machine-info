import React, { useEffect, useState } from 'react';
import { fetchMyMachines, openBillingPortal } from '../api';
import React from 'react';

type Row = { id: string; name: string; location: string; description?: string; logo?: string; isActive: boolean };

export default function MyMachines() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchMyMachines();
        setRows(data);
        // Usage from subscription snapshot via a lightweight endpoint can be added later; temporary derive
        setUsage({ used: data.length, limit: 10 });
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
      {usage && (
        <div style={{ marginBottom: 12, fontSize: 14, opacity: 0.85 }}>
          Usage: {usage.used}/{usage.limit} machines
          <div style={{ height: 8, background: '#222', borderRadius: 6, overflow: 'hidden', marginTop: 6, border: '1px solid #333' }}>
            <div style={{ width: `${Math.min(100, (usage.used/usage.limit)*100)}%`, height: '100%', background: '#4CAF50' }} />
          </div>
        </div>
      )}
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
