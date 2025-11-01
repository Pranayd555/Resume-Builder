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
import Login from './components/public/login';
import Register from './components/public/Register';
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
import AdminTokens from './components/admin/AdminTokens';
import AdminRefunds from './components/admin/AdminRefunds';
import AdminLayout from './components/admin/AdminLayout';

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
      // updateUser(e.detail);
      // The event detail already contains the updated user data, so no need to call updateUser again.
      // If there's a need to update local state in App.js based on this event, it should be done here directly.
      // For now, we just prevent the recursive call.
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
          <Routes>
            {/* Public Routes - No authentication required */}
            <Route path={PUBLIC_ROUTES.HOME} element={<Layout><HomePage /></Layout>} />
            <Route
              path={PUBLIC_ROUTES.LOGIN}
              element={
                <Layout>
                  <ProtectedRoute requireAuth={false}>
                    <Login />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path={PUBLIC_ROUTES.ADMIN_LOGIN}
              element={
                <Layout>
                  <ProtectedRoute requireAuth={false}>
                    <Login isAdminLogin={true} />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path={PUBLIC_ROUTES.REGISTER}
              element={
                <Layout>
                  <ProtectedRoute requireAuth={false}>
                    <Register />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route path={PUBLIC_ROUTES.PRIVACY_POLICY} element={<Layout><PrivacyPolicy /></Layout>} />
            <Route path={PUBLIC_ROUTES.TERMS_CONDITIONS} element={<Layout><TermsConditions /></Layout>} />
            <Route path={PUBLIC_ROUTES.CANCELLATION_REFUNDS} element={<Layout><CancellationRefunds /></Layout>} />
            <Route path={PUBLIC_ROUTES.SHIPPING} element={<Layout><Shipping /></Layout>} />
            <Route path={PUBLIC_ROUTES.CONTACT_US} element={<Layout><ContactUs /></Layout>} />
            <Route path={PUBLIC_ROUTES.UNAUTHORIZED} element={<Layout><UnauthorizedPage /></Layout>} />
            <Route path={PUBLIC_ROUTES.AUTH_CALLBACK} element={<Layout><AuthCallback /></Layout>} />
            <Route path={PUBLIC_ROUTES.ERROR} element={<Layout><ErrorPage /></Layout>} />
            <Route path={PUBLIC_ROUTES.NETWORK_TIMEOUT} element={<Layout><ErrorPage errorCode="Network Timeout" /></Layout>} />

            {/* User Routes - Require authentication */}
            <Route
              path={USER_ROUTES.DASHBOARD}
              element={
                <Layout>
                  <RoleProtectedRoute requiredRole={ROLES.USER}>
                    <ResumeList />
                  </RoleProtectedRoute>
                </Layout>
              }
            />
            <Route
              path={USER_ROUTES.RESUMES}
              element={
                <Layout>
                  <RoleProtectedRoute requiredRole={ROLES.USER}>
                    <ResumeList />
                  </RoleProtectedRoute>
                </Layout>
              }
            />
            <Route
              path={USER_ROUTES.RESUME_FORM}
              element={
                <Layout>
                  <RoleProtectedRoute requiredRole={ROLES.USER}>
                    <ResumeForm />
                  </RoleProtectedRoute>
                </Layout>
              }
            />
            <Route
              path={`${USER_ROUTES.TEMPLATE_SELECTION}/:resumeId`}
              element={
                <Layout>
                  <RoleProtectedRoute requiredRole={ROLES.USER}>
                    <TemplateSelection />
                  </RoleProtectedRoute>
                </Layout>
              }
            />
            <Route
              path={`${USER_ROUTES.RESUME_PREVIEW}/:resumeId`}
              element={
                <Layout>
                  <RoleProtectedRoute requiredRole={ROLES.USER}>
                    <ResumePreviewEnhanced />
                  </RoleProtectedRoute>
                </Layout>
              }
            />
            <Route
              path={USER_ROUTES.RESUME_TEMPLATES}
              element={
                <Layout>
                  <RoleProtectedRoute requiredRole={ROLES.USER}>
                    <ResumeTemplates />
                  </RoleProtectedRoute>
                </Layout>
              }
            />
            <Route
              path={USER_ROUTES.FEEDBACK}
              element={
                <Layout>
                  <RoleProtectedRoute requiredRole={ROLES.USER}>
                    <Feedback />
                  </RoleProtectedRoute>
                </Layout>
              }
            />
            <Route
              path={USER_ROUTES.PAYMENT}
              element={
                <Layout>
                  <RoleProtectedRoute requiredRole={ROLES.USER}>
                    <Payment />
                  </RoleProtectedRoute>
                </Layout>
              }
            />
            <Route
              path={USER_ROUTES.PROFILE}
              element={
                <Layout>
                  <RoleProtectedRoute requiredRole={ROLES.USER}>
                    <Profile />
                  </RoleProtectedRoute>
                </Layout>
              }
            />
            <Route
              path={USER_ROUTES.ANALYTICS}
              element={
                <Layout>
                  <RoleProtectedRoute requiredRole={ROLES.USER}>
                    <AnalyticsDashboard />
                  </RoleProtectedRoute>
                </Layout>
              }
            />
            <Route
              path={USER_ROUTES.CREATE_TEMPLATE}
              element={
                <Layout>
                  <RoleProtectedRoute requiredRole={ROLES.USER}>
                    <CreateTemplate />
                  </RoleProtectedRoute>
                </Layout>
              }
            />

            {/* Admin Routes - Use AdminLayout */}
            <Route
              path={ADMIN_ROUTES.DASHBOARD}
              element={
                <AdminLayout>
                  <RoleProtectedRoute requiredRole={ROLES.ADMIN}>
                    <AdminDashboard />
                  </RoleProtectedRoute>
                </AdminLayout>
              }
            />
            <Route
              path={ADMIN_ROUTES.USERS}
              element={
                <AdminLayout>
                  <RoleProtectedRoute requiredRole={ROLES.ADMIN}>
                    <AdminUsers />
                  </RoleProtectedRoute>
                </AdminLayout>
              }
            />
            <Route
              path={ADMIN_ROUTES.FEEDBACK}
              element={
                <AdminLayout>
                  <RoleProtectedRoute requiredRole={ROLES.ADMIN}>
                    <AdminFeedback />
                  </RoleProtectedRoute>
                </AdminLayout>
              }
            />
            <Route
              path={ADMIN_ROUTES.CONTACTS}
              element={
                <AdminLayout>
                  <RoleProtectedRoute requiredRole={ROLES.ADMIN}>
                    <AdminContacts />
                  </RoleProtectedRoute>
                </AdminLayout>
              }
            />
            <Route
              path={ADMIN_ROUTES.TOKENS}
              element={
                <AdminLayout>
                  <RoleProtectedRoute requiredRole={ROLES.ADMIN}>
                    <AdminTokens />
                  </RoleProtectedRoute>
                </AdminLayout>
              }
            />
            <Route
              path={ADMIN_ROUTES.REFUNDS}
              element={
                <AdminLayout>
                  <RoleProtectedRoute requiredRole={ROLES.ADMIN}>
                    <AdminRefunds />
                  </RoleProtectedRoute>
                </AdminLayout>
              }
            />
            <Route
              path={ADMIN_ROUTES.PROFILE}
              element={
                <AdminLayout>
                  <RoleProtectedRoute requiredRole={ROLES.ADMIN}>
                    <Profile isAdminLogin={true} />
                  </RoleProtectedRoute>
                </AdminLayout>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<Layout><Navigate to="/" replace /></Layout>} />
          </Routes>
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
