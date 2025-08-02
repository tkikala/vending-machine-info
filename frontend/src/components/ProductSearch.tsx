import { useState, useEffect, useRef } from 'react';
import { searchProducts, createProduct } from '../api';
import type { Product } from '../types';
import ProductPhotoUpload from './ProductPhotoUpload';

interface ProductSearchProps {
  onProductSelect: (product: Product, isAvailable: boolean) => void;
  disabled?: boolean;
}

function ProductSearch({ onProductSelect, disabled = false }: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    photo: '',
    price: ''
  });
  const [creatingProduct, setCreatingProduct] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery.trim());
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (query: string) => {
    try {
      setIsSearching(true);
      const results = await searchProducts(query);
      setSearchResults(results);
      setShowDropdown(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    onProductSelect(product, true);
    setSearchQuery('');
    setShowDropdown(false);
    setShowNewProductForm(false);
  };

  const handleCreateNewProduct = async () => {
    if (!newProduct.name.trim()) return;

    try {
      setCreatingProduct(true);
      const product = await createProduct({
        name: newProduct.name.trim(),
        description: newProduct.description.trim() || undefined,
        photo: newProduct.photo || undefined,
        price: newProduct.price ? parseFloat(newProduct.price) : undefined
      });

      // Select the newly created product
      handleProductSelect(product);
    } catch (error) {
      console.error('Failed to create product:', error);
      alert('Failed to create product. Please try again.');
    } finally {
      setCreatingProduct(false);
    }
  };

  const handleShowNewProductForm = () => {
    setNewProduct({ name: searchQuery, description: '', photo: '', price: '' });
    setShowNewProductForm(true);
    setShowDropdown(false);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }} ref={dropdownRef}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Search for products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            fontSize: '1rem',
            background: 'var(--bg-main)',
            color: 'var(--text-main)'
          }}
        />
        {isSearching && (
          <div style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            animation: 'spin 1s linear infinite'
          }}>
            🔍
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showDropdown && searchResults.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'var(--bg-main)',
          border: '1px solid var(--border-color)',
          borderRadius: '4px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {searchResults.map((product) => (
            <div
              key={product.id}
              style={{
                padding: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderBottom: '1px solid var(--border-color)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              onClick={() => handleProductSelect(product)}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                  {product.name}
                </div>
                {product.description && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {product.description}
                  </div>
                )}
                {product.price && (
                  <div style={{ fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: 500 }}>
                    €{product.price.toFixed(2)}
                  </div>
                )}
              </div>
              {product.photo && (
                <img 
                  src={product.photo} 
                  alt={product.name} 
                  style={{
                    width: '40px',
                    height: '40px',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                />
              )}
            </div>
          ))}
          
          {/* Add New Product Option */}
          <div
            style={{
              padding: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--bg-secondary)',
              fontStyle: 'italic'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onClick={handleShowNewProductForm}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                ➕ Add "{searchQuery}" as new product
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Product Form */}
      {showNewProductForm && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          border: '1px solid var(--border-color)',
          borderRadius: '4px',
          background: 'var(--bg-secondary)'
        }}>
          <h4>Add New Product</h4>
          
          <div style={{ marginBottom: '1rem' }}>
            <label>Product Name *</label>
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Product name"
              disabled={creatingProduct}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                background: 'var(--bg-main)',
                color: 'var(--text-main)'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Description</label>
            <input
              type="text"
              value={newProduct.description}
              onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Product description"
              disabled={creatingProduct}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                background: 'var(--bg-main)',
                color: 'var(--text-main)'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Price (€)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={newProduct.price}
              onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
              placeholder="0.00"
              disabled={creatingProduct}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                background: 'var(--bg-main)',
                color: 'var(--text-main)'
              }}
            />
          </div>

          <ProductPhotoUpload
            currentPhoto={newProduct.photo}
            onPhotoChange={(photoUrl) => setNewProduct(prev => ({ ...prev, photo: photoUrl || '' }))}
            disabled={creatingProduct}
          />

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={handleCreateNewProduct}
              disabled={creatingProduct || !newProduct.name.trim()}
              style={{
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: creatingProduct || !newProduct.name.trim() ? 'not-allowed' : 'pointer',
                opacity: creatingProduct || !newProduct.name.trim() ? 0.5 : 1
              }}
            >
              {creatingProduct ? 'Creating...' : 'Create Product'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNewProductForm(false);
                setNewProduct({ name: '', description: '', photo: '', price: '' });
              }}
              disabled={creatingProduct}
              style={{
                background: 'var(--bg-main)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: creatingProduct ? 'not-allowed' : 'pointer',
                opacity: creatingProduct ? 0.5 : 1
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: translateY(-50%) rotate(0deg); }
            to { transform: translateY(-50%) rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default ProductSearch; 