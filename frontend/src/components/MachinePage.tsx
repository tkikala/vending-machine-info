import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchVendingMachine } from '../api';
import type { VendingMachine } from '../types';
import VendingMachineDisplay from './VendingMachineDisplay';
import DarkModeToggle from './DarkModeToggle';
import Gallery from './Gallery';
import { useDarkMode } from '../hooks/useDarkMode';

function MachinePage() {
  const { id } = useParams<{ id: string }>();
  const [machine, setMachine] = useState<VendingMachine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useDarkMode();

  useEffect(() => {
    if (!id) return;
    
    fetchVendingMachine(id)
      .then(setMachine)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="header"><h1>Loading...</h1></div>;
  if (error) return <div className="header"><h1>Error: {error}</h1></div>;
  if (!machine) return <div className="header"><h1>Machine not found</h1></div>;

  return (
    <>
      <div className="header">
        <Link to="/" className="home-button" title="Home">
          🏠
        </Link>
        <div className="dark-toggle">
          <DarkModeToggle mode={mode} setMode={setMode} />
        </div>
      </div>
      <div className="machine-card">
        <div className="machine-content">
          <VendingMachineDisplay machine={machine} />

          <Gallery photos={machine.photos} />

          <div style={{ marginTop: '2rem' }}>
            <b>Reviews:</b>
            <ul className="reviews-list">
              {machine.reviews.map((r) => (
                <li key={r.id} className="review-item">
                  <b style={{ color: '#f59e42' }}>{r.rating}★</b> {r.comment}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default MachinePage; 