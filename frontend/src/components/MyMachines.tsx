import React, { useEffect, useState } from 'react';
import { fetchMyMachines, openBillingPortal, fetchUsage, startCheckout } from '../api';
import { useAuth } from '../contexts/AuthContext';
import OnboardingBanner from './OnboardingBanner';
import GalleryManager from './GalleryManager';
import FeatureInfo from './FeatureInfo';
import { EmbedPreview, EmbedSnippet } from './EmbedWidget';

type Row = { id: string; name: string; location: string; description?: string; logo?: string; isActive: boolean };

export default function MyMachines() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ used: number; limit: number; plan?: string; slots?: { used: number; limit: number }; onboarding?: any; emailVerified?: boolean } | null>(null);
  const { logout } = useAuth() as any;
  const [openGalleryFor, setOpenGalleryFor] = useState<string | null>(null);
  const [localGallery, setLocalGallery] = useState<any[]>([]);
  const [showFeatureInfo, setShowFeatureInfo] = useState(false);
  const [embedFor, setEmbedFor] = useState<string | null>(null);

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
      
      {/* Email Verification Banner */}
      {usage && !usage.emailVerified && (
        <div style={{ 
          background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
          color: 'white', 
          padding: '16px', 
          borderRadius: '8px', 
          marginBottom: '16px',
          border: '1px solid #f59e0b'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>📧 Verify Your Email</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                Verify your email to unlock full features: up to 5 machines, billing access, and more.
              </div>
            </div>
            <button 
              className="admin-button" 
              style={{ 
                background: 'rgba(255,255,255,0.2)', 
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                fontSize: '12px',
                padding: '8px 12px'
              }}
              onClick={async () => {
                try {
                  const res = await fetch('/api/auth?action=resend-verification', { 
                    method: 'POST', 
                    credentials: 'include' 
                  });
                  if (res.ok) {
                    alert('Verification email sent! Check your inbox.');
                  } else {
                    alert('Failed to send verification email. Please try again.');
                  }
                } catch (err) {
                  alert('Failed to send verification email. Please try again.');
                }
              }}
            >
              Resend Email
            </button>
          </div>
        </div>
      )}
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
              {usage?.slots && usage.slots.limit > 0 ? (
                <button className="admin-button" onClick={async () => {
                  try {
                    // Check current featured status via GET
                    const statusRes = await fetch(`/api/featured?machineId=${m.id}`);
                    const status = await statusRes.json().catch(() => ({}));
                    if (status?.active) {
                      const res = await fetch(`/api/featured?machineId=${m.id}`, { method: 'DELETE', credentials: 'include' });
                      if (!res.ok) throw new Error('Failed to remove featured');
                    } else {
                      const res = await fetch('/api/featured', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ machineId: m.id }) });
                      if (!res.ok) throw new Error('Failed to feature');
                    }
                    const u = await fetchUsage();
                    setUsage({ used: u.usedMachines, limit: u.machineLimit, plan: u.plan, slots: { used: u.activeFeatured, limit: u.featuredSlots }, onboarding: u.onboarding });
                  } catch (e: any) {
                    alert(e.message || 'Feature toggle failed');
                  }
                }}>{(() => {
                  // Simple label that flips if any slot is in use (approx)
                  return '⭐ Toggle Featured';
                })()}</button>
              ) : (
                <button className="admin-button" onClick={async () => {
                  // open subscription upsell
                  const ok = confirm('Featuring requires a subscription. Would you like to subscribe now?');
                  if (!ok) return;
                  try {
                    const url = await startCheckout('STARTER');
                    window.location.href = url;
                  } catch {}
                }}>⭐ Feature (requires subscription)</button>
              )}
              <button className="admin-button" style={{ background: 'transparent' }} onClick={() => setShowFeatureInfo(true)}>❓ What is Featured?</button>
              <button className="admin-button" style={{ background: 'transparent' }} onClick={() => { setOpenGalleryFor(m.id); setLocalGallery([]); }}>📷 Add Photos</button>
              <button className="admin-button" style={{ background: 'transparent' }} onClick={() => setEmbedFor(m.id)}>🔗 Embed</button>
              <button className="admin-button" style={{ background: 'transparent' }} onClick={() => {
                const url = `/api/admin/qr?machineId=${m.id}`;
                window.open(url, '_blank');
              }}>📱 QR Code</button>
            </div>
          </div>
        ))}
      </div>

      {openGalleryFor && (
        <div style={{ marginTop: 16, border: '1px solid #333', borderRadius: 12, padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Add Photos</h3>
            <button className="admin-button" style={{ background: 'transparent' }} onClick={() => setOpenGalleryFor(null)}>Close</button>
          </div>
          <GalleryManager initialGallery={[]} onGalleryChange={setLocalGallery} />
          <div style={{ marginTop: 10 }}>
            <button className="admin-button" onClick={async () => {
              try {
                for (const item of localGallery) {
                  const form = new FormData();
                  form.append('file', item.file);
                  form.append('filename', item.originalName || 'upload');
                  form.append('contentType', item.file?.type || 'image/jpeg');
                  form.append('caption', item.caption || '');
                  const res = await fetch(`/api/upload?type=gallery&machineId=${openGalleryFor}`, { method: 'POST', credentials: 'include', body: form });
                  if (!res.ok) throw new Error('Upload failed');
                }
                alert('Photos uploaded');
                setOpenGalleryFor(null);
              } catch (e: any) {
                alert(e.message || 'Upload failed');
              }
            }}>Upload</button>
          </div>
        </div>
      )}

      <FeatureInfo open={showFeatureInfo} onClose={() => setShowFeatureInfo(false)} />

      {embedFor && (
        <div style={{ marginTop: 16, border: '1px solid #333', borderRadius: 12, padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Embed Preview</h3>
            <button className="admin-button" style={{ background: 'transparent' }} onClick={() => setEmbedFor(null)}>Close</button>
          </div>
          <EmbedPreview machineId={embedFor} />
          <div style={{ marginTop: 10 }}>
            <EmbedSnippet machineId={embedFor} />
          </div>
        </div>
      )}
    </div>
  );
}
