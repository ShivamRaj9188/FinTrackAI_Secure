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
import Dashboard from './Dashboard/Dashboard';
import AdminDashboard from './Dashboard/AdminDashboard';
import Transactions from './Dashboard/Transactions';
import Upload from './Dashboard/Upload';
import Insights from './Dashboard/Insights';
import Reports from './Dashboard/Reports';
import UserDashboard from './UserDashboard/UserDashboard';
import ScrollToTop from './components/ScrollToTop';
import BackToTopButton from './components/BackToTopButton';
import MainPricing from './components/MainPricing';

// Home page component
const HomePage = () => {
  // Debug: Log current URL
  console.log('=== HOMEPAGE DEBUG ===');
  console.log('Current URL:', window.location.href);
  console.log('Search params:', window.location.search);
  console.log('Has token param:', new URLSearchParams(window.location.search).get('token') ? 'YES' : 'NO');
  console.log('Has user param:', new URLSearchParams(window.location.search).get('user') ? 'YES' : 'NO');
  console.log('=== END DEBUG ===');
  
  return (
    <AuthSuccessHandler>
      <div className="font-sans bg-white text-slate-900">
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
      <Routes>
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
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/dashboard" element={
          <AuthSuccessHandler>
            <Dashboard />
          </AuthSuccessHandler>
        } />
        <Route path="/transaction" element={<Transactions />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/userdashboard" element={<UserDashboard />} />
      </Routes>
      <BackToTopButton />
    </Router>
  );
}

export default App;