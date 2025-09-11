import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaCopy, FaTimes } from 'react-icons/fa';

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  demand: number;
  category: string;
  description?: string;
}

interface ProductManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onProductsChange: (products: Product[]) => void;
  darkMode: boolean;
}

const PRODUCT_CATEGORIES = [
  { id: 'drinks', name: 'Drinks', icon: '🥤' },
  { id: 'snacks', name: 'Snacks', icon: '🍿' },
  { id: 'healthy', name: 'Healthy', icon: '🥗' },
  { id: 'hot', name: 'Hot Items', icon: '🔥' }
];

const DEFAULT_PRODUCTS: Omit<Product, 'id'>[] = [
  // Drinks
  { name: 'Coffee', price: 2.50, cost: 1.20, stock: 50, demand: 80, category: 'drinks', description: 'Fresh brewed coffee' },
  { name: 'Energy Drink', price: 3.00, cost: 1.50, stock: 50, demand: 60, category: 'drinks', description: 'Red Bull, Monster, etc.' },
  { name: 'Water', price: 1.50, cost: 0.60, stock: 50, demand: 70, category: 'drinks', description: 'Still or sparkling water' },
  { name: 'Cola', price: 2.00, cost: 0.80, stock: 50, demand: 75, category: 'drinks', description: 'Coca-Cola, Pepsi' },
  { name: 'Juice', price: 2.20, cost: 1.00, stock: 50, demand: 50, category: 'drinks', description: 'Orange, Apple juice' },
  
  // Snacks
  { name: 'Chips', price: 2.50, cost: 1.20, stock: 50, demand: 85, category: 'snacks', description: 'Potato chips, various flavors' },
  { name: 'Candy', price: 1.80, cost: 0.90, stock: 50, demand: 70, category: 'snacks', description: 'Chocolate bars, gummies' },
  { name: 'Nuts', price: 3.50, cost: 2.00, stock: 50, demand: 40, category: 'snacks', description: 'Mixed nuts, almonds' },
  { name: 'Granola Bar', price: 2.80, cost: 1.40, stock: 50, demand: 55, category: 'snacks', description: 'Healthy granola bars' },
  
  // Healthy
  { name: 'Fresh Fruit', price: 2.00, cost: 1.20, stock: 30, demand: 45, category: 'healthy', description: 'Apples, bananas' },
  { name: 'Yogurt', price: 2.20, cost: 1.10, stock: 40, demand: 50, category: 'healthy', description: 'Greek yogurt, fruit yogurt' },
  { name: 'Protein Bar', price: 3.20, cost: 1.80, stock: 50, demand: 35, category: 'healthy', description: 'High protein bars' },
  { name: 'Trail Mix', price: 3.00, cost: 1.50, stock: 50, demand: 30, category: 'healthy', description: 'Mixed nuts and dried fruit' },
  
  // Hot Items
  { name: 'Sandwich', price: 4.50, cost: 2.50, stock: 20, demand: 60, category: 'hot', description: 'Fresh sandwiches' },
  { name: 'Pizza Slice', price: 3.80, cost: 2.00, stock: 15, demand: 70, category: 'hot', description: 'Hot pizza slices' },
  { name: 'Hot Dog', price: 3.50, cost: 1.80, stock: 25, demand: 55, category: 'hot', description: 'Fresh hot dogs' }
];

export default function ProductManagementModal({ 
  isOpen, 
  onClose, 
  products, 
  onProductsChange, 
  darkMode 
}: ProductManagementModalProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 2.00,
    cost: 1.00,
    stock: 50,
    demand: 50,
    category: 'drinks',
    description: ''
  });

  const handleAddProduct = () => {
    if (!newProduct.name.trim()) return;
    
    const product: Product = {
      ...newProduct,
      id: Date.now().toString()
    };
    
    onProductsChange([...products, product]);
    setNewProduct({
      name: '',
      price: 2.00,
      cost: 1.00,
      stock: 50,
      demand: 50,
      category: 'drinks',
      description: ''
    });
    setShowAddForm(false);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;
    
    const updatedProducts = products.map(p => 
      p.id === editingProduct.id ? editingProduct : p
    );
    onProductsChange(updatedProducts);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId: string) => {
    onProductsChange(products.filter(p => p.id !== productId));
  };

  const handleDuplicateProduct = (product: Product) => {
    const duplicated: Product = {
      ...product,
      id: Date.now().toString(),
      name: `${product.name} (Copy)`
    };
    onProductsChange([...products, duplicated]);
  };

  const addDefaultProducts = () => {
    const defaultProductsWithIds: Product[] = DEFAULT_PRODUCTS.map(p => ({
      ...p,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }));
    onProductsChange([...products, ...defaultProductsWithIds]);
  };

  const getCategoryIcon = (categoryId: string) => {
    return PRODUCT_CATEGORIES.find(c => c.id === categoryId)?.icon || '📦';
  };

  const getCategoryName = (categoryId: string) => {
    return PRODUCT_CATEGORIES.find(c => c.id === categoryId)?.name || 'Other';
  };

  const calculateProfitMargin = (price: number, cost: number) => {
    return ((price - cost) / price * 100).toFixed(1);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h2 className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Manage Products
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaTimes />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setShowAddForm(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  darkMode
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                <FaPlus />
                Add Product
              </button>
              <button
                onClick={addDefaultProducts}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  darkMode
                    ? 'bg-gray-600 hover:bg-gray-700 text-white'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                Add German Products
              </button>
            </div>

            {/* Add Product Form */}
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 rounded-lg border mb-6 ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <h3 className={`text-lg font-semibold mb-4 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Add New Product
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Category
                    </label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {PRODUCT_CATEGORIES.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Price (€)
                    </label>
                    <input
                      type="number"
                      step="0.10"
                      min="0"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Cost (€)
                    </label>
                    <input
                      type="number"
                      step="0.10"
                      min="0"
                      value={newProduct.cost}
                      onChange={(e) => setNewProduct({ ...newProduct, cost: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Stock Capacity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Demand (%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={newProduct.demand}
                      onChange={(e) => setNewProduct({ ...newProduct, demand: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {newProduct.demand}%
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Description (Optional)
                  </label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Product description..."
                    rows={2}
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleAddProduct}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Add Product
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      darkMode
                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                        : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            {/* Products List */}
            <div className="space-y-4">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{getCategoryIcon(product.category)}</div>
                      <div>
                        <h3 className={`text-lg font-semibold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {product.name}
                        </h3>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {getCategoryName(product.category)} • Stock: {product.stock} • Demand: {product.demand}%
                        </p>
                        {product.description && (
                          <p className={`text-sm mt-1 ${
                            darkMode ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        €{product.price.toFixed(2)}
                      </div>
                      <div className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Cost: €{product.cost.toFixed(2)} • Profit: {calculateProfitMargin(product.price, product.cost)}%
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode
                            ? 'hover:bg-gray-600 text-gray-400 hover:text-white'
                            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                        }`}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDuplicateProduct(product)}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode
                            ? 'hover:bg-gray-600 text-gray-400 hover:text-white'
                            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                        }`}
                        title="Duplicate"
                      >
                        <FaCopy />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode
                            ? 'hover:bg-red-600 text-gray-400 hover:text-white'
                            : 'hover:bg-red-100 text-gray-500 hover:text-red-700'
                        }`}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {products.length === 0 && (
                <div className={`text-center py-12 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <div className="text-4xl mb-4">📦</div>
                  <p className="text-lg">No products added yet</p>
                  <p className="text-sm">Add your first product or use the German products template</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
