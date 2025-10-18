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
import Subscription from './components/subscription';
import Payment from './components/Payment';
import Profile from './components/Profile';
import PrivacyPolicy from './components/public/PrivacyPolicy';
import AnalyticsDashboard from './components/AnalyticsDashboard';

// Public Pages
import HomePage from './components/public/HomePage';
import CancellationRefunds from './components/public/CancellationRefunds';
import TermsConditions from './components/public/TermsConditions';
import Shipping from './components/public/Shipping';
import ContactUs from './components/public/ContactUs';

import ProtectedRoute, { UnauthorizedPage } from './components/ProtectedRoute';
import AuthCallback from './components/AuthCallback';
import ResumePreviewEnhanced from './components/ResumePreviewEnhanced';
import ErrorPage from './components/annimations/ErrorPage';

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
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route 
                path="/login" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Login />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Register />
                  </ProtectedRoute>
                } 
              />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />
              <Route path="/cancellation-refunds" element={<CancellationRefunds />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/error" element={<ErrorPage />} />
              <Route path="/network-timeout" element={<ErrorPage errorCode="Network Timeout" />} />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <ResumeList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/resumes" 
                element={
                  <ProtectedRoute>
                    <ResumeList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/resume-form" 
                element={
                  <ProtectedRoute>
                    <ResumeForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/template-selection/:resumeId" 
                element={
                  <ProtectedRoute>
                    <TemplateSelection />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/resume-preview/:resumeId" 
                element={
                  <ProtectedRoute>
                    <ResumePreviewEnhanced />
                  </ProtectedRoute>
                } 
              />


              <Route 
                path="/resume-templates" 
                element={
                  <ProtectedRoute>
                    <ResumeTemplates />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/feedback" 
                element={<Feedback />} 
              />
              <Route 
                path="/subscription" 
                element={
                  <ProtectedRoute>
                    <Subscription />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/payment" 
                element={
                  <ProtectedRoute>
                    <Payment />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute>
                    <AnalyticsDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-template" 
                element={
                  <ProtectedRoute>
                    <CreateTemplate />
                  </ProtectedRoute>
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
