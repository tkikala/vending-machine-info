import React, { useEffect, useState } from 'react';
import { listSubscriptions } from '../api';

export default function AdminSubscriptions() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setRows(await listSubscriptions());
      } catch (e: any) {
        setError(e.message || 'Failed to load subscriptions');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading…</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Subscriptions</h2>
      <div style={{ display: 'grid', gap: 8 }}>
        {rows.map((s) => (
          <div key={s.id} style={{ border: '1px solid #333', borderRadius: 8, padding: 12, display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div><b>{s.user.name}</b> — {s.user.email}</div>
              <div style={{ opacity: 0.8, fontSize: 12 }}>Customer: {s.user.stripeCustomerId || '-'}</div>
            </div>
            <div>
              <div><b>{s.plan}</b> — {s.status}</div>
              <div style={{ opacity: 0.8, fontSize: 12 }}>Renews: {new Date(s.currentPeriodEnd).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
