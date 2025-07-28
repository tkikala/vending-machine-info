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
    <span className="payment-icon">
      <span className="payment-text">{icon} {label}</span>
      <span className={`payment-status ${available ? 'available' : 'unavailable'}`}></span>
    </span>
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

function Gallery({ photos }: { photos: { id: number; url: string }[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  return (
    <>
      <div className="gallery">
        <h3>Gallery</h3>
        <div className="gallery-scroll">
          {photos.map((photo) => (
            <img
              key={photo.id}
              src={photo.url}
              alt="Vending Machine"
              className="gallery-photo"
              onClick={() => setSelectedPhoto(photo.url)}
            />
          ))}
        </div>
      </div>

      {selectedPhoto && (
        <div className="modal-overlay" onClick={() => setSelectedPhoto(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedPhoto} alt="Vending Machine" className="modal-image" />
            <button className="modal-close" onClick={() => setSelectedPhoto(null)}>×</button>
          </div>
        </div>
      )}
    </>
  );
}

function VendingMachineDisplay({ machine }: { machine: VendingMachine }) {
  // Create a 3x4 grid (3 rows, 4 columns) for vending machine slots
  const slots = [];
  const rows = ['A', 'B', 'C'];
  const cols = [1, 2, 3, 4];

  let productIndex = 0;

  for (let row of rows) {
    for (let col of cols) {
      const slotCode = `${row}${col}`;
      const product = machine.products[productIndex];
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
        <div className="machine-info-header">
          <img
            className="owner-logo-header"
            src="/images/vending-machine-default.png"
            alt="Owner Logo"
          />
          <div className="machine-details">
            <h3 style={{ margin: 0 }}>{machine.name}</h3>
            <div style={{ color: 'inherit', opacity: 0.8, fontSize: '0.9rem' }}>{machine.location}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Owner: {machine.owner.name}</div>
          </div>
          <div className="payment-methods-header">
            <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.25rem' }}>Payment:</div>
            {machine.paymentMethods.map((pm) => (
              <PaymentIcon key={pm.id} type={pm.type} available={pm.available} />
            ))}
          </div>
        </div>
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
          <div className="machine-content">
            <VendingMachineDisplay machine={m} />

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

export default App;
