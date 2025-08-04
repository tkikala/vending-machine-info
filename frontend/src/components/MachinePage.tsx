import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchVendingMachine } from '../api';
import type { VendingMachine } from '../types';
import VendingMachineDisplay from './VendingMachineDisplay';
import DarkModeToggle from './DarkModeToggle';
import Gallery from './Gallery';
import Reviews from './Reviews';
import { useDarkMode } from '../hooks/useDarkMode';
import LoadingSpinner from './LoadingSpinner';

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <LoadingSpinner />;
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

          <div className="machine-meta">
            <p className="last-updated">
              Last updated: {formatDate(machine.updatedAt)}
            </p>
          </div>

          <Gallery photos={machine.photos} />

          <Reviews machineId={machine.id} machineName={machine.name} />
        </div>
      </div>
    </>
  );
}

export default MachinePage; 