import React, { useState } from 'react';
import type { VendingMachine } from '../types';

function PaymentIcon({ paymentMethod, isAvailable }: { paymentMethod: any; isAvailable: boolean }) {
  const getIcon = () => {
    switch (paymentMethod.type) {
      case 'COIN':
        return '🪙';
      case 'BANKNOTE':
        return '💵';
      case 'GIROCARD':
        return '💳';
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
      gap: '0.5rem',
      fontSize: '0.9rem',
      color: 'var(--text-main)',
      padding: '0.25rem 0.5rem',
      borderRadius: '6px',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      width: '100%',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1rem' }}>{getIcon()}</span>
        <span>{paymentMethod.name}</span>
      </div>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: isAvailable ? '#4CAF50' : '#f44336',
        flexShrink: 0
      }} />
    </div>
  );
}

function VendingMachineDisplay({ machine }: { machine: VendingMachine }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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

  // Get all available payment method types in the correct order
  const allPaymentMethodTypes = [
    { type: 'COIN' as const, name: 'Coins', icon: '🪙' },
    { type: 'BANKNOTE' as const, name: 'Banknotes', icon: '💵' },
    { type: 'GIROCARD' as const, name: 'Girocard', icon: '💳' },
    { type: 'CREDIT_CARD' as const, name: 'Creditcard', icon: '💳' }
  ];

  // Create a map of available payment methods for this machine
  const machinePaymentMethods = new Map(
    machine.paymentMethods?.map(pm => [pm.paymentMethodType.type, pm.available]) || []
  );

  // Get unique categories from products
  const categories = ['all', ...Array.from(new Set(products.map((mp: any) => mp.product.category || 'Other')))];
  
  // Filter products by selected category
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter((mp: any) => (mp.product.category || 'Other') === selectedCategory);

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
            {allPaymentMethodTypes.map((paymentMethod) => (
              <PaymentIcon 
                key={paymentMethod.type} 
                paymentMethod={paymentMethod}
                isAvailable={machinePaymentMethods.get(paymentMethod.type) || false}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Category Filter Capsules */}
      {categories.length > 1 && (
        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`category-filter ${selectedCategory === category ? 'active' : ''}`}
            >
              {category === 'all' ? 'All Products' : category}
            </button>
          ))}
        </div>
      )}

      <div className="vending-machine-display">
        {filteredProducts.map((machineProduct: any, index: number) => {
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
                <div className="product-name">{product.name}</div>
                {product.description && (
                  <div className="product-desc">{product.description}</div>
                )}
                {(machineProduct.price || product.price) && (
                  <div className="product-price">€{(machineProduct.price || product.price).toFixed(2)}</div>
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