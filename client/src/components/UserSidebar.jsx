import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const UserSidebar = ({ onCategorySelect, currentCategory, isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const { t } = useLanguage();

  const categories = [
    { id: 'antibiotics', key: 'category.antibiotics', color: 'hover:bg-blue-50 hover:text-blue-700' },
    { id: 'vitamins', key: 'category.vitamins', color: 'hover:bg-yellow-50 hover:text-yellow-700' },
    { id: 'syrups', key: 'category.syrups', color: 'hover:bg-purple-50 hover:text-purple-700' },
    { id: 'creams', key: 'category.creams', color: 'hover:bg-pink-50 hover:text-pink-700' },
    { id: 'other', key: 'category.other', color: 'hover:bg-green-50 hover:text-green-700' },
    { id: 'opiates', key: 'category.opiates', color: 'hover:bg-red-50 hover:text-red-700', viewOnly: true }
  ];

  const navigationItems = [
    { to: '/pharmacies', key: 'nav.browsePharmacies', icon: '🏥' },
    { to: '/dashboard/profile', key: 'nav.myProfile', icon: '👤' },
    { to: '/dashboard/prescriptions', key: 'nav.myPrescriptions', icon: '📄' },
    { to: '/dashboard/settings', key: 'nav.settings', icon: '⚙️' }
  ];

  const handleCategoryClick = (category) => {
    if (category.viewOnly && category.id === 'opiates') {
      alert(t('opiates.warning'));
    }
    onCategorySelect(category.id);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onClose}
        ></div>
      )}
      
      {/* Sidebar */}
      <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white shadow-lg h-screen fixed left-0 top-16 overflow-y-auto z-40 transition-all duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-4">
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-50"
          >
            ✕
          </button>

          {/* Collapse/Expand Toggle Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex absolute top-4 right-2 text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors"
            title={isCollapsed ? 'Expand menu' : 'Collapse menu'}
          >
            {isCollapsed ? '→' : '←'}
          </button>

        {/* Navigation Items */}
        <div className="mb-6">
          {!isCollapsed && (
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">{t('common.navigation')}</h3>
          )}
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const itemName = t(item.key);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => onClose && onClose()}
                  className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.to)
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  title={isCollapsed ? itemName : ''}
                >
                  <span className="text-xl">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{itemName}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Medicine Categories */}
        <div>
          {!isCollapsed && (
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">{t('common.categories')}</h3>
          )}
          <div className="space-y-1">
            {categories.map((category) => {
              const categoryName = t(category.key);
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : ''} px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                    currentCategory === category.id
                      ? 'bg-primary-100 text-primary-700 font-semibold border-l-4 border-primary-600'
                      : `text-gray-700 ${category.color}`
                  } ${category.viewOnly ? 'opacity-90' : ''}`}
                  title={isCollapsed ? categoryName + (category.viewOnly ? ' (' + t('opiates.viewOnly') + ')' : '') : (category.viewOnly ? t('opiates.viewOnly') : '')}
                >
                  <span className={`text-sm font-medium ${isCollapsed ? '' : 'flex-1'}`}>
                    {isCollapsed ? categoryName.charAt(0) : categoryName}
                  </span>
                  {!isCollapsed && category.viewOnly && (
                    <span className="text-xs text-red-600 font-semibold ml-2">⚠️</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Clear Filter Button */}
        {currentCategory && !isCollapsed && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => onCategorySelect(null)}
              className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {t('common.clearFilter')}
            </button>
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default UserSidebar;

