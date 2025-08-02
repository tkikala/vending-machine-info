import type { VendingMachine } from '../types';

function PaymentIcon({ type, available }: { type: string; available: boolean }) {
  const getIcon = () => {
    switch (type) {
      case 'COIN': return '🪙';
      case 'BANKNOTE': return '💶';
      case 'GIROCARD': return '💳';
      default: return '💳';
    }
  };

  return (
    <span 
      style={{ 
        opacity: available ? 1 : 0.3,
        fontSize: '1.2rem',
        marginRight: '0.5rem'
      }}
      title={`${type} ${available ? 'Available' : 'Not Available'}`}
    >
      {getIcon()}
    </span>
  );
}

function VendingMachineDisplay({ machine }: { machine: VendingMachine }) {
  const machineProducts = machine.products || [];

  // Function to handle location click
  const handleLocationClick = () => {
    if (machine.coordinates) {
      const [lat, lng] = machine.coordinates.split(',');
      const url = `https://www.google.com/maps?q=${lat.trim()},${lng.trim()}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(machine.location)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="vending-machine">
      <div className="vending-machine-header">
        <div className="machine-info-header">
          <div className="machine-logo">
            {machine.logo ? (
              <img 
                src={machine.logo} 
                alt={`${machine.name} logo`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="logo-placeholder">🏪</div>
            )}
          </div>
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
          <div className="payment-methods">
            {machine.paymentMethods?.map((pm) => (
              <PaymentIcon key={pm.id} type={pm.type} available={pm.available} />
            ))}
          </div>
        </div>
      </div>
      <div className="vending-machine-display">
        {machineProducts.map((machineProduct, index) => {
          const product = machineProduct.product;
          return (
            <div 
              key={machineProduct.id || index} 
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
          );
        })}
      </div>
    </div>
  );
}

export default VendingMachineDisplay; 