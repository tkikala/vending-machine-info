import React, { useState, useEffect, useRef } from 'react';
import { searchProducts, createProduct } from '../api';
import type { Product } from '../types';

interface ProductSearchProps {
  onProductSelect: (product: Product, isAvailable: boolean, price?: number) => void;
  disabled?: boolean;
}

function ProductSearch({ onProductSelect, disabled = false }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    photo: ''
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchProductsDebounced = async () => {
      if (searchTerm.trim().length < 2) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      try {
        const results = await searchProducts(searchTerm);
        setSearchResults(results);
        setShowDropdown(true);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchProductsDebounced, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleProductSelect = (product: Product) => {
    const price = product.price ? product.price : undefined;
    onProductSelect(product, true, price);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleCreateNew = async () => {
    if (!newProduct.name.trim()) return;

    setLoading(true);
    try {
      const createdProduct = await createProduct({
        name: newProduct.name.trim(),
        description: newProduct.description.trim() || undefined,
        price: newProduct.price ? parseFloat(newProduct.price) : undefined,
        photo: newProduct.photo || undefined
      });

      const price = createdProduct.price ? createdProduct.price : undefined;
      onProductSelect(createdProduct, true, price);
      
      // Reset form
      setNewProduct({ name: '', description: '', price: '', photo: '' });
      setShowCreateForm(false);
      setSearchTerm('');
      setShowDropdown(false);
    } catch (error) {
      console.error('Create product error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for products..."
          disabled={disabled || loading}
          style={{
            flex: 1,
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem'
          }}
        />
        {loading && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '0 1rem',
            color: '#666'
          }}>
            Searching...
          </div>
        )}
      </div>

      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 1000,
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {searchResults.length > 0 && (
            <div>
              {searchResults.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  style={{
                    padding: '0.75rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f5f5f5'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{product.name}</div>
                    {product.description && (
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>{product.description}</div>
                    )}
                  </div>
                  {product.price && (
                    <div style={{ fontWeight: 'bold', color: '#007bff' }}>€{product.price.toFixed(2)}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!showCreateForm && (
            <div
              onClick={() => setShowCreateForm(true)}
              style={{
                padding: '0.75rem',
                cursor: 'pointer',
                backgroundColor: '#f8f9fa',
                borderTop: '1px solid #eee',
                color: '#007bff',
                fontWeight: 'bold'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e9ecef'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f8f9fa'; }}
            >
              + Add as new product
            </div>
          )}

          {showCreateForm && (
            <div style={{
              padding: '1rem',
              borderTop: '1px solid #eee',
              backgroundColor: '#f8f9fa'
            }}>
              <h4 style={{ margin: '0 0 1rem 0' }}>Create New Product</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Product name *"
                  disabled={loading}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
                
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description (optional)"
                  disabled={loading}
                  rows={2}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    resize: 'vertical'
                  }}
                />
                
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Price (optional)"
                  disabled={loading}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
                
                <input
                  type="url"
                  value={newProduct.photo}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, photo: e.target.value }))}
                  placeholder="Photo URL (optional)"
                  disabled={loading}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={handleCreateNew}
                    disabled={loading || !newProduct.name.trim()}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {loading ? 'Creating...' : 'Create Product'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewProduct({ name: '', description: '', price: '', photo: '' });
                    }}
                    disabled={loading}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductSearch; 