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
    <div style={{ padding: 24 }}>
      <h2>{canceled ? 'Checkout canceled' : 'Thank you for subscribing!'}</h2>
      {!canceled && <p>Your subscription is being confirmed. We are syncing your plan…</p>}
      {synced && <p>Plan synced. You can return to <a href="/my-machines">My Machines</a>.</p>}
      {error && <p style={{ color: 'salmon' }}>Sync error: {error}</p>}
    </div>
  );
}
