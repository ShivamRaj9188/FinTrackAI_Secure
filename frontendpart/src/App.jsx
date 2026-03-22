import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Footer from './components/Footer';

import FeaturesPage from './components/Ftre';
import Help from './components/Help';
import Privacy from './components/Privacy';
import Terms from './components/Terms';
import Contact from './components/Contact';
import About from './components/About';
import Login from './Authentication/Login';
import Signup from './Authentication/Signup';
import Admin from './Authentication/Admin';
import AuthSuccess from './Authentication/AuthSuccess';
import AuthSuccessHandler from './components/AuthSuccessHandler';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import BackToTopButton from './components/BackToTopButton';
import MainPricing from './components/MainPricing';

// Lazy load dashboard routes for performance (code splitting)
const Dashboard = React.lazy(() => import('./Dashboard/Dashboard'));
const AdminDashboard = React.lazy(() => import('./Dashboard/AdminDashboard'));
const Transactions = React.lazy(() => import('./Dashboard/Transactions'));
const Upload = React.lazy(() => import('./Dashboard/Upload'));
const Insights = React.lazy(() => import('./Dashboard/Insights'));
const Reports = React.lazy(() => import('./Dashboard/Reports'));
const UserDashboard = React.lazy(() => import('./UserDashboard/UserDashboard'));

// Modern sleek loader for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-white/5 border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
  </div>
);

// Home page component
const HomePage = () => {
  return (
    <AuthSuccessHandler>
      <div className="font-sans bg-[#0A0A0A] text-white">
        <Header />
        <Hero />
        <Features />
        <Pricing />
        <Footer />
      </div>
    </AuthSuccessHandler>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <React.Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/help" element={<Help />} />
          <Route path="/pricing" element={<MainPricing />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/auth/success" element={<AuthSuccess />} />

          {/* Protected Admin Route */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={
            <AuthSuccessHandler>
              <ProtectedRoute>
                <DashboardLayout><Dashboard /></DashboardLayout>
              </ProtectedRoute>
            </AuthSuccessHandler>
          } />
          <Route path="/transaction" element={
            <ProtectedRoute>
              <DashboardLayout><Transactions /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute>
              <DashboardLayout><Upload /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/insights" element={
            <ProtectedRoute>
              <DashboardLayout><Insights /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <DashboardLayout><Reports /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/userdashboard" element={
            <ProtectedRoute>
              <DashboardLayout><UserDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </React.Suspense>
      <BackToTopButton />
    </Router>
  );
}

export default App;