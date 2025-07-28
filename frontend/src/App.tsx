import { useEffect, useState } from 'react';
import { fetchVendingMachines } from './api';
import './App.css';

type Product = {
  id: number;
  name: string;
  description?: string;
  photo?: string;
};

type PaymentMethod = {
  id: number;
  type: 'COIN' | 'BANKNOTE' | 'CREDIT_CARD';
  available: boolean;
};

type Photo = {
  id: number;
  url: string;
};

type Review = {
  id: number;
  rating: number;
  comment: string;
  userId: number;
  createdAt: string;
};

type Owner = {
  id: number;
  name: string;
};

type VendingMachine = {
  id: number;
  name: string;
  location: string;
  products: Product[];
  paymentMethods: PaymentMethod[];
  photos: Photo[];
  reviews: Review[];
  owner: Owner;
};

function PaymentIcon({ type, available }: { type: string; available: boolean }) {
  let icon = '';
  let label = '';
  if (type === 'COIN') {
    icon = '🪙';
    label = 'Coin';
  } else if (type === 'BANKNOTE') {
    icon = '💵';
    label = 'Banknote';
  } else {
    icon = '💳';
    label = 'Credit Card';
  }
  return (
    <span className={`payment-icon ${available ? 'available' : 'unavailable'}`}>{icon} {label}</span>
  );
}

function useDarkMode() {
  // Only "light" or "dark"; default to browser preference on first load
  const getInitial = () => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  const [mode, setMode] = useState<'light' | 'dark'>(getInitial);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('theme', mode);
  }, [mode]);

  return [mode, setMode] as const;
}

function DarkModeToggle({ mode, setMode }: { mode: string; setMode: (m: 'light' | 'dark') => void }) {
  return (
    <div className="dark-toggle">
      <button
        aria-label="Light mode"
        className={mode === 'light' ? 'active' : ''}
        onClick={() => setMode('light')}
        title="Light mode"
        type="button"
      >
        <span role="img" aria-label="Light">🌞</span>
      </button>
      <button
        aria-label="Dark mode"
        className={mode === 'dark' ? 'active' : ''}
        onClick={() => setMode('dark')}
        title="Dark mode"
        type="button"
      >
        <span role="img" aria-label="Dark">🌙</span>
      </button>
    </div>
  );
}

function VendingMachineDisplay({ products }: { products: Product[] }) {
  // Create a 3x4 grid (3 rows, 4 columns) for vending machine slots
  const slots = [];
  const rows = ['A', 'B', 'C'];
  const cols = [1, 2, 3, 4];
  
  let productIndex = 0;
  
  for (let row of rows) {
    for (let col of cols) {
      const slotCode = `${row}${col}`;
      const product = products[productIndex];
      slots.push({
        code: slotCode,
        product: product || null,
      });
      productIndex++;
    }
  }
  
  return (
    <div className="vending-machine">
      <div className="vending-machine-header">
        <h3>Select Your Item</h3>
      </div>
      <div className="vending-machine-display">
        {slots.map((slot) => (
          <div key={slot.code} className="vending-slot">
            <div className="slot-code">{slot.code}</div>
            {slot.product ? (
              <div className="slot-product">
                <div className="product-image">
                  {slot.product.photo ? (
                    <img src={slot.product.photo} alt={slot.product.name} />
                  ) : (
                    <div className="product-placeholder">📦</div>
                  )}
                </div>
                <div className="product-name">{slot.product.name}</div>
                <div className="product-desc">{slot.product.description}</div>
              </div>
            ) : (
              <div className="slot-empty">
                <div className="empty-placeholder">Empty</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
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
          <div className="machine-header">
            <img
              className="machine-photo"
              src={m.photos[0]?.url || 'https://via.placeholder.com/120x120?text=No+Photo'}
              alt="Vending Machine"
            />
            <div className="machine-info">
              <h2 style={{ margin: 0 }}>{m.name}</h2>
              <div style={{ color: '#666', marginBottom: 4 }}>{m.location}</div>
              <div style={{ fontSize: '0.98rem', color: '#888' }}>Owner: {m.owner.name}</div>
            </div>
          </div>
          
          <div className="machine-content">
            <VendingMachineDisplay products={m.products} />
            
            <div style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                <div style={{ flex: 1 }}>
                  <b>Payment Methods:</b>
                  <div className="payment-methods">
                    {m.paymentMethods.map((pm) => (
                      <PaymentIcon key={pm.id} type={pm.type} available={pm.available} />
                    ))}
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: '1.5rem' }}>
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
        </div>
      ))}
    </>
  );
}

export default App;
