import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider, AdminContext } from './context/AdminContext';
import { SidebarProvider } from './context/SidebarContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { initErrorTracker } from './utils/errorTracker';

initErrorTracker();

const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Pricing = React.lazy(() => import('./pages/Pricing'));
const Features = React.lazy(() => import('./pages/Features'));
const HelpCenter = React.lazy(() => import('./pages/HelpCenter'));
const Guidelines = React.lazy(() => import('./pages/Guidelines'));
const ApiDocs = React.lazy(() => import('./pages/ApiDocs'));
const Blog = React.lazy(() => import('./pages/Blog'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService'));
const CookiePolicy = React.lazy(() => import('./pages/CookiePolicy'));
const AboutUs = React.lazy(() => import('./pages/AboutUs'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Careers = React.lazy(() => import('./pages/Careers'));
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const MyEvents = React.lazy(() => import('./pages/MyEvents'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Settings = React.lazy(() => import('./pages/Settings'));
const HostEvent = React.lazy(() => import('./pages/HostEvent'));
const HostedEvents = React.lazy(() => import('./pages/HostedEvents'));
const EventDetails = React.lazy(() => import('./pages/EventDetails'));
const EventRegistrations = React.lazy(() => import('./pages/EventRegistrations'));
const EventQueries = React.lazy(() => import('./pages/EventQueries'));
const EventCheckin = React.lazy(() => import('./pages/EventCheckin'));
const Badges = React.lazy(() => import('./pages/Badges'));
const MyHackathons = React.lazy(() => import('./pages/MyHackathons'));
const Home = React.lazy(() => import('./pages/Home'));

// Admin imports
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = React.lazy(() => import('./pages/admin/AdminUsers'));
const AdminOrganizers = React.lazy(() => import('./pages/admin/AdminOrganizers'));
const AdminPlaceholder = React.lazy(() => import('./pages/admin/AdminPlaceholder'));
const AdminLogs = React.lazy(() => import('./pages/admin/AdminLogs'));

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
          <React.Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/badges" element={<ProtectedRoute><Badges /></ProtectedRoute>} />
            <Route path="/my-hackathons" element={<ProtectedRoute><MyHackathons /></ProtectedRoute>} />
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
          </React.Suspense>
        </Router>
        </SidebarProvider>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
