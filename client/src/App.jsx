import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public pages
import Home from './pages/Home';
import PharmacyDirectory from './pages/PharmacyDirectory';
import PharmacyProfile from './pages/PharmacyProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorSignUp from './pages/DoctorSignUp';
import MinistryLogin from './pages/MinistryLogin';
import DoctorApprovalPanel from './pages/ministry/DoctorApprovalPanel';
import MSHLogin from './pages/MSHLogin';
import MSHDashboard from './pages/msh/MSHDashboard';
import MSHAllDoctors from './pages/msh/MSHAllDoctors';
import MSHStatistics from './pages/msh/MSHStatistics';
import MSHDoctorProfile from './pages/msh/MSHDoctorProfile';

// Dashboard pages
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/dashboard/Profile';
import Products from './pages/dashboard/Products';
import Subscription from './pages/dashboard/Subscription';
import Analytics from './pages/dashboard/Analytics';
import DoctorOnboarding from './pages/dashboard/DoctorOnboarding';
import CreatePrescription from './pages/dashboard/CreatePrescription';
import Prescriptions from './pages/dashboard/Prescriptions';
import Checkout from './pages/dashboard/Checkout';
import Settings from './pages/dashboard/Settings';
import ProductDetail from './pages/ProductDetail';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPharmacies from './pages/admin/AdminPharmacies';
import AdminProducts from './pages/admin/AdminProducts';
import AdminDoctorRequests from './pages/admin/AdminDoctorRequests';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/pharmacies" element={<PharmacyDirectory />} />
              <Route path="/pharmacy/:id" element={<PharmacyProfile />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/doctor-signup" element={<DoctorSignUp />} />
              <Route path="/ministry/login" element={<MinistryLogin />} />
              <Route path="/msh-login" element={<MSHLogin />} />

              {/* Protected routes - Pharmacy */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/products"
                element={
                  <PrivateRoute pharmacyOnly>
                    <Products />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/subscription"
                element={
                  <PrivateRoute pharmacyOnly>
                    <Subscription />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/analytics"
                element={
                  <PrivateRoute pharmacyOnly>
                    <Analytics />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/doctor-onboarding"
                element={
                  <PrivateRoute>
                    <DoctorOnboarding />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/create-prescription"
                element={
                  <PrivateRoute>
                    <CreatePrescription />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/prescriptions"
                element={
                  <PrivateRoute>
                    <Prescriptions />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/checkout"
                element={
                  <PrivateRoute>
                    <Checkout />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/settings"
                element={
                  <PrivateRoute>
                    <Settings />
                  </PrivateRoute>
                }
              />

              {/* Protected routes - Admin */}
              <Route
                path="/admin"
                element={
                  <PrivateRoute adminOnly>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <PrivateRoute adminOnly>
                    <AdminUsers />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/pharmacies"
                element={
                  <PrivateRoute adminOnly>
                    <AdminPharmacies />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <PrivateRoute adminOnly>
                    <AdminProducts />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/doctor-requests"
                element={
                  <PrivateRoute adminOnly>
                    <AdminDoctorRequests />
                  </PrivateRoute>
                }
              />

              {/* Protected routes - Ministry */}
              <Route
                path="/ministry/approvals"
                element={
                  <PrivateRoute ministryOnly>
                    <DoctorApprovalPanel />
                  </PrivateRoute>
                }
              />

              {/* Protected routes - MSH */}
              <Route
                path="/msh-dashboard"
                element={
                  <PrivateRoute mshOnly>
                    <MSHDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/msh-doctors"
                element={
                  <PrivateRoute mshOnly>
                    <MSHAllDoctors />
                  </PrivateRoute>
                }
              />
              <Route
                path="/msh-statistics"
                element={
                  <PrivateRoute mshOnly>
                    <MSHStatistics />
                  </PrivateRoute>
                }
              />
              <Route
                path="/msh/doctor/:id"
                element={
                  <PrivateRoute mshOnly>
                    <MSHDoctorProfile />
                  </PrivateRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
    </LanguageProvider>
  );
}

export default App;

