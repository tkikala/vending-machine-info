import React, { useEffect, useState } from 'react';

export function EmbedPreview({ machineId }: { machineId: string }) {
  const src = `${window.location.origin}/api/embed/${machineId}`;
  return (
    <iframe title="Vending Machine" src={src} style={{ width: 340, height: 500, border: '1px solid #333', borderRadius: 12 }} />
  );
}

export function EmbedSnippet({ machineId }: { machineId: string }) {
  const code = `<iframe title="Vending Machine" src="${window.location.origin}/api/embed/${machineId}" style="width:340px;height:500px;border:0;" ></iframe>`;
  return (
    <div>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Embed code</div>
      <textarea readOnly value={code} style={{ width: '100%', height: 120 }} />
      <button className="admin-button" onClick={async () => { await navigator.clipboard.writeText(code); }}>Copy</button>
    </div>
  );
}

export default function EmbedWidget() { return null; }
