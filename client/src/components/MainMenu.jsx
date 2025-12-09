import { useState } from 'react';
import { Link } from 'react-router-dom';

const MainMenu = ({ onCategorySelect, currentCategory }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const categories = [
    { id: 'antibiotics', name: 'Antibiotics', icon: '💊', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700' },
    { id: 'vitamins', name: 'Vitamins', icon: '🧪', color: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700' },
    { id: 'syrups', name: 'Syrups', icon: '🥤', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700' },
    { id: 'creams', name: 'Creams', icon: '🧴', color: 'bg-pink-50 hover:bg-pink-100 text-pink-700' },
    { id: 'other', name: 'Other Medicines (A-Z)', icon: '💉', color: 'bg-green-50 hover:bg-green-100 text-green-700' },
    { id: 'opiates', name: 'Opiates', icon: '⚠️', color: 'bg-red-50 hover:bg-red-100 text-red-700', viewOnly: true }
  ];

  const navigationItems = [
    { to: '/pharmacies', name: 'Browse Pharmacies', icon: '🏥' },
    { to: '/dashboard/profile', name: 'My Profile', icon: '👤' },
    { to: '/dashboard/prescriptions', name: 'My Prescriptions', icon: '📄' },
    { to: '/dashboard/settings', name: 'Settings', icon: '⚙️' }
  ];

  const handleCategoryClick = (category) => {
    if (category.viewOnly && category.id === 'opiates') {
      // Show info message for opiates (view-only)
      alert('Opiates are prescription-only medications. You can view where to find them, but they cannot be purchased online. Please consult with a licensed pharmacy for these medications.');
    }
    onCategorySelect(category.id);
  };

  return (
    <div className="mb-6">
      {/* Desktop Menu */}
      <div className="hidden md:block">
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🏥</span>
            Medicine Categories
          </h2>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={`p-4 rounded-lg transition-all duration-200 ${category.color} ${
                  currentCategory === category.id ? 'ring-2 ring-primary-500 ring-offset-2' : ''
                } ${category.viewOnly ? 'opacity-90 cursor-help' : 'cursor-pointer'}`}
                title={category.viewOnly ? 'View-only: Cannot purchase online' : ''}
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <div className="text-sm font-semibold">{category.name}</div>
                {category.viewOnly && (
                  <div className="text-xs mt-1 text-red-600 font-medium">View Only</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Options */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Quick Access
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {navigationItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="p-3 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 transition-all duration-200 hover:shadow-md flex flex-col items-center gap-2"
              >
                <div className="text-2xl">{item.icon}</div>
                <div className="text-sm font-semibold text-center">{item.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-full bg-primary-600 text-white p-4 rounded-lg font-semibold flex items-center justify-between mb-4"
        >
          <span>Menu</span>
          <span>{isMenuOpen ? '▲' : '▼'}</span>
        </button>

        {isMenuOpen && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Medicine Categories</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className={`p-3 rounded-lg transition-all duration-200 ${category.color} ${
                    category.viewOnly ? 'opacity-90' : ''
                  }`}
                >
                  <div className="text-2xl mb-1">{category.icon}</div>
                  <div className="text-xs font-semibold">{category.name}</div>
                  {category.viewOnly && (
                    <div className="text-xs mt-1 text-red-600">View Only</div>
                  )}
                </button>
              ))}
            </div>

            <h2 className="text-lg font-bold text-gray-800 mb-4 mt-4">Quick Access</h2>
            <div className="grid grid-cols-2 gap-3">
              {navigationItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="p-3 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 transition-all duration-200 flex flex-col items-center gap-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="text-xl">{item.icon}</div>
                  <div className="text-xs font-semibold text-center">{item.name}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainMenu;

