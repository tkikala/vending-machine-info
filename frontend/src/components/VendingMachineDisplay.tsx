import React from 'react';
import type { VendingMachine } from '../types';

function PaymentIcon({ paymentMethod }: { paymentMethod: any }) {
  const { paymentMethodType, available } = paymentMethod;
  
  const getIcon = () => {
    return paymentMethodType.icon || '💳';
  };

  return (
    <span 
      style={{ 
        opacity: available ? 1 : 0.3,
        fontSize: '1.2rem',
        marginRight: '0.5rem'
      }}
      title={`${paymentMethodType.name} ${available ? 'Available' : 'Not Available'}`}
    >
      {getIcon()}
    </span>
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
        <div className="machine-info">
          {machine.logo && (
            <div className="machine-logo">
              <img src={machine.logo} alt="Machine logo" />
            </div>
          )}
          <div className="machine-details">
            <h2>{machine.name}</h2>
            <div 
              className="location"
              onClick={handleLocationClick}
              style={{
                cursor: 'pointer',
                color: '#007bff',
                textDecoration: 'underline',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#0056b3'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#007bff'; }}
            >
              📍 {machine.location}
            </div>
            {machine.description && (
              <p className="machine-description">{machine.description}</p>
            )}
          </div>
        </div>
        <div className="payment-methods">
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
                <div className="product-info">
                  <div className="product-name">{product.name}</div>
                  {product.description && (
                    <div className="product-description">{product.description}</div>
                  )}
                  {displayPrice && (
                    <div className="product-price">€{displayPrice.toFixed(2)}</div>
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