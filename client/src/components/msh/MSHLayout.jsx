import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const MSHLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useLanguage();

  const menuItems = [
    { path: '/msh-dashboard', key: 'msh.pendingDoctors', icon: '📋' },
    { path: '/msh-doctors', key: 'msh.allDoctors', icon: '👨‍⚕️' },
    { path: '/msh-statistics', key: 'msh.statistics', icon: '📊' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/msh-login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-xl font-bold">{t('msh.ministryOfHealth')}</h1>
          <p className="text-sm text-blue-200 mt-1">{t('msh.adminPanel')}</p>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition ${
                    location.pathname === item.path
                      ? 'bg-blue-800 text-white'
                      : 'text-blue-200 hover:bg-blue-800'
                  }`}
                >
                  <span className="mr-3 text-xl">{item.icon}</span>
                  <span>{t(item.key)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-blue-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 rounded-lg text-blue-200 hover:bg-blue-800 transition"
          >
            <span className="mr-3">🚪</span>
            <span>{t('button.logout')}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

export default MSHLayout;

