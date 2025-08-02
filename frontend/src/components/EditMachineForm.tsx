import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchVendingMachine, updateVendingMachine, uploadSingleFile, uploadGalleryFiles } from '../api';
import type { VendingMachine, Product, MachineProduct } from '../types';
import LogoUpload from './LogoUpload';
import ProductSearch from './ProductSearch';
import GalleryManager from './GalleryManager';

interface MachineProductData {
  product: Product;
  price?: number;
  isAvailable: boolean;
}

function EditMachineForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingMachine, setLoadingMachine] = useState(true);
  const [error, setError] = useState('');

  // Machine basic info
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [logo, setLogo] = useState<string | undefined>(undefined);
  const [logoFile, setLogoFile] = useState<File | undefined>(undefined);

  // Gallery
  const [gallery, setGallery] = useState<any[]>([]);

  // Products
  const [machineProducts, setMachineProducts] = useState<MachineProductData[]>([]);

  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState({
    coin: false,
    banknote: false,
    girocard: false,
    creditCard: false
  });

  useEffect(() => {
    loadMachine();
  }, [id]);

  const loadMachine = async () => {
    if (!id) {
      navigate('/admin');
      return;
    }

    try {
      setLoadingMachine(true);
      const machine: VendingMachine = await fetchVendingMachine(id);
      
      // Set basic info
      setName(machine.name);
      setLocation(machine.location);
      setDescription(machine.description || '');
      setCoordinates(machine.coordinates || '');
      setLogo(machine.logo || undefined);

      // Set products
      const products: MachineProductData[] = machine.products.map(mp => ({
        product: mp.product,
        price: mp.price,
        isAvailable: mp.isAvailable
      }));
      setMachineProducts(products);

      // Set payment methods
      const pmState = {
        coin: false,
        banknote: false,
        girocard: false,
        creditCard: false
      };
      
      machine.paymentMethods.forEach(pm => {
        const type = pm.paymentMethodType.type.toLowerCase();
        if (type === 'coin') pmState.coin = pm.available;
        if (type === 'banknote') pmState.banknote = pm.available;
        if (type === 'girocard') pmState.girocard = pm.available;
        if (type === 'credit_card') pmState.creditCard = pm.available;
      });
      setPaymentMethods(pmState);

      // Set gallery
      setGallery(machine.photos || []);

    } catch (err: any) {
      setError(err.message || 'Failed to load machine');
    } finally {
      setLoadingMachine(false);
    }
  };

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
    if (!id) return;

    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!name.trim() || !location.trim()) {
        throw new Error('Name and location are required');
      }

      // Validate at least one product
      if (machineProducts.length === 0) {
        throw new Error('At least one product is required');
      }

      // Upload logo if it's a new file
      let logoUrl: string | undefined = logo;
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

      // Handle gallery uploads separately
      const newGalleryFiles = gallery.filter(item => item.file);
      if (newGalleryFiles.length > 0 && id) {
        try {
          const files = newGalleryFiles.map(item => item.file!);
          const captions = newGalleryFiles.map(item => item.caption || '');
          await uploadGalleryFiles(id, files, captions);
          console.log('Gallery files uploaded successfully');
        } catch (galleryError) {
          console.error('Gallery upload failed:', galleryError);
          // Continue with machine update even if gallery upload fails
        }
      }

      // Prepare machine data (without files to avoid payload size issues)
      const machineData = {
        name: name.trim(),
        location: location.trim(),
        description: description.trim() || undefined,
        coordinates: coordinates.trim() || undefined,
        logo: logoUrl,
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

      await updateVendingMachine(id, machineData);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to update vending machine');
    } finally {
      setLoading(false);
    }
  };

  if (loadingMachine) {
    return (
      <div className="add-machine-page">
        <div className="header">
          <div className="header-content">
            <div className="header-left">
              <button onClick={() => navigate('/admin')} className="back-button">
                ← Back to Dashboard
              </button>
              <h1>Loading...</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-machine-page">
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={() => navigate('/admin')} className="back-button">
              ← Back to Dashboard
            </button>
            <h1>Edit Vending Machine</h1>
          </div>
        </div>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="machine-form">
          {error && <div className="error-message">{error}</div>}
          
          {/* Top Save Actions */}
          <div className="form-actions form-actions-top">
            <button type="button" onClick={() => navigate('/admin')} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Basic Information */}
          <div className="form-section">
            <h2>Basic Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Machine Name *</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Central Park Vending"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Central Park, Near Main Entrance"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description of the vending machine"
                rows={3}
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
              />
              <small style={{ color: '#888', fontSize: '0.8rem' }}>
                Format: latitude,longitude (e.g., 52.5200,13.4050). Leave empty to use location name search.
              </small>
            </div>
            
            {/* Logo Upload */}
            <LogoUpload
              currentLogo={logo}
              onLogoChange={(logoUrl, file) => {
                setLogo(logoUrl);
                setLogoFile(file);
              }}
              disabled={loading}
            />
          </div>

          {/* Products */}
          <div className="form-section">
            <h2>Products</h2>
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

          {/* Gallery */}
          <div className="form-section">
            <h2>Gallery</h2>
            <GalleryManager
              initialGallery={gallery}
              onGalleryChange={setGallery}
              machineId={id}
              disabled={loading}
            />
          </div>

          {/* Payment Methods */}
          <div className="form-section">
            <h2>Payment Methods</h2>
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

          {/* Submit */}
          <div className="form-actions">
            <button type="button" onClick={() => navigate('/admin')} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditMachineForm; 