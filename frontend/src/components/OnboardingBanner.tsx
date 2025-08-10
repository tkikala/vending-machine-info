import React from 'react';

export default function OnboardingBanner({ data }: { data: { plan?: string; onboarding?: { hasActiveSubscription: boolean; hasMachine: boolean; hasPhotos: boolean; hasReviews: boolean; hasReply: boolean } } }) {
  const ob = data.onboarding || { hasActiveSubscription: false, hasMachine: false, hasPhotos: false, hasReviews: false, hasReply: false };
  const items = [
    { key: 'subscription', ok: ob.hasActiveSubscription, label: 'Subscription active', action: ob.hasActiveSubscription ? undefined : { label: 'Subscribe', href: '/admin' } },
    { key: 'machine', ok: ob.hasMachine, label: 'At least one machine', action: ob.hasMachine ? undefined : { label: 'Add Machine', href: '/admin/machines/new' } },
    { key: 'photos', ok: ob.hasPhotos, label: 'Add photos to a machine', action: undefined },
    { key: 'reviews', ok: ob.hasReviews, label: 'Receive one review', action: undefined },
    { key: 'reply', ok: ob.hasReply, label: 'Reply to a review', action: { label: 'Manage Reviews', href: '/operator/reviews' } },
  ];

  const remaining = items.filter(i => !i.ok);
  if (remaining.length === 0) return null;

  return (
    <div style={{ border: '1px solid #333', borderRadius: 10, padding: 14, marginBottom: 16, background: 'rgba(255,255,255,0.03)' }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Getting Started</div>
      <div style={{ display: 'grid', gap: 6 }}>
        {items.map(i => (
          <div key={i.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <div>
              <span style={{ marginRight: 8 }}>{i.ok ? '✅' : '⬜️'}</span>
              {i.label}
            </div>
            {!i.ok && i.action && (
              <a className="admin-button" href={i.action.href}>{i.action.label}</a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
