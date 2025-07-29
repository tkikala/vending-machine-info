import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchVendingMachines } from '../api';
import type { VendingMachine } from '../types';
import VendingMachineDisplay from './VendingMachineDisplay';
import DarkModeToggle from './DarkModeToggle';
import Gallery from './Gallery';
import { useDarkMode } from '../hooks/useDarkMode';

function MachineList() {
  const [machines, setMachines] = useState<VendingMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useDarkMode();

  useEffect(() => {
    fetchVendingMachines()
      .then(setMachines)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="header"><h1>Loading...</h1></div>;
  if (error) return <div className="header"><h1>Error: {error}</h1></div>;

  return (
    <>
      <div className="header">
        <h1>Vending Machine Info</h1>
        <p style={{ color: '#888', fontWeight: 500 }}>Find out what each vending machine offers and how you can pay!</p>
        <div className="dark-toggle">
          <DarkModeToggle mode={mode} setMode={setMode} />
        </div>
      </div>
      {machines.map((m) => (
        <div key={m.id} className="machine-card">
          <div className="machine-content">
            <Link to={`/machine/${m.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <VendingMachineDisplay machine={m} />
            </Link>

            <Gallery photos={m.photos} />

            <div style={{ marginTop: '2rem' }}>
              <b>Reviews:</b>
              <ul className="reviews-list">
                {m.reviews.map((r) => (
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