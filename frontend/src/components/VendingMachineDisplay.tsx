import React, { useState, useEffect } from 'react';
import type { VendingMachine } from '../types';

function PaymentIcon({ paymentMethod, isAvailable }: { paymentMethod: any; isAvailable: boolean }) {
  const getIcon = () => {
    const type = paymentMethod.type;
    const name = paymentMethod.name;
    
    switch (type) {
      case 'COIN':
        return '🪙';
      case 'BANKNOTE':
        return '💵';
      case 'GIROCARD':
        return (
          <img 
            src="/girocard-logo.png" 
            alt="Girocard" 
            style={{ 
              width: '20px', 
              height: '20px', 
              objectFit: 'contain',
              filter: isAvailable ? 'none' : 'grayscale(100%) opacity(50%)'
            }} 
          />
        );
      case 'CREDIT_CARD':
        return '💳';
      default:
        return '💳';
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      opacity: isAvailable ? 1 : 0.6
    }}>
      <span style={{ fontSize: '20px' }}>{getIcon()}</span>
      <span style={{ fontSize: '14px' }}>{paymentMethod.name}</span>
      <div 
        className={`payment-status ${isAvailable ? 'available' : 'unavailable'}`}
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: isAvailable ? '#4CAF50' : '#f44336'
        }}
      />
    </div>
  );
}

function VendingMachineDisplay({ machine }: { machine: VendingMachine }) {
  const [allPaymentMethods, setAllPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllPaymentMethods = async () => {
      try {
        const response = await fetch('/api/payment-methods');
        if (response.ok) {
          const data = await response.json();
          setAllPaymentMethods(data);
        }
      } catch (error) {
        console.error('Failed to fetch payment methods:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPaymentMethods();
  }, []);

  const machineProducts = machine.products || [];

  const handleLocationClick = () => {
    if (machine.coordinates) {
      // Open Google Maps with coordinates
      window.open(`https://www.google.com/maps?q=${encodeURIComponent(machine.coordinates)}`, '_blank');
    } else {
      // Open Google Maps with location name
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(machine.location)}`, '_blank');
    }
  };

  // Create a map of available payment methods for this machine
  const availablePaymentMethods = new Set(
    machine.paymentMethods?.map(pm => pm.paymentMethodType.type) || []
  );

  return (
    <div className="vending-machine">
      <div className="vending-machine-header">
        <div className="machine-info-header">
          <div className="machine-photo-header">
            {machine.logo && (
              <img 
                src={`${machine.logo}?t=${Date.now()}`}
                alt={`${machine.name} logo`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '12px'
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
          <div className="payment-methods-header">
            {!loading && allPaymentMethods.map((paymentMethod) => (
              <PaymentIcon 
                key={paymentMethod.id} 
                paymentMethod={paymentMethod}
                isAvailable={availablePaymentMethods.has(paymentMethod.type)}
              />
            ))}
          </div>
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