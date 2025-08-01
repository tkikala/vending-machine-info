import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchAllMachines, deleteVendingMachine } from '../api';
import type { VendingMachine } from '../types';
import DarkModeToggle from './DarkModeToggle';
import { useDarkMode } from '../hooks/useDarkMode';

function AdminDashboard() {
  const [machines, setMachines] = useState<VendingMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, logout, isAdmin } = useAuth();
  const [mode, setMode] = useDarkMode();

  useEffect(() => {
    loadMachines();
  }, []);

  async function loadMachines() {
    try {
      setLoading(true);
      const data = await fetchAllMachines();
      setMachines(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load machines');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteVendingMachine(id);
      setMachines(prev => prev.filter(m => m.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete machine');
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  }

  if (loading) return <div className="header"><h1>Loading...</h1></div>;
  if (error) return <div className="header"><h1>Error: {error}</h1></div>;

  return (
    <div className="admin-dashboard">
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <Link to="/" className="home-button" title="Home">
              🏠
            </Link>
            <div>
              <h1>Admin Dashboard</h1>
              <p style={{ color: '#888', fontWeight: 500 }}>
                Welcome back, {user?.name}! ({user?.role})
              </p>
            </div>
          </div>
          <div className="header-right">
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
            <DarkModeToggle mode={mode} setMode={setMode} />
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-actions">
          <Link to="/admin/machines/new" className="btn btn-primary">
            + Add New Machine
          </Link>
        </div>

        <div className="machines-grid">
          {machines.map((machine) => (
            <div key={machine.id} className="machine-admin-card">
              <div className="machine-header">
                <div className="machine-logo-section">
                  {machine.logo ? (
                    <img 
                      src={machine.logo} 
                      alt={`${machine.name} logo`}
                      className="machine-logo"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="machine-logo-placeholder">
                      🏪
                    </div>
                  )}
                </div>
                <div className="machine-title-section">
                  <h3>{machine.name}</h3>
                  <div className="machine-status">
                    <span className={`status-badge ${machine.isActive ? 'active' : 'inactive'}`}>
                      {machine.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="machine-info">
                <p><strong>Location:</strong> {machine.location}</p>
                <p><strong>Owner:</strong> {machine.owner.name} ({machine.owner.email})</p>
                <p><strong>Products:</strong> {machine.products?.length || 0}</p>
                <p><strong>Reviews:</strong> {machine.reviews?.length || 0}</p>
              </div>

              <div className="machine-actions">
                <Link to={`/machine/${machine.id}`} className="btn btn-secondary">
                  View
                </Link>
                <Link to={`/admin/machines/${machine.id}/edit`} className="btn btn-secondary">
                  Edit
                </Link>
                {isAdmin && (
                  <button 
                    onClick={() => handleDelete(machine.id, machine.name)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {machines.length === 0 && (
          <div className="empty-state">
            <h3>No machines found</h3>
            <p>Get started by adding your first vending machine.</p>
            <Link to="/admin/machines/new" className="btn btn-primary">
              Add Your First Machine
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard; 