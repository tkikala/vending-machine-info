import React, { useEffect, useState } from 'react';
import { listPendingClaims, decideClaim } from '../api';

type Claim = {
  id: string;
  machine: { id: string; name: string; location: string; owner: { id: string; name: string; email: string } };
  requester: { id: string; name: string; email: string };
  message?: string;
  createdAt: string;
};

export default function AdminClaims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await listPendingClaims();
        setClaims(data);
      } catch (e: any) {
        setError(e.message || 'Failed to load claims');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handle(decision: 'APPROVE' | 'REJECT', id: string) {
    try {
      await decideClaim(id, decision);
      setClaims((prev) => prev.filter((c) => c.id !== id));
    } catch (e: any) {
      alert(e.message || 'Failed to update claim');
    }
  }

  if (loading) return <div>Loading claims…</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Pending Claims</h2>
      {claims.length === 0 && <p>No pending claims</p>}
      {claims.map((c) => (
        <div key={c.id} style={{ border: '1px solid #333', borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <div><b>Machine:</b> {c.machine.name} — {c.machine.location}</div>
          <div><b>Current owner:</b> {c.machine.owner.name} ({c.machine.owner.email})</div>
          <div><b>Requester:</b> {c.requester.name} ({c.requester.email})</div>
          {c.message && <div><b>Message:</b> {c.message}</div>}
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button className="btn btn-success" onClick={() => handle('APPROVE', c.id)}>Approve</button>
            <button className="btn btn-danger" onClick={() => handle('REJECT', c.id)}>Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}
