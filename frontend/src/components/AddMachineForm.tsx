import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createVendingMachine, uploadSingleFile, uploadGalleryFiles } from '../api';
import DarkModeToggle from './DarkModeToggle';
import { useDarkMode } from '../hooks/useDarkMode';
import LogoUpload from './LogoUpload';
import GalleryManager from './GalleryManager';

interface Product {
  name: string;
  description: string;
  photo: string;
  price: number | '';
  slotCode: string;
  isAvailable: boolean;
}

interface PaymentMethod {
  type: 'COIN' | 'BANKNOTE' | 'GIROCARD' | 'CREDIT_CARD';
  available: boolean;
}

interface GalleryItem {
  id?: number;
  url: string;
  caption?: string;
  fileType: 'image' | 'video';
  originalName?: string;
  fileSize?: number;
  file?: File;
}

function AddMachineForm() {
  const navigate = useNavigate();
  const [mode, setMode] = useDarkMode();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Machine basic info
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState<string | undefined>(undefined);
  const [logoFile, setLogoFile] = useState<File | undefined>(undefined);

  // Gallery
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  // Products
  const [products, setProducts] = useState<Product[]>([
    { name: '', description: '', photo: '', price: '', slotCode: 'A1', isAvailable: true }
  ]);

  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { type: 'COIN', available: false },
    { type: 'BANKNOTE', available: false },
    { type: 'GIROCARD', available: false },
    { type: 'CREDIT_CARD', available: false }
  ]);

  const addProduct = () => {
    const nextSlot = generateNextSlotCode();
    setProducts([...products, { 
      name: '', 
      description: '', 
      photo: '', 
      price: '', 
      slotCode: nextSlot, 
      isAvailable: true 
    }]);
  };

  const removeProduct = (index: number) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const updateProduct = (index: number, field: keyof Product, value: any) => {
    const updatedProducts = [...products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setProducts(updatedProducts);
  };

  const updatePaymentMethod = (type: PaymentMethod['type'], available: boolean) => {
    setPaymentMethods(prev => 
      prev.map(pm => pm.type === type ? { ...pm, available } : pm)
    );
  };

  const generateNextSlotCode = () => {
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const cols = [1, 2, 3, 4, 5, 6];
    
    const usedSlots = products.map(p => p.slotCode);
    
    for (let row of rows) {
      for (let col of cols) {
        const slotCode = `${row}${col}`;
        if (!usedSlots.includes(slotCode)) {
          return slotCode;
        }
      }
    }
    return 'A1'; // Fallback
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!name.trim() || !location.trim()) {
        throw new Error('Name and location are required');
      }

      // Validate at least one product
      const validProducts = products.filter(p => p.name.trim());
      if (validProducts.length === 0) {
        throw new Error('At least one product is required');
      }

      // Upload logo if selected
      let logoUrl: string | undefined = undefined;
      if (logoFile) {
        console.log('Uploading logo file...');
        const logoUploadResult = await uploadSingleFile(logoFile);
        logoUrl = logoUploadResult.file.url;
        console.log('Logo uploaded successfully:', logoUrl);
      } else if (logo) {
        logoUrl = logo; // Existing logo URL
      }

      // Prepare machine data
      const machineData = {
        name: name.trim(),
        location: location.trim(),
        description: description.trim() || undefined,
        logo: logoUrl || undefined,
        products: validProducts.map(p => ({
          name: p.name.trim(),
          description: p.description.trim() || undefined,
          photo: p.photo.trim() || undefined,
          price: p.price === '' ? undefined : Number(p.price),
          slotCode: p.slotCode,
          isAvailable: p.isAvailable
        })),
        paymentMethods: paymentMethods.map(pm => ({
          type: pm.type,
          available: pm.available
        }))
      };

      // Create the machine first
      const machine = await createVendingMachine(machineData);
      
      // Upload gallery files if any
      if (gallery.length > 0) {
        const galleryFiles = gallery.filter(item => item.file).map(item => item.file!);
        const galleryCaptions = gallery.filter(item => item.file).map(item => item.caption || '');
        
        if (galleryFiles.length > 0) {
          console.log('Uploading gallery files for new machine:', machine.id);
          await uploadGalleryFiles(machine.id, galleryFiles, galleryCaptions);
          console.log('Gallery files uploaded successfully');
        }
      }

      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to create vending machine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-machine-page">
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={() => navigate('/admin')} className="back-button">
              ← Back to Dashboard
            </button>
            <h1>Add New Vending Machine</h1>
          </div>
          <div className="header-right">
            <DarkModeToggle mode={mode} setMode={setMode} />
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
              {loading ? 'Creating...' : 'Create Vending Machine'}
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
            <div className="section-header">
              <h2>Products</h2>
              <button type="button" onClick={addProduct} className="btn btn-secondary">
                + Add Product
              </button>
            </div>
            
            {products.map((product, index) => (
              <div key={index} className="product-form">
                <div className="product-header">
                  <h3>Product {index + 1}</h3>
                  {products.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProduct(index)}
                      className="btn btn-danger"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => updateProduct(index, 'name', e.target.value)}
                      placeholder="Coca Cola"
                      required={index === 0}
                    />
                  </div>
                  <div className="form-group">
                    <label>Slot Code</label>
                    <select
                      value={product.slotCode}
                      onChange={(e) => updateProduct(index, 'slotCode', e.target.value)}
                    >
                      {['A', 'B', 'C', 'D', 'E'].map(row =>
                        [1, 2, 3, 4, 5, 6].map(col => (
                          <option key={`${row}${col}`} value={`${row}${col}`}>
                            {row}{col}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Price (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={product.price}
                      onChange={(e) => updateProduct(index, 'price', e.target.value === '' ? '' : parseFloat(e.target.value))}
                      placeholder="2.50"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      value={product.description}
                      onChange={(e) => updateProduct(index, 'description', e.target.value)}
                      placeholder="Refreshing cola drink"
                    />
                  </div>
                  <div className="form-group">
                    <label>Photo URL</label>
                    <input
                      type="url"
                      value={product.photo}
                      onChange={(e) => updateProduct(index, 'photo', e.target.value)}
                      placeholder="https://example.com/product.jpg"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={product.isAvailable}
                      onChange={(e) => updateProduct(index, 'isAvailable', e.target.checked)}
                    />
                    Available for purchase
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Gallery */}
          <div className="form-section">
            <h2>Gallery</h2>
            <GalleryManager
              initialGallery={gallery}
              onGalleryChange={setGallery}
              disabled={loading}
            />
          </div>

          {/* Payment Methods */}
          <div className="form-section">
            <h2>Payment Methods</h2>
            <div className="payment-methods-grid">
              {paymentMethods.map((pm) => (
                <div key={pm.type} className="payment-method-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={pm.available}
                      onChange={(e) => updatePaymentMethod(pm.type, e.target.checked)}
                    />
                    <span className="payment-method-name">
                      {pm.type === 'COIN' && '🪙 Coin'}
                      {pm.type === 'BANKNOTE' && '💵 Banknote'}
                      {pm.type === 'GIROCARD' && (
                        <>
                          <img src="/images/giro-card-logo.png" alt="Girocard" className="payment-logo" />
                          Girocard
                        </>
                      )}
                      {pm.type === 'CREDIT_CARD' && '💳 Credit Card'}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="form-actions">
            <button type="button" onClick={() => navigate('/admin')} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Creating...' : 'Create Vending Machine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMachineForm; 