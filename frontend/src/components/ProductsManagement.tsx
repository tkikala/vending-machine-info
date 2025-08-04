import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllProducts, createProduct, updateProduct, deleteProduct } from '../api';
import type { Product } from '../types';
import ProductPhotoUpload from './ProductPhotoUpload';

interface ProductFormData {
  name: string;
  description: string;
  photo: string;
  price: string;
  category: string;
}

function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    photo: '',
    price: '',
    category: ''
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const navigate = useNavigate();

  const categories = [
    'Snacks',
    'Cigarettes', 
    'Cold drinks',
    'Hot drinks',
    'Candy',
    'Chips',
    'Beverages',
    'Other'
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchAllProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }

    try {
      setError(null);
      
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        photo: formData.photo || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        category: formData.category || undefined
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData);
      }

      setFormData({
        name: '',
        description: '',
        photo: '',
        price: '',
        category: ''
      });
      setEditingProduct(null);
      setShowForm(false);
      fetchProducts();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      photo: product.photo || '',
      price: product.price?.toString() || '',
      category: product.category || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (err: any) {
      setError(err.message || 'Failed to delete product');
    }
  };

  const handlePhotoUploaded = (url: string) => {
    setFormData(prev => ({ ...prev, photo: url }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      photo: '',
      price: '',
      category: ''
    });
    setEditingProduct(null);
    setShowForm(false);
    setError(null);
  };

  if (loading) {
    return <div className="header"><h1>Loading products...</h1></div>;
  }

  return (
    <div className="products-management-page">
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={() => navigate('/admin')} className="back-button">
              ← Back to Dashboard
            </button>
            <h1>Products Management</h1>
          </div>
          <div className="header-right">
            <button 
              onClick={() => setShowForm(true)} 
              className="add-button"
              style={{ display: showForm ? 'none' : 'block' }}
            >
              + Add Product
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button type="button" onClick={resetForm} className="cancel-button">
                Cancel
              </button>
            </div>
            
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="name">Product Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Coca Cola"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="">Select category...</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Product description..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Default Price (€)</label>
                <input
                  type="number"
                  id="price"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="1.50"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Product Photo</label>
                <ProductPhotoUpload
                  onPhotoUploaded={handlePhotoUploaded}
                  disabled={uploadingPhoto}
                />
                {formData.photo && (
                  <div className="photo-preview">
                    <img src={formData.photo} alt="Product preview" />
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, photo: '' }))}
                      className="remove-photo"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-button">
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="products-list">
        <h2>All Products ({products.length})</h2>
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                {product.photo ? (
                  <img src={product.photo} alt={product.name} />
                ) : (
                  <div className="product-placeholder">📦</div>
                )}
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                {product.category && (
                  <span className="product-category">{product.category}</span>
                )}
                {product.description && (
                  <p className="product-description">{product.description}</p>
                )}
                {product.price && (
                  <p className="product-price">€{product.price.toFixed(2)}</p>
                )}
                <div className="product-actions">
                  <button 
                    onClick={() => handleEdit(product)}
                    className="edit-button"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductsManagement; 