import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createVendingMachine, uploadSingleFile, uploadGalleryFiles } from '../api';
import type { Product, MachineProduct } from '../types';
import LogoUpload from './LogoUpload';
import ProductSearch from './ProductSearch';
import GalleryManager from './GalleryManager';

interface MachineProductData {
  product: Product;
  price?: number;
  isAvailable: boolean;
}

function AddMachineForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | undefined>();
  const [logoFile, setLogoFile] = useState<File | undefined>(undefined);
  
  // Gallery
  const [gallery, setGallery] = useState<any[]>([]);

  // Products
  const [machineProducts, setMachineProducts] = useState<MachineProductData[]>([]);
  const [paymentMethods, setPaymentMethods] = useState({
    coin: false,
    banknote: false,
    girocard: false,
    creditCard: false
  });

  const handleProductSelect = (product: Product, isAvailable: boolean, price?: number) => {
    const existingIndex = machineProducts.findIndex(mp => mp.product.id === product.id);
    if (existingIndex >= 0) {
      setMachineProducts(prev => prev.map((mp, index) => 
        index === existingIndex ? { ...mp, isAvailable, price } : mp
      ));
    } else {
      setMachineProducts(prev => [...prev, { product, isAvailable, price }]);
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

  const updateProductPrice = (productId: string, price: number) => {
    setMachineProducts(prev => prev.map(mp => 
      mp.product.id === productId 
        ? { ...mp, price: price > 0 ? price : undefined }
        : mp
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Upload logo if it's a new file
      let logoUrl: string | undefined = undefined;
      if (logoFile) {
        console.log('Uploading new logo file...');
        try {
          const logoUploadResult = await uploadSingleFile(logoFile);
          logoUrl = logoUploadResult.file.url;
          console.log('Logo uploaded successfully:', logoUrl);
        } catch (logoError) {
          console.error('Logo upload failed:', logoError);
          throw new Error('Failed to upload logo. Please try again.');
        }
      }

      const machineData = {
        name: name.trim(),
        location: location.trim(),
        description: description.trim() || undefined,
        coordinates: coordinates.trim() || undefined,
        logo: logoUrl || undefined,
        products: machineProducts.map(mp => ({
          productId: mp.product.id,
          price: mp.price,
          isAvailable: mp.isAvailable
        })),
        paymentMethods: Object.entries(paymentMethods)
          .filter(([_, available]) => available)
          .map(([type, _]) => {
            // Map frontend keys to backend enum values
            switch (type) {
              case 'coin': return 'COIN';
              case 'banknote': return 'BANKNOTE';
              case 'girocard': return 'GIROCARD';
              case 'creditCard': return 'CREDIT_CARD';
              default: return type.toUpperCase();
            }
          })
      };

      const createdMachine = await createVendingMachine(machineData);

      // Handle gallery uploads after machine creation
      const newGalleryFiles = gallery.filter(item => item.file);
      if (newGalleryFiles.length > 0 && createdMachine.id) {
        try {
          const files = newGalleryFiles.map(item => item.file!);
          const captions = newGalleryFiles.map(item => item.caption || '');
          await uploadGalleryFiles(createdMachine.id, files, captions);
          console.log('Gallery files uploaded successfully');
        } catch (galleryError) {
          console.error('Gallery upload failed:', galleryError);
          // Continue even if gallery upload fails
        }
      }

      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to create machine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-machine-form">
      <h2>Add New Vending Machine</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="name">Machine Name *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="coordinates">Coordinates (optional)</label>
            <input
              type="text"
              id="coordinates"
              value={coordinates}
              onChange={(e) => setCoordinates(e.target.value)}
              placeholder="e.g., 52.5200,13.4050"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Logo</h3>
          <p style={{ color: '#888', marginBottom: '1rem' }}>
            Upload a logo for your vending machine
          </p>
          <LogoUpload
            onLogoChange={(logoUrl, file) => {
              setLogoUrl(logoUrl);
              setLogoFile(file);
            }}
            disabled={loading}
          />
        </div>

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
                  border: '1px solid var(--text-muted)', 
                  borderRadius: '8px', 
                  padding: '1rem', 
                  marginBottom: '1rem',
                  backgroundColor: 'var(--card-bg)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                      {mp.product.photo && (
                        <img 
                          src={mp.product.photo} 
                          alt={mp.product.name}
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{mp.product.name}</div>
                        {mp.product.description && (
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{mp.product.description}</div>
                        )}
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                            <input
                              type="checkbox"
                              checked={mp.isAvailable}
                              onChange={() => toggleProductAvailability(mp.product.id)}
                              disabled={loading}
                            />
                            Available
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <label style={{ color: 'var(--text-main)' }}>Price: €</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={mp.price || ''}
                              onChange={(e) => updateProductPrice(mp.product.id, parseFloat(e.target.value) || 0)}
                              placeholder={mp.product.price?.toString() || 'Default'}
                              style={{ 
                                width: '80px', 
                                padding: '0.25rem',
                                backgroundColor: 'var(--bg)',
                                color: 'var(--text-main)',
                                border: '1px solid var(--text-muted)',
                                borderRadius: '4px'
                              }}
                              disabled={loading}
                            />
                            {mp.product.price && !mp.price && (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                (Default: €{mp.product.price.toFixed(2)})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProduct(mp.product.id)}
                      disabled={loading}
                      style={{ 
                        background: '#e74c3c', 
                        color: 'white', 
                        border: 'none', 
                        padding: '0.5rem 1rem', 
                        borderRadius: '4px', 
                        cursor: 'pointer' 
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#c0392b'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#e74c3c'; }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>Payment Methods</h3>
          <p style={{ color: '#888', marginBottom: '1rem' }}>
            Select which payment methods are accepted
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={paymentMethods.coin}
                onChange={(e) => setPaymentMethods(prev => ({ ...prev, coin: e.target.checked }))}
                disabled={loading}
              />
              🪙 Coins
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={paymentMethods.banknote}
                onChange={(e) => setPaymentMethods(prev => ({ ...prev, banknote: e.target.checked }))}
                disabled={loading}
              />
              💶 Banknotes
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={paymentMethods.girocard}
                onChange={(e) => setPaymentMethods(prev => ({ ...prev, girocard: e.target.checked }))}
                disabled={loading}
              />
              💳 Girocard
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={paymentMethods.creditCard}
                onChange={(e) => setPaymentMethods(prev => ({ ...prev, creditCard: e.target.checked }))}
                disabled={loading}
              />
              💳 Credit Card
            </label>
          </div>
        </div>

        <div className="form-section">
          <h3>Gallery</h3>
          <p style={{ color: '#888', marginBottom: '1rem' }}>
            Add photos and videos of your vending machine
          </p>
          <GalleryManager
            initialGallery={gallery}
            onGalleryChange={setGallery}
            disabled={loading}
          />
        </div>

        {error && (
          <div style={{ color: '#e74c3c', marginBottom: '1rem', padding: '1rem', backgroundColor: '#fdf2f2', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            disabled={loading}
            style={{ 
              background: '#6c757d', 
              color: 'white', 
              border: 'none', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              background: '#007bff', 
              color: 'white', 
              border: 'none', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            {loading ? 'Creating...' : 'Create Machine'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddMachineForm; 