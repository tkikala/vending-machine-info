import type { VendingMachine } from '../types';

function PaymentIcon({ type, available }: { type: string; available: boolean }) {
  let icon = '';
  let label = '';
  let isImageIcon = false;
  
  if (type === 'COIN') {
    icon = '🪙';
    label = 'Coin';
  } else if (type === 'BANKNOTE') {
    icon = '💵';
    label = 'Banknote';
  } else if (type === 'GIROCARD') {
    icon = '/images/giro-card-logo.png';
    label = 'Girocard';
    isImageIcon = true;
  } else {
    icon = '💳';
    label = 'Credit Card';
  }
  
  return (
    <span className="payment-icon">
      <span className="payment-text">
        {isImageIcon ? (
          <>
            <img src={icon} alt="Girocard" className="payment-logo" />
            <span>{label}</span>
          </>
        ) : (
          <>
            <span className="payment-emoji">{icon}</span>
            <span>{label}</span>
          </>
        )}
      </span>
      <span className={`payment-status ${available ? 'available' : 'unavailable'}`}></span>
    </span>
  );
}

function VendingMachineDisplay({ machine }: { machine: VendingMachine }) {
  // Create a simple grid for vending machine products
  const products = machine.products || [];

  // Function to handle location click
  const handleLocationClick = () => {
    if (machine.coordinates) {
      // Open Google Maps with coordinates
      const [lat, lng] = machine.coordinates.split(',');
      const url = `https://www.google.com/maps?q=${lat.trim()},${lng.trim()}`;
      window.open(url, '_blank');
    } else {
      // Fallback: search for location name
      const url = `https://www.google.com/maps/search/${encodeURIComponent(machine.location)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="vending-machine">
      <div className="vending-machine-header">
        <div className="machine-info-header">
          <img
            className="owner-logo-header"
            src={machine.logo || "/images/vending-machine-default.png"}
            alt="Owner Logo"
          />
          <div className="machine-details">
            <h3 style={{ margin: 0 }}>{machine.name}</h3>
            <div 
              style={{ 
                color: 'inherit', 
                opacity: 0.8, 
                fontSize: '0.9rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                textDecorationColor: 'rgba(255,255,255,0.3)',
                transition: 'opacity 0.2s'
              }}
              onClick={handleLocationClick}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.textDecorationColor = 'rgba(255,255,255,0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.8';
                e.currentTarget.style.textDecorationColor = 'rgba(255,255,255,0.3)';
              }}
            >
              📍 {machine.location}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Owner: {machine.owner?.name || 'Unknown'}</div>
          </div>
          <div className="payment-methods-header">
            <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.25rem' }}>Payment:</div>
            {(machine.paymentMethods || []).map((pm) => (
              <PaymentIcon key={pm.id} type={pm.type} available={pm.available} />
            ))}
          </div>
        </div>
      </div>
      <div className="vending-machine-display">
        {products.map((product, index) => (
          <div 
            key={product.id || index} 
            className="vending-slot"
          >
            <div className="slot-product">
              <div className="product-image">
                {product.photo ? (
                  <img src={product.photo} alt={product.name} />
                ) : (
                  <div className="product-placeholder">📦</div>
                )}
              </div>
              <div className="product-info">
                <div className="product-name">{product.name}</div>
                {product.description && (
                  <div className="product-description">{product.description}</div>
                )}
                {product.price && (
                  <div className="product-price">€{product.price.toFixed(2)}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VendingMachineDisplay; 