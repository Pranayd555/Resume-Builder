import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Components
import AnimatedBackground from './components/AnimatedBackground';
import Layout from './components/Layout';
import Login from './components/login';
import Register from './components/Register';
import ResumeList from './components/resume-list';
import ResumeEditor from './components/resume-editor';
import ResumeTemplates from './components/resume-templates';
import ResumeForm from './components/ResumeForm';
import TemplateSelection from './components/TemplateSelection';
import Feedback from './components/feedback';
import Subscription from './components/subscription';
import Profile from './components/Profile';
import PrivacyPolicy from './components/PrivacyPolicy';
import AnalyticsDashboard from './components/AnalyticsDashboard';

import ProtectedRoute, { UnauthorizedPage } from './components/ProtectedRoute';
import AuthCallback from './components/AuthCallback';
import ResumePreviewEnhanced from './components/ResumePreviewEnhanced';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App relative">
          <AnimatedBackground />
          <div className="relative z-10">
            <Layout>
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
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
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              {/* Protected Routes */}
              <Route 
                path="/resume-list" 
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
                path="/resume-editor" 
                element={
                  <ProtectedRoute>
                    <ResumeEditor />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/resume-editor/:id" 
                element={
                  <ProtectedRoute>
                    <ResumeEditor />
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
                element={
                  <ProtectedRoute>
                    <Feedback />
                  </ProtectedRoute>
                } 
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
              
              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/login" replace />} />
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
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
