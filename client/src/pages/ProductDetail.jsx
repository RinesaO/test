import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [product, setProduct] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeAds, setActiveAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [showSideEffectsModal, setShowSideEffectsModal] = useState(false);

  useEffect(() => {
    fetchProductDetails();
    fetchSimilarProducts();
    fetchActiveAds();
  }, [id]);

  useEffect(() => {
    if (activeAds.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % activeAds.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeAds.length]);

  const fetchProductDetails = async () => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      const fullProduct = response.data.product;
      
      const pharmaciesResponse = await axios.get('/api/public/pharmacies');
      const allPharmacies = pharmaciesResponse.data.pharmacies || [];
      
      const productPharmacies = [];
      for (const pharmacy of allPharmacies) {
        try {
          const productsResponse = await axios.get(`/api/public/pharmacies/${pharmacy._id}/products`);
          const pharmacyProducts = productsResponse.data.products || [];
          const matchingProduct = pharmacyProducts.find(p => 
            p.name.toLowerCase() === fullProduct.name.toLowerCase()
          );
          if (matchingProduct) {
            productPharmacies.push({
              pharmacyId: pharmacy._id,
              pharmacyName: pharmacy.name,
              city: pharmacy.address?.city || 'Unknown',
              price: matchingProduct.price,
              inStock: matchingProduct.inStock,
              stockQuantity: matchingProduct.stockQuantity || 0
            });
          }
        } catch (error) {
          console.error(`Error checking pharmacy ${pharmacy._id}:`, error);
        }
      }
      
      setProduct({
        ...fullProduct,
        pharmacies: productPharmacies
      });
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarProducts = async () => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      const currentProduct = response.data.product;
      
      // Fetch all products from all pharmacies
      const pharmaciesResponse = await axios.get('/api/public/pharmacies');
      const pharmacies = pharmaciesResponse.data.pharmacies || [];
      
      const allProducts = [];
      for (const pharmacy of pharmacies) {
        try {
          const productsResponse = await axios.get(`/api/public/pharmacies/${pharmacy._id}/products`);
          const pharmacyProducts = productsResponse.data.products || [];
          allProducts.push(...pharmacyProducts);
        } catch (error) {
          console.error(`Error fetching products from pharmacy ${pharmacy._id}:`, error);
        }
      }
      
      // Filter similar products (same category, exclude current product)
      const similar = allProducts
        .filter((p, index, self) => {
          // Remove duplicates by product name
          const firstIndex = self.findIndex(prod => prod.name.toLowerCase() === p.name.toLowerCase());
          return index === firstIndex;
        })
        .filter(p => {
          const productId = p._id?.toString() || p._id;
          const currentId = id?.toString() || id;
          return productId !== currentId && 
                 p.category === currentProduct.category &&
                 p.inStock;
        })
        .slice(0, 6); // Limit to 6 products
      
      setSimilarProducts(similar);
    } catch (error) {
      console.error('Error fetching similar products:', error);
    }
  };

  const fetchActiveAds = async () => {
    try {
      const response = await axios.get('/api/public/ads');
      const ads = response.data.ads || [];
      setActiveAds(ads);
    } catch (error) {
      console.error('Error fetching ads:', error);
    }
  };

  const handleAdClick = async (ad) => {
    if (ad.product && ad.product._id) {
      navigate(`/product/${ad.product._id}`);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">{t('common.noProductsFound')}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            {t('button.close')}
          </button>
        </div>
      </div>
    );
  }

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const currentAd = activeAds[currentAdIndex];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 md:mb-6 flex items-center text-sm text-gray-500 hover:text-primary-600 transition-colors"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('button.close')}
        </button>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-8 md:mb-12">
          {/* Left: Product Image */}
          <div className="lg:col-span-5">
            <div className="w-full flex items-center justify-center">
              {product.image ? (
                <img
                  src={`${apiUrl}${product.image}`}
                  alt={product.name}
                  className="w-full h-auto max-w-md max-h-[320px] md:max-h-[360px] object-contain"
                />
              ) : (
                <div className="w-full max-w-md h-48 md:h-56 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-gray-400 text-4xl md:text-5xl">💊</div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Info + Ads */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Product Info */}
              <div className="lg:col-span-2 space-y-5 md:space-y-6">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-tight">{product.name}</h1>
                  
                  <div className="mb-3">
                    <span className="inline-block bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded">
                      {product.category || t('product.uncategorized')}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-2xl md:text-3xl font-bold text-primary-600 mb-1.5">
                      €{product.price?.toFixed(2) || '0.00'}
                    </p>
                    <p className={`text-xs md:text-sm font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                      {product.inStock ? t('product.inStock') : t('product.outOfStock')}
                    </p>
                  </div>
                </div>

                {product.description && (
                  <div>
                    <h2 className="text-sm md:text-base font-semibold text-gray-900 mb-2">
                      {t('product.description')}
                    </h2>
                    <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                      {product.description}
                    </p>
                  </div>
                )}

                {product.sideEffects && product.sideEffects.trim() !== '' && (
                  <div className="mt-4">
                    <button
                      id="view-side-effects"
                      onClick={() => setShowSideEffectsModal(true)}
                      style={{ fontWeight: 'bold', color: 'red' }}
                      className="text-sm underline cursor-pointer hover:opacity-80"
                    >
                      {language === 'al' ? 'Shiko efektet anësore' : 'View Side Effects'}
                    </button>
                  </div>
                )}

                {product.usageInstructions && (
                  <div>
                    <h2 className="text-sm md:text-base font-semibold text-gray-900 mb-2">
                      {t('product.usageInstructions')}
                    </h2>
                    <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                      {product.usageInstructions}
                    </p>
                  </div>
                )}

                {/* Additional Product Data */}
                {(product.stockQuantity !== undefined || product.manufacturer || product.expirationDate) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {product.stockQuantity !== undefined && (
                      <div>
                        <span className="text-xs text-gray-500">{t('pharmacy.stockQuantity')}:</span>
                        <span className="ml-2 font-medium text-gray-900 text-sm">{product.stockQuantity}</span>
                      </div>
                    )}
                    {product.manufacturer && (
                      <div>
                        <span className="text-xs text-gray-500">{t('product.manufacturer')}:</span>
                        <span className="ml-2 font-medium text-gray-900 text-sm">{product.manufacturer}</span>
                      </div>
                    )}
                    {product.expirationDate && (
                      <div>
                        <span className="text-xs text-gray-500">{t('product.expirationDate')}:</span>
                        <span className="ml-2 font-medium text-gray-900 text-sm">{product.expirationDate}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Available in Pharmacies */}
                {product.pharmacies && product.pharmacies.length > 0 && (
                  <div>
                    <h2 className="text-sm md:text-base font-semibold text-gray-900 mb-3">
                      {t('product.availableInPharmacies')}
                    </h2>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
                      {product.pharmacies.map((pharmacy, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-gray-900 text-xs md:text-sm">{pharmacy.pharmacyName}</p>
                            <p className="text-xs text-gray-500">{pharmacy.city}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary-600 text-sm md:text-base">€{pharmacy.price.toFixed(2)}</p>
                            <p className={`text-xs ${pharmacy.inStock ? 'text-green-600' : 'text-red-600'}`}>
                              {pharmacy.inStock ? t('product.inStock') : t('product.outOfStock')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    // Add to cart logic can be added here
                    alert(t('product.addToCart'));
                  }}
                  disabled={!product.inStock}
                  className={`w-full py-2.5 md:py-3 px-6 font-semibold text-sm md:text-base transition-colors rounded-lg ${
                    product.inStock
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {product.inStock ? t('product.addToCart') : t('product.outOfStockAll')}
                </button>
              </div>

              {/* Right Side: Advertisements */}
              <div className="lg:col-span-1">
                {activeAds.length > 0 && (
                  <div className="sticky top-4">
                    <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                      {t('common.advertisement')}
                    </h3>
                    {currentAd && (
                      <div
                        onClick={() => handleAdClick(currentAd)}
                        className="cursor-pointer group"
                      >
                        {currentAd.image ? (
                          <img
                            src={`${apiUrl}${currentAd.image}`}
                            alt="Advertisement"
                            className="w-full h-auto max-h-64 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-40 bg-primary-50 rounded-lg flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                            <div className="text-center px-2">
                              <div className="text-3xl mb-1">📢</div>
                              <div className="text-primary-700 font-medium text-xs">
                                {currentAd.offerText || t('common.specialOffer')}
                              </div>
                            </div>
                          </div>
                        )}
                        {currentAd.pharmacyName && (
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            {currentAd.pharmacyName}
                          </p>
                        )}
                      </div>
                    )}
                    {activeAds.length > 1 && (
                      <div className="flex justify-center gap-1 mt-3">
                        {activeAds.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentAdIndex(index)}
                            className={`h-1.5 rounded-full transition-all ${
                              index === currentAdIndex
                                ? 'bg-primary-600 w-5'
                                : 'bg-gray-300 hover:bg-gray-400 w-1.5'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Frequently Bought Together Section */}
          {similarProducts.length > 0 && (
            <div className="mt-8 md:mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">
                {t('product.frequentlyBoughtTogether')}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {similarProducts.map((similarProduct) => (
                  <div
                    key={similarProduct._id || Math.random()}
                    onClick={() => handleProductClick(similarProduct._id)}
                    className="cursor-pointer transition-all duration-300 hover:opacity-80 group relative"
                  >
                    {similarProduct.image ? (
                      <img
                        src={`${apiUrl}${similarProduct.image}`}
                        alt={similarProduct.name}
                        className="w-full h-24 md:h-28 object-contain mb-2 group-hover:scale-105 transition-transform bg-gray-50 rounded"
                      />
                    ) : (
                      <div className="w-full h-24 md:h-28 flex items-center justify-center bg-gray-50 rounded mb-2">
                        <div className="text-gray-400 text-2xl">💊</div>
                      </div>
                    )}
                    {similarProduct.inStock === false && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">
                        {t('product.outOfStock')}
                      </div>
                    )}
                    <h3 className="font-medium text-xs md:text-sm text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {similarProduct.name}
                    </h3>
                    <p className="text-primary-600 font-bold text-xs md:text-sm">
                      €{similarProduct.price?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Side Effects Modal */}
      {showSideEffectsModal && product && product.sideEffects && product.sideEffects.trim() !== '' && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowSideEffectsModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('product.sideEffects')}
              </h2>
              <button
                onClick={() => setShowSideEffectsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {product.sideEffects}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSideEffectsModal(false)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {t('button.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;

