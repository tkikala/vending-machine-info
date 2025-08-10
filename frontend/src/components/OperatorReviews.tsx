import React, { useEffect, useState } from 'react';
import { listOwnedReviews, actOnReview } from '../api';

export default function OperatorReviews() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await listOwnedReviews();
        setRows(data);
      } catch (e: any) {
        setError(e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function reply(id: string) {
    const reply = window.prompt('Enter reply');
    if (reply === null) return;
    await actOnReview(id, 'reply', reply);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, reply } : r)));
  }

  async function hide(id: string, hideFlag: boolean) {
    await actOnReview(id, hideFlag ? 'hide' : 'unhide');
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, isHidden: hideFlag } : r)));
  }

  if (loading) return <div>Loading reviews…</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Reviews on your machines</h2>
      {rows.length === 0 && <p>No reviews yet.</p>}
      <div style={{ display: 'grid', gap: 12 }}>
        {rows.map((r) => (
          <div key={r.id} style={{ border: '1px solid #333', borderRadius: 8, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <b>{r.vendingMachine.name}</b> — {r.user.name}
              </div>
              <div>{new Date(r.createdAt).toLocaleString()}</div>
            </div>
            <div style={{ marginTop: 6 }}>
              <b style={{ color: '#f59e42' }}>{r.rating}★</b> {r.comment}
            </div>
            {r.reply && (
              <div style={{ marginTop: 6, fontStyle: 'italic', opacity: 0.9 }}>Reply: {r.reply}</div>
            )}
            {r.isHidden && (
              <div style={{ marginTop: 6, color: '#f44336' }}>Hidden from public</div>
            )}
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => reply(r.id)}>Reply</button>
              <button className="btn btn-secondary" onClick={() => hide(r.id, !r.isHidden)}>
                {r.isHidden ? 'Unhide' : 'Hide'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
