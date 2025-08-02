import React from 'react';
import type { VendingMachine } from '../types';

function PaymentIcon({ paymentMethod }: { paymentMethod: any }) {
  const { paymentMethodType, available } = paymentMethod;
  
  const getIcon = () => {
    return paymentMethodType.icon || '💳';
  };

  return (
    <div className="payment-icon">
      <span className="payment-text">{paymentMethodType.name}</span>
      <span 
        style={{ 
          opacity: available ? 1 : 0.3,
          fontSize: '1.2rem'
        }}
        title={`${paymentMethodType.name} ${available ? 'Available' : 'Not Available'}`}
      >
        {getIcon()}
      </span>
    </div>
  );
}

function VendingMachineDisplay({ machine }: { machine: VendingMachine }) {
  const machineProducts = machine.products || [];

  const handleLocationClick = () => {
    if (machine.coordinates) {
      // Open Google Maps with coordinates
      window.open(`https://www.google.com/maps?q=${machine.coordinates}`, '_blank');
    } else {
      // Open Google Maps with location name
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(machine.location)}`, '_blank');
    }
  };

  return (
    <div className="vending-machine">
      <div className="vending-machine-header">
        <div className="machine-info-header">
          <div className="machine-photo-header">
            {machine.logo && (
              <img 
                src={machine.logo} 
                alt={`${machine.name} logo`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
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
            {machine.description && (
              <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.25rem' }}>
                {machine.description}
              </div>
            )}
          </div>
        </div>
        <div className="payment-methods-header">
          {machine.paymentMethods?.map((pm) => (
            <PaymentIcon key={pm.id} paymentMethod={pm} />
          ))}
        </div>
      </div>
      <div className="vending-machine-display">
        {machineProducts.map((machineProduct, index) => {
          const product = machineProduct.product;
          const displayPrice = machineProduct.price !== null && machineProduct.price !== undefined 
            ? machineProduct.price 
            : product.price;
          
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
                <div className="product-name">{product.name}</div>
                {product.description && (
                  <div className="product-desc">{product.description}</div>
                )}
                {displayPrice && (
                  <div className="product-price">€{displayPrice.toFixed(2)}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VendingMachineDisplay; 