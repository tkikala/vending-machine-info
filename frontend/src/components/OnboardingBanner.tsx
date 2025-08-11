import React from 'react';
import { startCheckout } from '../api';

export default function OnboardingBanner({ data }: { data: { plan?: string; onboarding?: { hasActiveSubscription: boolean; hasMachine: boolean; hasPhotos: boolean; hasReviews: boolean; hasReply: boolean } } }) {
  const ob = (data && (data as any).onboarding) || { hasActiveSubscription: false, hasMachine: false, hasPhotos: false, hasReviews: false, hasReply: false };
  const items = [
    { key: 'subscription', ok: ob.hasActiveSubscription, label: 'Subscription active', description: 'Unlock featured placement and analytics.', action: ob.hasActiveSubscription ? undefined : { label: 'Subscribe', type: 'subscribe' as const } },
    { key: 'machine', ok: ob.hasMachine, label: 'At least one machine', action: ob.hasMachine ? undefined : { label: 'Add Machine', href: '/admin/machines/new' } },
    { key: 'photos', ok: ob.hasPhotos, label: 'Add photos to a machine', description: 'Photos increase engagement and trust.', action: undefined },
    { key: 'reviews', ok: ob.hasReviews, label: 'Receive one review', description: 'Reviews drive clicks and conversions.', action: undefined },
    { key: 'reply', ok: ob.hasReply, label: 'Reply to a review', description: 'Reply to improve ratings and conversion.', action: { label: 'Manage Reviews', href: '/operator/reviews' } },
  ];

  const remaining = items.filter(i => !i.ok);
  if (remaining.length === 0) return null;

  return (
    <div style={{
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 16,
      padding: 18,
      marginBottom: 20,
      background: 'linear-gradient(135deg, rgba(79,70,229,0.1), rgba(147,51,234,0.1))',
      boxShadow: '0 6px 24px rgba(0,0,0,0.25)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#4f46e5,#9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🚀</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Get set up in minutes</div>
          <div style={{ opacity: 0.8, fontSize: 13 }}>Complete these steps to unlock featured placement and analytics.</div>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {items.map(i => (
          <div key={i.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, background: i.ok ? '#16a34a' : 'transparent', border: i.ok ? 'none' : '1px solid rgba(255,255,255,0.2)' }}>{i.ok ? '✓' : ''}</span>
              {i.label}
              {i.description && <span style={{ opacity: 0.6, fontSize: 12 }}> — {i.description}</span>}
            </div>
            {!i.ok && i.action && (
              i.action.type === 'subscribe' ? (
                <button
                  className="admin-button"
                  style={{ padding: '6px 10px', borderRadius: 8 }}
                  onClick={async () => {
                    try {
                      const url = await startCheckout('STARTER');
                      window.location.href = url;
                    } catch (e) {
                      // no-op
                    }
                  }}
                >
                  {i.action.label}
                </button>
              ) : (
                <a className="admin-button" href={i.action.href} style={{ padding: '6px 10px', borderRadius: 8 }}> {i.action.label} </a>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
