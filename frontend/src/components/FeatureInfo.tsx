import React from 'react';

export default function FeatureInfo({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ width: 'min(560px, 92vw)', borderRadius: 16, padding: 20, background: 'linear-gradient(135deg, rgba(17,24,39,0.95), rgba(31,41,55,0.95))', border: '1px solid rgba(255,255,255,0.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>What does “Featured” do?</h3>
          <button className="admin-button" style={{ background: 'transparent' }} onClick={onClose}>Close</button>
        </div>
        <p style={{ opacity: 0.85, marginTop: 0 }}>Featuring a machine boosts its visibility across AutomatCheck so more customers discover it.</p>
        <ul style={{ lineHeight: 1.6, margin: 0, paddingLeft: 18 }}>
          <li><b>Priority ranking</b>: Featured machines are listed at the top on the homepage and search results in your region.</li>
          <li><b>Attention badge</b>: A ⭐ Featured badge appears on your card and machine page, improving click‑through.</li>
          <li><b>More impressions</b>: Expect higher views and clicks to call or navigate, reflected in your analytics.</li>
          <li><b>Flexible</b>: Feature one or multiple machines for a set period (e.g., 30 days) using your available slots.</li>
        </ul>
        <p style={{ opacity: 0.75, marginTop: 12 }}>Tip: Add great photos and a clear description before featuring to maximize results.</p>
      </div>
    </div>
  );
}
