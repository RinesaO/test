import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PharmacyDirectory = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [cities, setCities] = useState([]);
  const [sort, setSort] = useState('');

  useEffect(() => {
    fetchCities();
    fetchPharmacies();
  }, [search, city, sort]);

  const fetchCities = async () => {
    try {
      const response = await axios.get('/api/public/cities');
      setCities(response.data.cities);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchPharmacies = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (city) params.city = city;
      if (sort) params.sort = sort;

      const response = await axios.get('/api/public/pharmacies', { params });
      setPharmacies(response.data.pharmacies);
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Pharmacy Directory</h1>

        {/* Search and Filter Bar */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search pharmacies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Sort By</option>
                <option value="name">Name (A-Z)</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pharmacies Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : pharmacies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No pharmacies found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pharmacies.map((pharmacy) => (
              <div key={pharmacy._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                {pharmacy.logo && (
                  <img
                    src={`http://localhost:5000${pharmacy.logo}`}
                    alt={pharmacy.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{pharmacy.name}</h3>
                  {pharmacy.address?.city && (
                    <p className="text-gray-600 mb-2">📍 {pharmacy.address.city}</p>
                  )}
                  {pharmacy.contact?.phone && (
                    <p className="text-gray-600 mb-4">📞 {pharmacy.contact.phone}</p>
                  )}
                  <Link
                    to={`/pharmacy/${pharmacy._id}`}
                    className="inline-block bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacyDirectory;

