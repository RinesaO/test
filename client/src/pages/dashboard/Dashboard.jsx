import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import axios from 'axios';
import UserSidebar from '../../components/UserSidebar';
import AdvertisementBanner from '../../components/AdvertisementBanner';

const PharmacyAdvertisementSection = () => {
  const { t } = useLanguage();
  const [pharmacy, setPharmacy] = useState(null);
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [showAdForm, setShowAdForm] = useState(false);
  const [adFormData, setAdFormData] = useState({
    image: null,
    offerText: '',
    productId: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPharmacyData();
    fetchProducts();
    fetchPromotions();
  }, []);

  const fetchPharmacyData = async () => {
    try {
      const response = await axios.get('/api/pharmacy/profile');
      setPharmacy(response.data.pharmacy);
    } catch (error) {
      console.error('Error fetching pharmacy:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchPromotions = async () => {
    try {
      const response = await axios.get('/api/pharmacy/promotions');
      setPromotions(response.data.promotions || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    }
  };

  const handlePurchaseAdSlot = async () => {
    try {
      await axios.post('/api/pharmacy/purchase-ad');
      setMessage(t('pharmacy.adSlotPurchased'));
      fetchPharmacyData();
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setAdFormData({ ...adFormData, image: e.target.files[0] });
    }
  };

  const handlePublishAd = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!adFormData.productId) {
      setMessage(t('pharmacy.selectProductError'));
      return;
    }

    try {
      const formData = new FormData();
      if (adFormData.image) {
        formData.append('image', adFormData.image);
      }
      formData.append('offerText', adFormData.offerText);
      formData.append('productId', adFormData.productId);

      await axios.post('/api/pharmacy/publish-ad', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage(t('pharmacy.adPublished'));
      setShowAdForm(false);
      setAdFormData({ image: null, offerText: '', productId: '' });
      fetchPharmacyData();
      fetchPromotions(); // Refresh promotions list
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('pharmacy.advertising')}</h2>
      
      {message && (
        <div className={`mb-4 p-4 rounded ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      {!pharmacy?.advertisement?.paid ? (
        <div>
          <p className="text-gray-600 mb-4">{t('pharmacy.purchaseAdSlot')}</p>
          <button
            onClick={handlePurchaseAdSlot}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            {t('pharmacy.purchaseAd')}
          </button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-green-600 font-semibold">✓ Ad slot purchased - Promote your products</p>
            {!showAdForm ? (
              <button
                onClick={() => {
                  setShowAdForm(true);
                  setAdFormData({ image: null, offerText: '', productId: '' });
                }}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm"
              >
                Promote Product
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowAdForm(false);
                  setAdFormData({ image: null, offerText: '', productId: '' });
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 text-sm"
              >
                Cancel
              </button>
            )}
          </div>

          {showAdForm && (
            <form onSubmit={handlePublishAd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('pharmacy.adImage')}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('pharmacy.offerText')}</label>
                <textarea
                  value={adFormData.offerText}
                  onChange={(e) => setAdFormData({ ...adFormData, offerText: e.target.value })}
                  rows="3"
                  placeholder={t('pharmacy.enterOfferText')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('pharmacy.selectProduct')}</label>
                <select
                  value={adFormData.productId}
                  onChange={(e) => setAdFormData({ ...adFormData, productId: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">{t('pharmacy.selectProductPlaceholder')}</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} - €{product.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                >
                  {t('pharmacy.publishAd')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdForm(false);
                    setAdFormData({ image: null, offerText: '', productId: '' });
                  }}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                >
                  {t('button.cancel')}
                </button>
              </div>
            </form>
          )}

          {/* Promotions Stats Table */}
          {promotions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Promoted Products Stats</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">Product Name</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase border-b">Clicks</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase border-b">Purchases</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promotions.map((promo) => (
                      <tr key={promo._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900 border-b">
                          {promo.product?.name || 'Unknown Product'}
                        </td>
                        <td className="px-4 py-2 text-sm text-center text-gray-600 border-b">
                          {promo.clicks || 0}
                        </td>
                        <td className="px-4 py-2 text-sm text-center text-gray-600 border-b">
                          {promo.purchases || 0}
                        </td>
                        <td className="px-4 py-2 text-sm border-b">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            promo.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {promo.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { user, isPharmacy, isUser, isDoctor } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [activeAds, setActiveAds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Check if doctor needs to complete onboarding
    if (isDoctor) {
      checkDoctorStatus();
    }
  }, [isDoctor]);

  useEffect(() => {
    if (isUser) {
      fetchAllProducts();
      fetchActiveAds();
    }
  }, [isUser]);


  const checkDoctorStatus = async () => {
    try {
      const response = await axios.get('/api/doctor/status');
      if (!response.data.hasProfile || response.data.profileStatus === 'pending' || response.data.profileStatus === 'rejected') {
        navigate('/dashboard/doctor-onboarding');
      }
    } catch (error) {
      console.error('Error checking doctor status:', error);
    }
  };

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const pharmaciesResponse = await axios.get('/api/public/pharmacies');
      const pharmacies = pharmaciesResponse.data.pharmacies || [];
      
      const allProducts = [];
      for (const pharmacy of pharmacies) {
        try {
          const productsResponse = await axios.get(`/api/public/pharmacies/${pharmacy._id}/products`);
          const pharmacyProducts = (productsResponse.data.products || []).map(p => ({
            ...p,
            pharmacyName: pharmacy.name,
            pharmacyId: pharmacy._id,
            pharmacyCity: pharmacy.address?.city || 'Unknown'
          }));
          allProducts.push(...pharmacyProducts);
        } catch (error) {
          console.error(`Error fetching products for pharmacy ${pharmacy._id}:`, error);
        }
      }
      
      setProducts(allProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveAds = async () => {
    try {
      const response = await axios.get('/api/public/ads');
      setActiveAds(response.data.ads || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
    }
  };

  const handleProductClick = async (product) => {
    // Navigate to product detail page instead of opening modal
    navigate(`/product/${product._id}`);
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item._id === product._id && item.pharmacyId === product.pharmacyId);
    if (existingItem) {
      setCart(cart.map(item => 
        item._id === product._id && item.pharmacyId === product.pharmacyId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setShowProductModal(false);
  };

  const filteredAndSortedProducts = () => {
    let filtered = products.filter(product => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (
        product.name.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower)) ||
        (product.category && product.category.toLowerCase().includes(searchLower))
      );

      // Category filtering
      if (selectedCategory) {
        const productCategory = (product.category || '').toLowerCase();
        const productName = (product.name || '').toLowerCase();
        
        switch (selectedCategory) {
          case 'antibiotics':
            return matchesSearch && (productCategory === 'antibiotics' || productCategory.includes('antibiotic') || productName.includes('antibiotic'));
          case 'vitamins':
            return matchesSearch && (productCategory === 'vitamins' || productCategory.includes('vitamin') || productName.includes('vitamin'));
          case 'syrups':
            return matchesSearch && (productCategory === 'syrups' || productCategory.includes('syrup') || productName.includes('syrup') || productCategory.includes('liquid'));
          case 'creams':
            return matchesSearch && (productCategory === 'creams' || productCategory.includes('cream') || productCategory.includes('ointment') || productName.includes('cream'));
          case 'opiates':
            return matchesSearch && (productCategory === 'opiates' || productCategory.includes('opiate') || productCategory.includes('opioid') || productName.includes('morphine') || productName.includes('codeine') || productName.includes('oxycodone'));
          case 'other':
            const categoryLower = productCategory.toLowerCase();
            return matchesSearch && (
              productCategory === 'other medicines (a-z)' ||
              (!categoryLower.includes('antibiotic') && !categoryLower.includes('vitamin') && 
               !categoryLower.includes('syrup') && !categoryLower.includes('cream') && 
               !categoryLower.includes('opiate') && !categoryLower.includes('opioid'))
            );
          default:
            return matchesSearch;
        }
      }

      return matchesSearch;
    });

    if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    }

    return filtered;
  };

  const getProductsWithAds = () => {
    const filtered = filteredAndSortedProducts();
    if (activeAds.length === 0) return filtered.map(p => ({ type: 'product', data: p }));
    
    const result = [];
    let adIndex = 0;
    
    for (let i = 0; i < filtered.length; i++) {
      result.push({ type: 'product', data: filtered[i] });
      
      if ((i + 1) % 5 === 0 && activeAds.length > 0) {
        const randomAd = activeAds[Math.floor(Math.random() * activeAds.length)];
        result.push({ type: 'ad', data: randomAd });
      }
    }
    
    return result;
  };

  const handleAdClick = async (ad) => {
    if (ad.product && ad.product._id) {
      // Navigate to product detail page instead of opening modal
      navigate(`/product/${ad.product._id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {!isUser && (
          <div className="px-4 sm:px-6 lg:px-8 pt-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Welcome{user?.name ? `, ${user.name}` : ''}!
            </h1>
          </div>
        )}
        
        {isPharmacy ? (
          // Pharmacy Dashboard
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link
                to="/dashboard/profile"
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
              >
                <div className="text-primary-600 text-4xl mb-4">👤</div>
                <h2 className="text-xl font-semibold mb-2">Profile</h2>
                <p className="text-gray-600">Manage your pharmacy profile and information</p>
              </Link>

              <Link
                to="/dashboard/products"
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
              >
                <div className="text-primary-600 text-4xl mb-4">💊</div>
                <h2 className="text-xl font-semibold mb-2">Products</h2>
                <p className="text-gray-600">Add, edit, and manage your products</p>
              </Link>

              <Link
                to="/dashboard/subscription"
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
              >
                <div className="text-primary-600 text-4xl mb-4">💳</div>
                <h2 className="text-xl font-semibold mb-2">Subscription</h2>
                <p className="text-gray-600">Manage your subscription and payment</p>
              </Link>

              <Link
                to="/dashboard/analytics"
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
              >
                <div className="text-primary-600 text-4xl mb-4">📊</div>
                <h2 className="text-xl font-semibold mb-2">Analytics</h2>
                <p className="text-gray-600">View your pharmacy statistics</p>
              </Link>
            </div>
            <PharmacyAdvertisementSection />
          </>
        ) : isDoctor ? (
          // Doctor Dashboard
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              to="/dashboard/create-prescription"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <div className="text-primary-600 text-4xl mb-4">📋</div>
              <h2 className="text-xl font-semibold mb-2">Create Prescription</h2>
              <p className="text-gray-600">Create and send prescriptions to patients</p>
            </Link>

            <Link
              to="/dashboard/prescriptions"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <div className="text-primary-600 text-4xl mb-4">📄</div>
              <h2 className="text-xl font-semibold mb-2">My Prescriptions</h2>
              <p className="text-gray-600">View all prescriptions you've created</p>
            </Link>

            <Link
              to="/dashboard/profile"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <div className="text-primary-600 text-4xl mb-4">👨‍⚕️</div>
              <h2 className="text-xl font-semibold mb-2">My Profile</h2>
              <p className="text-gray-600">View and manage your doctor profile</p>
            </Link>
          </div>
        ) : isUser ? (
          // Regular User Dashboard with Sidebar
          <div className="flex flex-col md:flex-row">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden fixed top-20 left-4 z-50 bg-primary-600 text-white p-3 rounded-lg shadow-lg hover:bg-primary-700"
            >
              ☰
            </button>

            {/* Vertical Sidebar */}
            <UserSidebar 
              onCategorySelect={setSelectedCategory} 
              currentCategory={selectedCategory}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            
            {/* Main Content Area */}
            <div className={`flex-1 p-4 md:p-8 mt-16 md:mt-0 transition-all duration-300 ${
              sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
            }`}>
              <h1 className="text-3xl font-bold text-gray-900 mb-8">
                {t('common.welcome')}{user?.name ? `, ${user.name}` : ''}!
              </h1>

              {/* Paid Advertisement Banner - Above Search Area */}
              <AdvertisementBanner onAdClick={handleAdClick} />

            {/* Search and Sort */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder={t('common.searchProducts')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
                <option value="">{t('common.sortBy')}</option>
                <option value="price-low">{t('common.priceLowHigh')}</option>
                <option value="price-high">{t('common.priceHighLow')}</option>
              </select>
              <button
                onClick={() => setShowCart(true)}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 relative transition-colors shadow-md hover:shadow-lg"
              >
                🛒 {t('common.cart')} ({cart.reduce((sum, item) => sum + item.quantity, 0)})
              </button>
            </div>

            {/* Products Grid */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('common.products')}</h2>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                </div>
              ) : filteredAndSortedProducts().length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <p className="text-gray-500">{t('common.noProductsFound')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {getProductsWithAds().map((item, index) => {
                    if (item.type === 'ad') {
                      const ad = item.data;
                      return (
                        <div
                          key={`ad-${ad.pharmacyId}-${index}`}
                          onClick={() => handleAdClick(ad)}
                          className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg shadow-md overflow-hidden border-2 border-primary-300 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                        >
                          {ad.image ? (
                            <div className="relative">
                              <img
                                src={`http://localhost:5000${ad.image}`}
                                alt="Advertisement"
                                className="w-full h-48 object-cover"
                              />
                              <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded">
                                AD
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-48 bg-primary-200 flex items-center justify-center relative">
                              <span className="text-primary-600 text-5xl">📢</span>
                              <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded">
                                AD
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      const product = item.data;
                      const isOpiate = selectedCategory === 'opiates' || 
                        (product.category && product.category.toLowerCase().includes('opiate')) ||
                        (product.name && product.name.toLowerCase().includes('morphine')) ||
                        (product.name && product.name.toLowerCase().includes('codeine')) ||
                        (product.name && product.name.toLowerCase().includes('oxycodone'));
                      
                      return (
                        <div
                          key={`${product._id}-${product.pharmacyId}`}
                          onClick={() => {
                            if (isOpiate) {
                              alert(t('opiates.warning'));
                            } else {
                              handleProductClick(product);
                            }
                          }}
                          className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 ${
                            isOpiate ? 'opacity-90 border-2 border-red-200' : ''
                          }`}
                        >
                          {product.image ? (
                            <img
                              src={`http://localhost:5000${product.image}`}
                              alt={product.name}
                              className="w-full h-32 object-cover"
                            />
                          ) : (
                            <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-4xl">💊</span>
                            </div>
                          )}
                          <div className="p-4">
                            <h3 className="text-lg font-semibold mb-1 truncate" title={product.name}>{product.name}</h3>
                            <p className="text-sm text-gray-500 mb-1 truncate">Brand: {product.name}</p>
                            <p className="text-sm text-gray-500 mb-2 truncate">Category: {product.category || 'Uncategorized'}</p>
                            <p className="text-xl font-bold text-primary-600">€{product.price.toFixed(2)}</p>
                            <p className="text-xs text-gray-400 mt-1">{product.pharmacyName}</p>
                            {isOpiate && (
                              <div className="mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                                {t('opiates.prescriptionRequired')}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              )}
            </div>

            {/* Product Details Modal */}
            {showProductModal && selectedProduct && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                      <button
                        onClick={() => setShowProductModal(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                    
                    {selectedProduct.image && (
                      <img
                        src={`http://localhost:5000${selectedProduct.image}`}
                        alt={selectedProduct.name}
                        className="w-full h-64 object-cover rounded-lg mb-4"
                      />
                    )}
                    
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">{t('product.description')}</h3>
                      <p className="text-gray-600">{selectedProduct.description || t('product.noDescription')}</p>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">{t('product.category')}</h3>
                      <p className="text-gray-600">{selectedProduct.category || t('product.uncategorized')}</p>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">{t('product.sideEffects')}</h3>
                      <p className="text-gray-600">{selectedProduct.sideEffects || t('product.noSideEffects')}</p>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">{t('product.usageInstructions')}</h3>
                      <p className="text-gray-600">{selectedProduct.usageInstructions || t('product.consultDoctor')}</p>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">{t('product.availableInPharmacies')}</h3>
                      {selectedProduct.pharmacies && selectedProduct.pharmacies.length > 0 ? (
                        <div className="space-y-2">
                          {selectedProduct.pharmacies.map((pharmacy, idx) => (
                            <div key={idx} className="border border-gray-200 rounded p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium">{pharmacy.pharmacyName}</p>
                                  <p className="text-sm text-gray-500">{pharmacy.city}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-primary-600">€{pharmacy.price.toFixed(2)}</p>
                                  <p className={`text-xs ${pharmacy.inStock ? 'text-green-600' : 'text-red-600'}`}>
                                    {pharmacy.inStock ? t('product.inStock') : t('product.outOfStock')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">{t('product.noPharmacies')}</p>
                      )}
                    </div>
                    
                    {(() => {
                      const isOpiate = selectedProduct.category?.toLowerCase().includes('opiate') ||
                        selectedProduct.category?.toLowerCase().includes('opioid') ||
                        selectedProduct.name?.toLowerCase().includes('morphine') ||
                        selectedProduct.name?.toLowerCase().includes('codeine') ||
                        selectedProduct.name?.toLowerCase().includes('oxycodone');
                      
                      if (isOpiate) {
                        return (
                          <div className="w-full bg-red-100 text-red-700 px-6 py-3 rounded-lg font-semibold text-center border-2 border-red-300">
                            {t('opiates.prescriptionRequired')}
                          </div>
                        );
                      }
                      
                      return (
                        <button
                          onClick={() => {
                            const cheapestPharmacy = selectedProduct.pharmacies
                              ?.filter(p => p.inStock)
                              .sort((a, b) => a.price - b.price)[0];
                            if (cheapestPharmacy) {
                              addToCart({
                                ...selectedProduct,
                                pharmacyId: cheapestPharmacy.pharmacyId,
                                pharmacyName: cheapestPharmacy.pharmacyName,
                                price: cheapestPharmacy.price
                              });
                            } else {
                              alert(t('product.outOfStockAll'));
                            }
                          }}
                          className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                        >
                          {t('product.addToCart')}
                        </button>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Cart Modal */}
            {showCart && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold">Shopping Cart</h2>
                      <button
                        onClick={() => setShowCart(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                    
                    {cart.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                    ) : (
                      <>
                        <div className="space-y-4 mb-6">
                          {cart.map((item, idx) => (
                            <div key={idx} className="border border-gray-200 rounded p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h3 className="font-semibold">{item.name}</h3>
                                  <p className="text-sm text-gray-500">{item.pharmacyName}</p>
                                  <p className="text-primary-600 font-bold">€{item.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      if (item.quantity > 1) {
                                        setCart(cart.map(c => 
                                          c === item ? { ...c, quantity: c.quantity - 1 } : c
                                        ));
                                      } else {
                                        setCart(cart.filter(c => c !== item));
                                      }
                                    }}
                                    className="px-2 py-1 bg-gray-200 rounded"
                                  >
                                    -
                                  </button>
                                  <span>{item.quantity}</span>
                                  <button
                                    onClick={() => {
                                      setCart(cart.map(c => 
                                        c === item ? { ...c, quantity: c.quantity + 1 } : c
                                      ));
                                    }}
                                    className="px-2 py-1 bg-gray-200 rounded"
                                  >
                                    +
                                  </button>
                                  <button
                                    onClick={() => setCart(cart.filter(c => c !== item))}
                                    className="ml-2 text-red-600 hover:text-red-800"
                                  >
                                    {t('cart.remove')}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="border-t pt-4 mb-4">
                          <div className="flex justify-between text-xl font-bold">
                            <span>{t('cart.total')}:</span>
                            <span>€{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => navigate('/dashboard/checkout')}
                          className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700"
                        >
                          {t('cart.proceedToCheckout')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        ) : (
          // Default/Admin view
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              to="/pharmacies"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <div className="text-primary-600 text-4xl mb-4">🏥</div>
              <h2 className="text-xl font-semibold mb-2">Browse Pharmacies</h2>
              <p className="text-gray-600">Find and explore pharmacies</p>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

