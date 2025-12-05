import { useState, useEffect } from 'react';
import axios from 'axios';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/pharmacy/analytics');
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-primary-600 text-4xl mb-4">👁️</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Views</h3>
            <p className="text-3xl font-bold text-gray-900">{analytics?.views || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-primary-600 text-4xl mb-4">🖱️</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Clicks</h3>
            <p className="text-3xl font-bold text-gray-900">{analytics?.clicks || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-primary-600 text-4xl mb-4">💳</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Subscription Status</h3>
            <p className={`text-lg font-semibold ${
              analytics?.subscriptionStatus === 'active' ? 'text-green-600' : 'text-red-600'
            }`}>
              {analytics?.subscriptionStatus?.toUpperCase() || 'INACTIVE'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-primary-600 text-4xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Status</h3>
            <p className={`text-lg font-semibold ${
              analytics?.isActive ? 'text-green-600' : 'text-red-600'
            }`}>
              {analytics?.isActive ? 'ACTIVE' : 'INACTIVE'}
            </p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Tips to Improve Your Visibility</h2>
          <ul className="space-y-2 text-gray-600">
            <li>• Keep your profile information up to date</li>
            <li>• Add high-quality product images</li>
            <li>• Maintain an active subscription</li>
            <li>• Update your opening hours regularly</li>
            <li>• Add detailed product descriptions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

