import React, { useEffect, useState } from 'react';
import { fetchMachineStats } from '../api';

export default function MachineAnalytics({ machineId }: { machineId: string }) {
  const [range, setRange] = useState<'7d' | '30d'>('30d');
  const [rows, setRows] = useState<{ date: string; views: number; clicksWebsite: number; clicksPhone: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchMachineStats(machineId, range);
        setRows(data.rows || []);
      } catch (e: any) {
        setError(e.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    })();
  }, [machineId, range]);

  if (loading) return <div>Loading analytics…</div>;
  if (error) return <div>Error: {error}</div>;

  const totalViews = rows.reduce((s, r) => s + (r.views || 0), 0);
  const totalWeb = rows.reduce((s, r) => s + (r.clicksWebsite || 0), 0);
  const totalPhone = rows.reduce((s, r) => s + (r.clicksPhone || 0), 0);

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Analytics</h3>
        <select value={range} onChange={(e) => setRange(e.target.value as any)}>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 16, fontSize: 14 }}>
        <div>Views: <b>{totalViews}</b></div>
        <div>Website clicks: <b>{totalWeb}</b></div>
        <div>Phone clicks: <b>{totalPhone}</b></div>
      </div>
      <div style={{ marginTop: 12 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, fontSize: 12, opacity: 0.9 }}>
            <div style={{ width: 120 }}>{new Date(r.date).toLocaleDateString()}</div>
            <div style={{ width: 80 }}>Views: {r.views || 0}</div>
            <div style={{ width: 120 }}>Website: {r.clicksWebsite || 0}</div>
            <div>Phone: {r.clicksPhone || 0}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
