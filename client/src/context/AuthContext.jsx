import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user, showApprovalMessage } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      return { success: true, user, showApprovalMessage };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (formData) => {
    try {
      const response = await axios.post('/api/auth/register', formData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Defensive multi-tab safety fix: Listen for storage changes from other tabs
  // If session state changes in another tab (login/logout), sync this tab's state
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Only react to changes in the 'token' key
      if (e.key === 'token') {
        if (e.newValue === null && e.oldValue !== null) {
          // Token was removed in another tab (logout) - sync logout in this tab
          logout();
        } else if (e.newValue !== null && e.oldValue === null) {
          // Token was added in another tab (login) - reload to sync new session state
          window.location.reload();
        } else if (e.newValue !== null && e.oldValue !== null && e.newValue !== e.oldValue) {
          // Token was changed in another tab (different user logged in) - reload to sync
          window.location.reload();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isPharmacy: user?.role === 'pharmacy',
    isUser: user?.role === 'user',
    isDoctor: user?.role === 'doctor',
    isMinistry: user?.role === 'ministry_admin',
    isMSH: user?.role === 'msh'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

