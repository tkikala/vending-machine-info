import React, { useEffect, useState } from 'react';
import { fetchMyMachines, openBillingPortal, fetchUsage, startCheckout } from '../api';
import { useAuth } from '../contexts/AuthContext';
import OnboardingBanner from './OnboardingBanner';

type Row = { id: string; name: string; location: string; description?: string; logo?: string; isActive: boolean };

export default function MyMachines() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ used: number; limit: number; plan?: string; slots?: { used: number; limit: number }; onboarding?: any } | null>(null);
  const { logout } = useAuth() as any;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [data, u] = await Promise.all([fetchMyMachines(), fetchUsage()]);
        setRows(data);
        setUsage({ used: u.usedMachines, limit: u.machineLimit, plan: u.plan, slots: { used: u.activeFeatured, limit: u.featuredSlots }, onboarding: u.onboarding });
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
      <h2>My Machines {usage?.plan ? <span style={{ fontSize: 14, opacity: 0.8 }}>({usage.plan} plan)</span> : null}</h2>
      <div style={{ marginBottom: 8 }}>
        <button className="admin-button" onClick={async () => { try { await logout(); } catch {} }} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>Logout</button>
      </div>
      {usage && <OnboardingBanner data={{ plan: usage.plan, onboarding: (usage as any).onboarding }} />}
      {usage && (
        <div style={{ marginBottom: 12, fontSize: 14, opacity: 0.85 }}>
          Usage: {usage.used}/{usage.limit} machines
          <div style={{ height: 8, background: '#222', borderRadius: 6, overflow: 'hidden', marginTop: 6, border: '1px solid #333' }}>
            <div style={{ width: `${Math.min(100, (usage.used/usage.limit)*100)}%`, height: '100%', background: '#4CAF50' }} />
          </div>
          {usage.slots && (
            <div style={{ marginTop: 8 }}>
              Featured slots: {usage.slots.used}/{usage.slots.limit}
              <div style={{ height: 8, background: '#222', borderRadius: 6, overflow: 'hidden', marginTop: 6, border: '1px solid #333' }}>
                <div style={{ width: `${Math.min(100, (usage.slots.used/usage.slots.limit)*100)}%`, height: '100%', background: '#f59e42' }} />
              </div>
            </div>
          )}
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
        <button className="admin-button" onClick={async () => {
          try {
            const url = await startCheckout('PRO');
            window.location.href = url;
          } catch (e: any) {
            alert(e.message || 'Failed to start upgrade');
          }
        }}>⬆️ Upgrade to Pro</button>
        <a href="/operator/reviews" className="admin-button">💬 Manage Reviews</a>
        <button className="admin-button" onClick={async () => {
          try {
            await fetch('/api/billing?action=sync', { credentials: 'include' });
            const u = await fetchUsage();
            setUsage({ used: u.usedMachines, limit: u.machineLimit, plan: u.plan, slots: { used: u.activeFeatured, limit: u.featuredSlots }, onboarding: u.onboarding });
          } catch {}
        }}>🔄 Sync Plan</button>
      </div>
      {rows.length === 0 && <p>You do not own any machines yet.</p>}
      <div style={{ display: 'grid', gap: 12 }}>
        {rows.map((m) => (
          <div key={m.id} style={{ border: '1px solid #333', borderRadius: 8, padding: 12, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
            {m.logo && <img src={m.logo} alt={m.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{m.name}</div>
              <div style={{ color: '#888' }}>{m.location}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className={`status-badge ${m.isActive ? 'active' : 'inactive'}`}>{m.isActive ? 'Active' : 'Inactive'}</span>
              <button className="admin-button" onClick={async () => {
                try {
                  const res = await fetch('/api/featured', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ machineId: m.id }) });
                  if (!res.ok) throw new Error('Failed to feature');
                  alert('Machine featured for 30 days');
                  const u = await fetchUsage();
                  setUsage({ used: u.usedMachines, limit: u.machineLimit, plan: u.plan, slots: { used: u.activeFeatured, limit: u.featuredSlots }, onboarding: u.onboarding });
                } catch (e: any) {
                  alert(e.message || 'Feature failed');
                }
              }}>⭐ Feature</button>
              <a className="admin-button" href={`/admin/machines/${m.id}/edit`} style={{ background: 'transparent' }}>📷 Add Photos</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
