import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider, AdminContext } from './context/AdminContext';
import { SidebarProvider } from './context/SidebarContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import Features from './pages/Features';
import HelpCenter from './pages/HelpCenter';
import Guidelines from './pages/Guidelines';
import ApiDocs from './pages/ApiDocs';
import Blog from './pages/Blog';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import Careers from './pages/Careers';
import Onboarding from './pages/Onboarding';
import MyEvents from './pages/MyEvents';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import HostEvent from './pages/HostEvent';
import HostedEvents from './pages/HostedEvents';
import EventDetails from './pages/EventDetails';
import EventRegistrations from './pages/EventRegistrations';
import EventQueries from './pages/EventQueries';
import EventCheckin from './pages/EventCheckin';
import Home from './pages/Home';

// Admin imports
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrganizers from './pages/admin/AdminOrganizers';
import AdminPlaceholder from './pages/admin/AdminPlaceholder';
import AdminLogs from './pages/admin/AdminLogs';

function AdminRoute({ children }) {
  const { admin, loading } = React.useContext(AdminContext);
  if (loading) return <div>Loading...</div>;
  return admin ? children : <Navigate to="/admin" />;
}

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <SidebarProvider>
          <Router>
            <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/host" element={<ProtectedRoute><HostEvent /></ProtectedRoute>} />
            <Route path="/checkin/:eventId/:registrationId" element={<ProtectedRoute><EventCheckin /></ProtectedRoute>} />
            <Route path="/hosted-events" element={<ProtectedRoute><HostedEvents /></ProtectedRoute>} />
            <Route path="/hosted-events/:id/registrations" element={<ProtectedRoute><EventRegistrations /></ProtectedRoute>} />
            <Route path="/hosted-events/:id/queries" element={<ProtectedRoute><EventQueries /></ProtectedRoute>} />
            <Route path="/event/:id" element={<EventDetails />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/admin/users" element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            } />
            <Route path="/admin/organizers" element={
              <AdminRoute>
                <AdminOrganizers />
              </AdminRoute>
            } />
            <Route path="/admin/logs" element={
              <AdminRoute>
                <AdminLogs />
              </AdminRoute>
            } />
            <Route path="/admin/events" element={<AdminRoute><AdminPlaceholder title="Events" description="Moderate and manage all events published on the platform." /></AdminRoute>} />
            <Route path="/admin/registrations" element={<AdminRoute><AdminPlaceholder title="Registrations" description="View system-wide event registrations and attendance data." /></AdminRoute>} />
            <Route path="/admin/payments" element={<AdminRoute><AdminPlaceholder title="Payments" description="Manage transactions, payouts, and financial reports." /></AdminRoute>} />
            
            <Route path="/admin/issues" element={<AdminRoute><AdminPlaceholder title="Issues & Support" description="Handle user reports, disputes, and support tickets." /></AdminRoute>} />
            <Route path="/admin/reports" element={<AdminRoute><AdminPlaceholder title="Reports" description="Generate and view detailed system analytics and reports." /></AdminRoute>} />
            <Route path="/admin/health" element={<AdminRoute><AdminPlaceholder title="System Health" description="Monitor server metrics, database performance, and API status." /></AdminRoute>} />
            <Route path="/admin/audit" element={<AdminRoute><AdminPlaceholder title="Audit Logs" description="Review security events, admin actions, and system logs." /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminPlaceholder title="Platform Settings" description="Configure global system variables and platform policies." /></AdminRoute>} />
            
            <Route path="/pricing" element={<Pricing />} />
          <Route path="/features" element={<Features />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/guidelines" element={<Guidelines />} />
          <Route path="/api" element={<ApiDocs />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          </Routes>
        </Router>
        </SidebarProvider>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
