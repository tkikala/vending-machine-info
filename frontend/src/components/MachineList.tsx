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
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]); // e.g., ['card','girocard','coins','banknotes','cash']
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
    const text = `${m.name} ${m.location} ${(m.products||[]).map((mp:any)=>mp.product?.name||'').join(' ')}`.toLowerCase();
    const matchText = query.trim().length === 0 || text.includes(query.toLowerCase());
    if (selectedPayments.length === 0) return matchText;
    // Consider ONLY enabled (green) payment methods
    const enabledTypes = (m.paymentMethods||[])
      .filter((pm:any)=>pm.available)
      .map((pm:any)=>pm.paymentMethodType?.type);
    const hasCard = enabledTypes.includes('CREDIT_CARD') || enabledTypes.includes('GIROCARD');
    const hasGiro = enabledTypes.includes('GIROCARD');
    const hasCoins = enabledTypes.includes('COIN');
    const hasBanknotes = enabledTypes.includes('BANKNOTE');
    const isCashOnly = (hasCoins || hasBanknotes) && !hasCard;
    const check = (tag:string) => {
      switch(tag){
        case 'card': return hasCard;
        case 'girocard': return hasGiro;
        case 'coins': return hasCoins;
        case 'banknotes': return hasBanknotes;
        case 'cash': return isCashOnly;
        default: return false;
      }
    };
    const matchPay = selectedPayments.every(check);
    return matchText && matchPay;
  });

  return (
    <>
      <div className="header" style={{ position: 'relative' }}>
        <h1 style={{ textAlign: 'center' }}>Vending Machine Info</h1>
        <p style={{ color: '#888', fontWeight: 500, textAlign: 'center' }}>Find out what each vending machine offers and how you can pay!</p>
        <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '8px 12px', maxWidth: 520 }}>
            <span style={{ opacity: 0.8 }}>🔎</span>
            <input placeholder="Search machines, products, locations" value={query} onChange={(e)=>setQuery(e.target.value)} style={{ padding: '6px 6px', borderRadius: 8, border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-main)', flex: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[{k:'card',label:'Card'}, {k:'girocard',label:'Girocard'}, {k:'cash',label:'Cash only'}, {k:'coins',label:'Coins'}, {k:'banknotes',label:'Banknotes'}].map(({k,label})=>{
              const active = selectedPayments.includes(k);
              return (
                <button key={k} onClick={()=>{
                  setSelectedPayments(prev=> active ? prev.filter(x=>x!==k) : [...prev, k]);
                }} style={{
                  padding: '6px 12px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.12)',
                  background: active ? 'linear-gradient(135deg,#4f46e5,#9333ea)' : 'transparent', color: 'var(--text-main)', fontWeight: 600
                }}>{label}</button>
              );
            })}
            {selectedPayments.length>0 && (
              <button onClick={()=>setSelectedPayments([])} style={{ padding:'6px 10px', borderRadius:999, border:'1px solid rgba(255,255,255,0.12)', background:'transparent', color:'var(--text-main)' }}>Clear</button>
            )}
          </div>
        </div>
        {/* Top-right compact auth group */}
        <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {user ? (
            <>
              <Link to="/my-machines" className="admin-button" style={{ padding: '6px 10px' }}>🧑‍💼 My Machines</Link>
              {isAdmin && (
                <Link to="/admin" className="admin-button" style={{ padding: '6px 10px' }}>🛠️ Admin</Link>
              )}
              <button onClick={async () => { try { await logout(); } catch {} }} className="admin-button" style={{ padding: '6px 10px', background: 'transparent' }}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="admin-button" style={{ padding: '6px 10px', background: 'linear-gradient(135deg,#4f46e5,#9333ea)' }}>🔐 Login</Link>
          )}
          <DarkModeToggle mode={mode} setMode={setMode} />
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