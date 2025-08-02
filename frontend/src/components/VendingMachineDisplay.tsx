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
        return paymentMethod.icon ? (
          <img 
            src={paymentMethod.icon} 
            alt="Girocard" 
            style={{ 
              width: '20px', 
              height: '20px', 
              objectFit: 'contain',
              filter: isAvailable ? 'none' : 'grayscale(100%) opacity(50%)'
            }} 
          />
        ) : '💳';
      case 'CREDIT_CARD':
        return '💳';
      default:
        return '💳';
    }
  };

  const icon = getIcon();
  const isEmoji = typeof icon === 'string';

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px', // Restore consistent gap between icon and text
      opacity: isAvailable ? 1 : 0.6,
      minHeight: '24px', // Ensure consistent height for alignment
      width: '100%' // Take full width to ensure consistent alignment
    }}>
      <div style={{ 
        width: '20px', 
        height: '20px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexShrink: 0, // Prevent icon from shrinking
        fontSize: isEmoji ? '16px' : 'auto', // Smaller font size for emojis
        lineHeight: isEmoji ? '1' : 'auto', // Ensure emoji is centered
        textAlign: 'center' // Center the emoji text
      }}>
        {icon}
      </div>
      <span style={{ 
        fontSize: '14px',
        lineHeight: '1',
        flexShrink: 0, // Prevent text from shrinking
        display: 'flex',
        alignItems: 'center', // Center text vertically
        flex: '1', // Take remaining space
        minWidth: 0 // Allow text to shrink if needed
      }}>
        {paymentMethod.name}
      </span>
      <div 
        className={`payment-status ${isAvailable ? 'available' : 'unavailable'}`}
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: isAvailable ? '#4CAF50' : '#f44336',
          flexShrink: 0, // Prevent status dot from shrinking
          marginLeft: '2px' // Small margin to bring dot closer to text
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
        console.log('🔍 Fetching all payment methods...');
        const response = await fetch('/api/payment-methods');
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Payment methods fetched:', data);
          
          // Debug Girocard specifically
          const girocard = data.find((pm: any) => pm.type === 'GIROCARD');
          console.log('🔍 Girocard data:', girocard);
          
          setAllPaymentMethods(data);
        } else {
          console.error('❌ Failed to fetch payment methods:', response.status);
        }
      } catch (error) {
        console.error('❌ Error fetching payment methods:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPaymentMethods();
  }, []);

  const products = machine.products || [];

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
    machine.paymentMethods?.filter(pm => pm.available).map(pm => pm.type) || []
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
            {loading && <div style={{ color: 'var(--text-muted)' }}>Loading payment methods...</div>}
            {!loading && allPaymentMethods.length === 0 && (
              <div style={{ color: 'var(--text-muted)' }}>No payment methods available</div>
            )}
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
        {products.map((product: Product, index: number) => {
          return (
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
                <div className="product-name">{product.name}</div>
                {product.description && (
                  <div className="product-desc">{product.description}</div>
                )}
                {product.price && (
                  <div className="product-price">€{product.price.toFixed(2)}</div>
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