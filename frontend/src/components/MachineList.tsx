import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchVendingMachines } from '../api';
import type { VendingMachine } from '../types';
import VendingMachineDisplay from './VendingMachineDisplay';
import DarkModeToggle from './DarkModeToggle';
import Gallery from './Gallery';
import VendingMachineLogo from './VendingMachineLogo';
import { useDarkMode } from '../hooks/useDarkMode';
import LoadingSpinner from './LoadingSpinner';

function MachineList() {
  const [machines, setMachines] = useState<VendingMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useDarkMode();

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
  return (
    <>
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <VendingMachineLogo size={48} />
          <div>
            <h1>Vending Machine Info</h1>
            <p style={{ color: '#888', fontWeight: 500 }}>Find out what each vending machine offers and how you can pay!</p>
          </div>
        </div>
        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '4rem' }}>
          <Link to="/login" style={{ 
            textDecoration: 'none', 
            color: 'var(--text-main)', 
            background: 'var(--product-bg)', 
            padding: '0.6rem 1.2rem', 
            borderRadius: '8px', 
            fontSize: '0.9rem',
            opacity: 0.9,
            transition: 'opacity 0.2s, transform 0.2s',
            border: '1px solid rgba(255,255,255,0.1)',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            marginRight: '2rem'
          }}>
            🔐 Login
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: '2rem' }}>
            <DarkModeToggle mode={mode} setMode={setMode} />
          </div>
        </div>
      </div>
      {machines.map((m) => (
        <div key={m.id} className="machine-card">
          <div className="machine-content">
            <Link to={`/machine/${m.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <VendingMachineDisplay machine={m} />
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