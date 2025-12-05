import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key');

const Subscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await axios.get('/api/subscription/status');
      setSubscription(response.data.subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      const response = await axios.post('/api/subscription/create-checkout-session');
      window.location.href = response.data.url;
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? It will remain active until the end of the current period.')) {
      return;
    }

    try {
      await axios.post('/api/subscription/cancel');
      setMessage('Subscription will be canceled at the end of the current period.');
      fetchSubscription();
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Subscription</h1>

        {message && (
          <div className={`mb-4 p-4 rounded ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Current Status</h2>
            <div className="flex items-center gap-4">
              <span className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(subscription?.status || 'inactive')}`}>
                {subscription?.status?.toUpperCase() || 'INACTIVE'}
              </span>
            </div>
          </div>

          {subscription?.status === 'active' ? (
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 mb-2">Plan: <span className="font-semibold">{subscription.plan || 'Monthly'}</span></p>
                {subscription.currentPeriodEnd && (
                  <p className="text-gray-600 mb-2">
                    Current Period Ends: <span className="font-semibold">
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </span>
                  </p>
                )}
                {subscription.details?.cancelAtPeriodEnd && (
                  <p className="text-yellow-600 mb-4">
                    ⚠️ Your subscription will be canceled at the end of the current period.
                  </p>
                )}
              </div>
              <button
                onClick={handleCancel}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
              >
                Cancel Subscription
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Monthly Subscription Plan</h3>
                <div className="bg-primary-50 p-6 rounded-lg mb-6">
                  <p className="text-3xl font-bold text-primary-600 mb-2">€29.99<span className="text-lg">/month</span></p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Appear in public pharmacy directory</li>
                    <li>Manage your pharmacy profile</li>
                    <li>Add unlimited products</li>
                    <li>View analytics and statistics</li>
                    <li>Customer contact information</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={handleSubscribe}
                className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 text-lg"
              >
                Subscribe Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Subscription;

