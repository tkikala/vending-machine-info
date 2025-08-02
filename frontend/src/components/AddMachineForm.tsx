import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createVendingMachine } from '../api';
import type { Product, MachineProduct } from '../types';
import LogoUpload from './LogoUpload';
import ProductSearch from './ProductSearch';
import GalleryManager from './GalleryManager';

interface MachineProductData {
  product: Product;
  isAvailable: boolean;
}

function AddMachineForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Basic machine info
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | undefined>();
  
  // Products and payment methods
  const [machineProducts, setMachineProducts] = useState<MachineProductData[]>([]);
  const [paymentMethods, setPaymentMethods] = useState({
    coin: false,
    banknote: false,
    girocard: false
  });

  const handleProductSelect = (product: Product, isAvailable: boolean) => {
    // Check if product is already added
    const existingIndex = machineProducts.findIndex(mp => mp.product.id === product.id);
    
    if (existingIndex >= 0) {
      // Update existing product availability
      setMachineProducts(prev => prev.map((mp, index) => 
        index === existingIndex ? { ...mp, isAvailable } : mp
      ));
    } else {
      // Add new product
      setMachineProducts(prev => [...prev, { product, isAvailable }]);
    }
  };

  const removeProduct = (productId: string) => {
    setMachineProducts(prev => prev.filter(mp => mp.product.id !== productId));
  };

  const toggleProductAvailability = (productId: string) => {
    setMachineProducts(prev => prev.map(mp => 
      mp.product.id === productId 
        ? { ...mp, isAvailable: !mp.isAvailable }
        : mp
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !location.trim()) {
      setError('Name and location are required');
      return;
    }

    if (machineProducts.length === 0) {
      setError('At least one product is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const machineData = {
        name: name.trim(),
        location: location.trim(),
        description: description.trim() || undefined,
        coordinates: coordinates.trim() || undefined,
        logo: logoUrl || undefined,
        products: machineProducts.map(mp => ({
          productId: mp.product.id,
          isAvailable: mp.isAvailable
        })),
        paymentMethods: Object.entries(paymentMethods)
          .filter(([_, available]) => available)
          .map(([type, _]) => type.toUpperCase())
      };

      const machine = await createVendingMachine(machineData);
      console.log('✅ Machine created:', machine.id);
      navigate(`/machine/${machine.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create machine');
      console.error('❌ Create machine error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-machine-form">
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <button 
              onClick={() => navigate('/admin')} 
              className="back-button"
              disabled={loading}
            >
              ← Back
            </button>
            <div>
              <h1>Add New Vending Machine</h1>
              <p style={{ color: '#888', fontWeight: 500 }}>
                Create a new vending machine with products and payment methods
              </p>
            </div>
          </div>
          <div className="header-right">
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="save-button"
            >
              {loading ? 'Creating...' : 'Create Machine'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="name">Machine Name *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter machine name"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="coordinates">Google Maps Coordinates (Optional)</label>
            <input
              type="text"
              id="coordinates"
              value={coordinates}
              onChange={(e) => setCoordinates(e.target.value)}
              placeholder="52.5200,13.4050 (latitude,longitude)"
              title="Enter coordinates in format: latitude,longitude (e.g., 52.5200,13.4050)"
              disabled={loading}
            />
            <small style={{ color: '#888', fontSize: '0.8rem' }}>
              Format: latitude,longitude (e.g., 52.5200,13.4050). Leave empty to use location name search.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Machine Logo</label>
            <LogoUpload
              currentLogo={logoUrl}
              onLogoChange={setLogoUrl}
              disabled={loading}
            />
          </div>
        </div>

        {/* Products */}
        <div className="form-section">
          <h3>Products</h3>
          <p style={{ color: '#888', marginBottom: '1rem' }}>
            Search for existing products or create new ones
          </p>
          
          <div className="form-group">
            <label>Add Products</label>
            <ProductSearch
              onProductSelect={handleProductSelect}
              disabled={loading}
            />
          </div>

          {/* Selected Products List */}
          {machineProducts.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h4>Selected Products ({machineProducts.length})</h4>
              {machineProducts.map((mp) => (
                <div key={mp.product.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  marginBottom: '0.5rem',
                  background: 'var(--bg-secondary)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                    {mp.product.photo && (
                      <img 
                        src={mp.product.photo} 
                        alt={mp.product.name}
                        style={{
                          width: '40px',
                          height: '40px',
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
                    )}
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                        {mp.product.name}
                      </div>
                      {mp.product.description && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          {mp.product.description}
                        </div>
                      )}
                      {mp.product.price && (
                        <div style={{ fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: 500 }}>
                          €{mp.product.price.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={mp.isAvailable}
                        onChange={() => toggleProductAvailability(mp.product.id)}
                        disabled={loading}
                      />
                      Available
                    </label>
                    <button
                      type="button"
                      onClick={() => removeProduct(mp.product.id)}
                      disabled={loading}
                      style={{
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#c0392b';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#e74c3c';
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="form-section">
          <h3>Payment Methods</h3>
          
          <div className="payment-methods">
            <label className="payment-method">
              <input
                type="checkbox"
                checked={paymentMethods.coin}
                onChange={(e) => setPaymentMethods(prev => ({ ...prev, coin: e.target.checked }))}
                disabled={loading}
              />
              <span className="payment-icon">🪙</span>
              Coin
            </label>
            
            <label className="payment-method">
              <input
                type="checkbox"
                checked={paymentMethods.banknote}
                onChange={(e) => setPaymentMethods(prev => ({ ...prev, banknote: e.target.checked }))}
                disabled={loading}
              />
              <span className="payment-icon">💶</span>
              Banknote
            </label>
            
            <label className="payment-method">
              <input
                type="checkbox"
                checked={paymentMethods.girocard}
                onChange={(e) => setPaymentMethods(prev => ({ ...prev, girocard: e.target.checked }))}
                disabled={loading}
              />
              <span className="payment-icon">💳</span>
              Girocard
            </label>
          </div>
        </div>

        {/* Gallery */}
        <div className="form-section">
          <h3>Gallery</h3>
          <p style={{ color: '#888', marginBottom: '1rem' }}>
            Add photos and videos of your vending machine
          </p>
          <GalleryManager
            initialGallery={[]}
            onGalleryChange={() => {}}
            disabled={loading}
          />
        </div>
      </form>
    </div>
  );
}

export default AddMachineForm; 