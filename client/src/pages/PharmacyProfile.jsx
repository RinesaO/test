import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PharmacyProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pharmacy, setPharmacy] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchPharmacy();
    fetchProducts();
  }, [id]);

  const fetchPharmacy = async () => {
    try {
      const response = await axios.get(`/api/public/pharmacies/${id}`);
      setPharmacy(response.data.pharmacy);
    } catch (error) {
      console.error('Error fetching pharmacy:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`/api/public/pharmacies/${id}/products`);
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const formatHours = (hours) => {
    if (hours.closed) return 'Closed';
    return `${hours.open || 'N/A'} - ${hours.close || 'N/A'}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Pharmacy not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Pharmacy Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="md:flex">
            {pharmacy.logo && (
              <div className="md:w-1/3">
                <img
                  src={`http://localhost:5000${pharmacy.logo}`}
                  alt={pharmacy.name}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}
            <div className="p-8 md:w-2/3">
              <h1 className="text-3xl font-bold mb-4">{pharmacy.name}</h1>
              {pharmacy.description && (
                <p className="text-gray-600 mb-4">{pharmacy.description}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pharmacy.address?.street && (
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">
                      {pharmacy.address.street}
                      {pharmacy.address.city && `, ${pharmacy.address.city}`}
                    </p>
                  </div>
                )}
                {pharmacy.contact?.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{pharmacy.contact.phone}</p>
                  </div>
                )}
                {pharmacy.contact?.email && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{pharmacy.contact.email}</p>
                  </div>
                )}
                {pharmacy.contact?.website && (
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <a
                      href={pharmacy.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary-600 hover:underline"
                    >
                      {pharmacy.contact.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-6 py-4 font-medium text-sm ${
                  activeTab === 'info'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Information
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-6 py-4 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Products ({products.length})
              </button>
              {pharmacy.services && pharmacy.services.length > 0 && (
                <button
                  onClick={() => setActiveTab('services')}
                  className={`px-6 py-4 font-medium text-sm ${
                    activeTab === 'services'
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Services
                </button>
              )}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'info' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Opening Hours</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Monday</p>
                    <p className="text-gray-600">{formatHours(pharmacy.openingHours.monday)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Tuesday</p>
                    <p className="text-gray-600">{formatHours(pharmacy.openingHours.tuesday)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Wednesday</p>
                    <p className="text-gray-600">{formatHours(pharmacy.openingHours.wednesday)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Thursday</p>
                    <p className="text-gray-600">{formatHours(pharmacy.openingHours.thursday)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Friday</p>
                    <p className="text-gray-600">{formatHours(pharmacy.openingHours.friday)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Saturday</p>
                    <p className="text-gray-600">{formatHours(pharmacy.openingHours.saturday)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Sunday</p>
                    <p className="text-gray-600">{formatHours(pharmacy.openingHours.sunday)}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Products</h2>
                {products.length === 0 ? (
                  <p className="text-gray-500">No products available</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <div
                        key={product._id}
                        onClick={() => navigate(`/product/${product._id}`)}
                        className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-300"
                      >
                        {product.image && (
                          <img
                            src={`http://localhost:5000${product.image}`}
                            alt={product.name}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                        )}
                        <h3 className="font-semibold mb-2">{product.name}</h3>
                        {product.description && (
                          <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                        )}
                        <p className="text-lg font-bold text-primary-600">€{product.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Services</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pharmacy.services.map((service, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-primary-600 mr-2">✓</span>
                      <span>{service}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyProfile;

