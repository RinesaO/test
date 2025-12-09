import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../context/LanguageContext';

const Products = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    inStock: true,
    stockQuantity: 0
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, formData);
        setMessage('Product updated successfully!');
      } else {
        await axios.post('/api/products', formData);
        setMessage('Product created successfully!');
      }
      setShowModal(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        inStock: true,
        stockQuantity: 0
      });
      fetchProducts();
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category,
      inStock: product.inStock,
      stockQuantity: product.stockQuantity || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`/api/products/${id}`);
      setMessage('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleImageUpload = async (productId, file) => {
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      await axios.post(`/api/products/${productId}/image`, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Image uploaded successfully!');
      fetchProducts();
    } catch (error) {
      setMessage('Error uploading image: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('pharmacy.products')}</h1>
          <button
            onClick={() => {
              setEditingProduct(null);
              setFormData({
                name: '',
                description: '',
                price: '',
                category: '',
                inStock: true,
                stockQuantity: 0
              });
              setShowModal(true);
            }}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            {t('pharmacy.addProduct')}
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">{t('pharmacy.noProducts')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {product.image && (
                  <img
                    src={`http://localhost:5000${product.image}`}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                  {product.description && (
                    <p className="text-gray-600 mb-2 text-sm">{product.description}</p>
                  )}
                  <p className="text-lg font-bold text-primary-600 mb-2">€{product.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    {t('product.category')}: {product.category} | {product.inStock ? t('product.inStock') : t('product.outOfStock')}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                    >
                      {t('button.edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      {t('button.delete')}
                    </button>
                  </div>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleImageUpload(product._id, e.target.files[0]);
                        }
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-6">
                {editingProduct ? t('pharmacy.editProduct') : t('pharmacy.addProduct')}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('pharmacy.productName')}</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('pharmacy.productDescription')}</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('pharmacy.productImage')}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        const productId = editingProduct?._id;
                        if (productId) {
                          handleImageUpload(productId, e.target.files[0]);
                        } else {
                          setMessage(t('pharmacy.uploadAfterCreate'));
                        }
                      }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('pharmacy.uploadAfterCreate')}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('pharmacy.productPrice')}</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('pharmacy.productCategory')}</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">{t('common.selectCategory')}</option>
                      <option value="Antibiotics">{t('category.antibiotics')}</option>
                      <option value="Vitamins">{t('category.vitamins')}</option>
                      <option value="Syrups">{t('category.syrups')}</option>
                      <option value="Creams">{t('category.creams')}</option>
                      <option value="Other Medicines (A-Z)">{t('category.other')}</option>
                      <option value="Opiates">{t('category.opiates')}</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('pharmacy.stockQuantity')}</label>
                    <input
                      type="number"
                      name="stockQuantity"
                      value={formData.stockQuantity}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="inStock"
                        checked={formData.inStock}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">{t('pharmacy.inStock')}</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                  >
                    {editingProduct ? t('pharmacy.updateProduct') : t('pharmacy.createProduct')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingProduct(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                  >
                    {t('button.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;

