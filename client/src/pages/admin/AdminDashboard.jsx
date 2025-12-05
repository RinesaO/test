import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Pharmacies</h3>
            <p className="text-3xl font-bold text-primary-600">{stats?.totalPharmacies || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Pharmacies</h3>
            <p className="text-3xl font-bold text-green-600">{stats?.activePharmacies || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Products</h3>
            <p className="text-3xl font-bold text-blue-600">{stats?.totalProducts || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-purple-600">{stats?.totalUsers || 0}</p>
            <div className="mt-2 text-sm text-gray-500">
              <div>Regular: {stats?.totalRegularUsers || 0}</div>
              <div>Pharmacies: {stats?.totalPharmacyUsers || 0}</div>
              <div>Admins: {stats?.totalAdmins || 0}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/admin/doctor-requests"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-2 border-yellow-200"
          >
            <div className="text-primary-600 text-4xl mb-4">👨‍⚕️</div>
            <h2 className="text-xl font-semibold mb-2">Doctor Requests</h2>
            <p className="text-gray-600">Review pending doctor applications</p>
          </Link>

          <Link
            to="/admin/users"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
          >
            <div className="text-primary-600 text-4xl mb-4">👥</div>
            <h2 className="text-xl font-semibold mb-2">Manage Users</h2>
            <p className="text-gray-600">View and manage all registered users</p>
          </Link>

          <Link
            to="/admin/pharmacies"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
          >
            <div className="text-primary-600 text-4xl mb-4">🏥</div>
            <h2 className="text-xl font-semibold mb-2">Manage Pharmacies</h2>
            <p className="text-gray-600">View and manage all pharmacies</p>
          </Link>

          <Link
            to="/admin/products"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
          >
            <div className="text-primary-600 text-4xl mb-4">💊</div>
            <h2 className="text-xl font-semibold mb-2">Manage Products</h2>
            <p className="text-gray-600">View and manage all products</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

