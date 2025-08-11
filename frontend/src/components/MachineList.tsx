import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchVendingMachines } from '../api';
import type { VendingMachine } from '../types';
import VendingMachineDisplay from './VendingMachineDisplay';
import DarkModeToggle from './DarkModeToggle';
import Gallery from './Gallery';
import { useDarkMode } from '../hooks/useDarkMode';
import LoadingSpinner from './LoadingSpinner';

function MachineList() {
  const [machines, setMachines] = useState<VendingMachine[]>([]);
  const [query, setQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useDarkMode();
  const { user, isAdmin, logout } = useAuth() as any;

  useEffect(() => {
    console.log('🚀 MachineList component mounted');
    console.log('🔍 Starting to fetch vending machines...');
    
    fetchVendingMachines()
      .then((data) => {
        console.log('✅ fetchVendingMachines succeeded:', data);
        setMachines(data);
      })
      .catch((e) => {
        console.error('❌ fetchVendingMachines failed:', e);
        setError(e.message);
      })
      .finally(() => {
        console.log('🏁 fetchVendingMachines completed, setting loading to false');
        setLoading(false);
      });
  }, []);

  console.log('🔄 MachineList render - loading:', loading, 'error:', error, 'machines:', machines.length);

  if (loading) {
    console.log('⏳ Showing loading state');
    return <LoadingSpinner />;
  }
  
  if (error) {
    console.log('❌ Showing error state:', error);
    return <div className="header"><h1>Error: {error}</h1></div>;
  }

  console.log('✅ Rendering machines:', machines.length);
  const filtered = machines.filter((m) => {
    const text = `${m.name} ${m.location} ${(m.products||[]).map((p:any)=>p.name).join(' ')}`.toLowerCase();
    const matchText = text.includes(query.toLowerCase());
    const matchPay = paymentFilter ? (m.paymentMethods||[]).some((pm:any)=>pm.paymentMethodType?.type === paymentFilter) : true;
    return matchText && matchPay;
  });

  return (
    <>
      <div className="header">
        <h1>Vending Machine Info</h1>
        <p style={{ color: '#888', fontWeight: 500 }}>Find out what each vending machine offers and how you can pay!</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input placeholder="Search products or locations" value={query} onChange={(e)=>setQuery(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'var(--text-main)' }} />
          <select value={paymentFilter} onChange={(e)=>setPaymentFilter(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'var(--text-main)' }}>
            <option value="">All Payments</option>
            <option value="GIROCARD">Girocard</option>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="COIN">Coins</option>
            <option value="BANKNOTE">Banknotes</option>
          </select>
        </div>
        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          {user ? (
            <>
              <Link to="/my-machines" style={{
                textDecoration: 'none', color: 'var(--text-main)', background: 'var(--product-bg)',
                padding: '0.6rem 1.0rem', borderRadius: '10px', fontSize: '0.9rem', opacity: 0.95,
                transition: 'opacity 0.2s, transform 0.2s', border: '1px solid rgba(255,255,255,0.12)', fontWeight: 600
              }}>🧑‍💼 My Machines</Link>
              {isAdmin && (
                <Link to="/admin" style={{
                  textDecoration: 'none', color: 'var(--text-main)', background: 'var(--product-bg)',
                  padding: '0.6rem 1.0rem', borderRadius: '10px', fontSize: '0.9rem', opacity: 0.95,
                  transition: 'opacity 0.2s, transform 0.2s', border: '1px solid rgba(255,255,255,0.12)', fontWeight: 600
                }}>🛠️ Admin</Link>
              )}
              <button onClick={async () => { try { await logout(); } catch {} }} style={{
                textDecoration: 'none', color: 'var(--text-main)', background: 'transparent',
                padding: '0.6rem 1.0rem', borderRadius: '10px', fontSize: '0.9rem', opacity: 0.9,
                transition: 'opacity 0.2s, transform 0.2s', border: '1px solid rgba(255,255,255,0.12)', fontWeight: 600
              }}>Logout</button>
            </>
          ) : (
            <Link to="/login" style={{
              textDecoration: 'none', color: 'var(--text-main)', background: 'linear-gradient(135deg,#4f46e5,#9333ea)',
              padding: '0.6rem 1.2rem', borderRadius: '10px', fontSize: '0.95rem', opacity: 0.98,
              transition: 'opacity 0.2s, transform 0.2s', border: '1px solid rgba(255,255,255,0.12)', fontWeight: 700
            }}>🔐 Login</Link>
          )}
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: '2rem' }}>
            <DarkModeToggle mode={mode} setMode={setMode} />
          </div>
        </div>
      </div>
      {filtered.map((m) => (
        <div key={m.id} className="machine-card">
          <div className="machine-content">
            <Link to={`/machine/${m.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <VendingMachineDisplay machine={m as any} />
            </Link>

            <Gallery photos={m.photos || []} />

            <div style={{ marginTop: '2rem' }}>
              <b>Reviews:</b>
              <ul className="reviews-list">
                {(m.reviews || []).map((r) => (
                  <li key={r.id} className="review-item">
                    <b style={{ color: '#f59e42' }}>{r.rating}★</b> {r.comment}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default MachineList; 