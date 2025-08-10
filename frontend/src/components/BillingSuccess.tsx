import React, { useEffect, useState } from 'react';

export default function BillingSuccess({ canceled = false }: { canceled?: boolean }) {
  const [synced, setSynced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/billing?action=sync', { credentials: 'include' });
        if (!res.ok) throw new Error('Sync failed');
        setSynced(true);
      } catch (e: any) {
        setError(e.message || 'Failed to sync');
      }
    })();
  }, []);

  return (
    <div style={{
      minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(1200px 600px at top right, rgba(99,102,241,0.15), transparent)'
    }}>
      <div style={{
        width: 'min(620px, 92vw)', padding: 24, borderRadius: 16,
        background: 'linear-gradient(135deg, rgba(17,24,39,0.9), rgba(31,41,55,0.9))',
        border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 12px 40px rgba(0,0,0,0.45)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: canceled ? '#ef4444' : 'linear-gradient(135deg,#22c55e,#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
            {canceled ? '✖' : '✔'}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{canceled ? 'Checkout canceled' : 'Subscription successful!'}</div>
            <div style={{ opacity: 0.8 }}>{canceled ? 'No worries — you can resume anytime.' : 'Thanks for supporting AutomatCheck. Your plan is activating.'}</div>
          </div>
        </div>
        {!canceled && (
          <div style={{ marginTop: 10, padding: 12, borderRadius: 12, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
            {synced ? 'Your plan is synced. Enjoy Pro features!' : 'Syncing your plan now…'}
          </div>
        )}
        {error && <div style={{ marginTop: 10, padding: 12, borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>Sync error: {error}</div>}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <a className="admin-button" href="/my-machines" style={{ padding: '10px 14px', borderRadius: 10 }}>Go to My Machines</a>
        </div>
      </div>
    </div>
  );
}
