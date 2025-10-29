import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DarkModeProvider, useDarkMode } from './contexts/DarkModeContext';

// Components
import AnimatedBackground from './components/AnimatedBackground';
import Layout from './components/Layout';
import Login from './components/login';
import Register from './components/Register';
import ResumeList from './components/resume-list';
import CreateTemplate from './components/CreateTemplate';
import ResumeTemplates from './components/resume-templates';
import ResumeForm from './components/ResumeForm';
import TemplateSelection from './components/TemplateSelection';
import Feedback from './components/feedback';
import Payment from './components/Payment';
import Profile from './components/Profile';
import PrivacyPolicy from './components/public/PrivacyPolicy';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminUsers from './components/admin/AdminUsers';
import AdminFeedback from './components/admin/AdminFeedback';
import AdminContacts from './components/admin/AdminContacts';

// Public Pages
import HomePage from './components/public/HomePage';
import CancellationRefunds from './components/public/CancellationRefunds';
import TermsConditions from './components/public/TermsConditions';
import Shipping from './components/public/Shipping';
import ContactUs from './components/public/ContactUs';

import ProtectedRoute, { RoleProtectedRoute, UnauthorizedPage, ROLES } from './components/ProtectedRoute';
import AuthCallback from './components/AuthCallback';
import ResumePreviewEnhanced from './components/ResumePreviewEnhanced';
import ErrorPage from './components/annimations/ErrorPage';
import { PUBLIC_ROUTES, USER_ROUTES, ADMIN_ROUTES } from './constants/routes';

const AppContent = () => {
  const { isDarkMode } = useDarkMode();
  const { updateUser } = useAuth();

  useEffect(() => {
    const handleUserDataUpdate = (e) => {
      updateUser(e.detail);
    };
    window.addEventListener('userDataUpdated', handleUserDataUpdate);
    return () => {
      window.removeEventListener('userDataUpdated', handleUserDataUpdate);
    };
  }, [updateUser]);
  
  return (
    <Router>
      <div className="App relative">
        <AnimatedBackground />
        <div className="relative z-10">
          <Layout>
              <Routes>
              {/* Public Routes - No authentication required */}
              <Route path={PUBLIC_ROUTES.HOME} element={<HomePage />} />
              <Route 
                path={PUBLIC_ROUTES.LOGIN} 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Login />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path={PUBLIC_ROUTES.ADMIN_LOGIN} 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Login isAdminLogin={true} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path={PUBLIC_ROUTES.REGISTER} 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Register />
                  </ProtectedRoute>
                } 
              />
              <Route path={PUBLIC_ROUTES.PRIVACY_POLICY} element={<PrivacyPolicy />} />
              <Route path={PUBLIC_ROUTES.TERMS_CONDITIONS} element={<TermsConditions />} />
              <Route path={PUBLIC_ROUTES.CANCELLATION_REFUNDS} element={<CancellationRefunds />} />
              <Route path={PUBLIC_ROUTES.SHIPPING} element={<Shipping />} />
              <Route path={PUBLIC_ROUTES.CONTACT_US} element={<ContactUs />} />
              <Route path={PUBLIC_ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
              <Route path={PUBLIC_ROUTES.AUTH_CALLBACK} element={<AuthCallback />} />
              <Route path={PUBLIC_ROUTES.ERROR} element={<ErrorPage />} />
              <Route path={PUBLIC_ROUTES.NETWORK_TIMEOUT} element={<ErrorPage errorCode="Network Timeout" />} />
              
              {/* User Routes - Require authentication */}
              <Route 
                path={USER_ROUTES.DASHBOARD} 
                element={
                  <RoleProtectedRoute requiredRole={ROLES.USER}>
                    <ResumeList />
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path={USER_ROUTES.RESUMES} 
                element={
                  <RoleProtectedRoute requiredRole={ROLES.USER}>
                    <ResumeList />
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path={USER_ROUTES.RESUME_FORM} 
                element={
                  <RoleProtectedRoute requiredRole={ROLES.USER}>
                    <ResumeForm />
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path={`${USER_ROUTES.TEMPLATE_SELECTION}/:resumeId`} 
                element={
                  <RoleProtectedRoute requiredRole={ROLES.USER}>
                    <TemplateSelection />
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path={`${USER_ROUTES.RESUME_PREVIEW}/:resumeId`} 
                element={
                  <RoleProtectedRoute requiredRole={ROLES.USER}>
                    <ResumePreviewEnhanced />
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path={USER_ROUTES.RESUME_TEMPLATES} 
                element={
                  <RoleProtectedRoute requiredRole={ROLES.USER}>
                    <ResumeTemplates />
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path={USER_ROUTES.FEEDBACK} 
                element={
                  <RoleProtectedRoute requiredRole={ROLES.USER}>
                    <Feedback />
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path={USER_ROUTES.PAYMENT} 
                element={
                  <RoleProtectedRoute requiredRole={ROLES.USER}>
                    <Payment />
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path={USER_ROUTES.PROFILE} 
                element={
                  <RoleProtectedRoute requiredRole={ROLES.USER}>
                    <Profile />
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path={USER_ROUTES.ANALYTICS} 
                element={
                  <RoleProtectedRoute requiredRole={ROLES.USER}>
                    <AnalyticsDashboard />
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path={USER_ROUTES.CREATE_TEMPLATE} 
                element={
                  <RoleProtectedRoute requiredRole={ROLES.USER}>
                    <CreateTemplate />
                  </RoleProtectedRoute>
                } 
              />
              {/* Admin Routes - Require admin role */}
              <Route 
                path={ADMIN_ROUTES.DASHBOARD} 
                element={
                  <RoleProtectedRoute requiredRole={ROLES.ADMIN}>
                    <AdminDashboard />
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path={ADMIN_ROUTES.USERS} 
                element={
                  <RoleProtectedRoute requiredRole={ROLES.ADMIN}>
                    <AdminUsers />
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path={ADMIN_ROUTES.FEEDBACK} 
                element={
                  <RoleProtectedRoute requiredRole={ROLES.ADMIN}>
                    <AdminFeedback />
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path={ADMIN_ROUTES.CONTACTS} 
                element={
                  <RoleProtectedRoute requiredRole={ROLES.ADMIN}>
                    <AdminContacts />
                  </RoleProtectedRoute>
                } 
              />
              
              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              </Layout>
            </div>
            
          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={isDarkMode ? "dark" : "light"}
          />
        </div>
      </Router>
    );
  }

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App;
