import React, { Suspense, useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DarkModeProvider, useDarkMode } from './contexts/DarkModeContext';

// Loaded up front: the shell and the landing page (what most visitors and crawlers open first)
import AnimatedBackground from './components/AnimatedBackground';
import Layout from './components/Layout';
import AdminLayout from './components/admin/AdminLayout';
import HomePage from './components/public/HomePage';
import ProtectedRoute, { RoleProtectedRoute, UnauthorizedPage, ROLES } from './components/ProtectedRoute';
import { PUBLIC_ROUTES, USER_ROUTES, ADMIN_ROUTES } from './constants/routes';
import lazyWithRetry from './utils/lazyWithRetry';

// Every other page is its own chunk, so the home page doesn't download the
// resume editor, CKEditor, pdf.js or the admin area.
const Login = lazyWithRetry(() => import('./components/public/login'));
const Register = lazyWithRetry(() => import('./components/public/Register'));
const ResumeList = lazyWithRetry(() => import('./components/resume-list'));
const CreateTemplate = lazyWithRetry(() => import('./components/CreateTemplate'));
const ResumeTemplates = lazyWithRetry(() => import('./components/resume-templates'));
const ResumeForm = lazyWithRetry(() => import('./components/ResumeForm'));
const TemplateSelection = lazyWithRetry(() => import('./components/TemplateSelection'));
const Feedback = lazyWithRetry(() => import('./components/feedback'));
const Payment = lazyWithRetry(() => import('./components/Payment'));
const Profile = lazyWithRetry(() => import('./components/Profile'));
const PrivacyPolicy = lazyWithRetry(() => import('./components/public/PrivacyPolicy'));
const AnalyticsDashboard = lazyWithRetry(() => import('./components/AnalyticsDashboard'));
const AdminDashboard = lazyWithRetry(() => import('./components/admin/AdminDashboard'));
const AdminUsers = lazyWithRetry(() => import('./components/admin/AdminUsers'));
const AdminFeedback = lazyWithRetry(() => import('./components/admin/AdminFeedback'));
const AdminContacts = lazyWithRetry(() => import('./components/admin/AdminContacts'));
const AdminTokens = lazyWithRetry(() => import('./components/admin/AdminTokens'));
const AdminPayments = lazyWithRetry(() => import('./components/admin/AdminPayments'));
const CancellationRefunds = lazyWithRetry(() => import('./components/public/CancellationRefunds'));
const TermsConditions = lazyWithRetry(() => import('./components/public/TermsConditions'));
const Shipping = lazyWithRetry(() => import('./components/public/Shipping'));
const ContactUs = lazyWithRetry(() => import('./components/public/ContactUs'));
const AuthCallback = lazyWithRetry(() => import('./components/AuthCallback'));
const ResumePreviewEnhanced = lazyWithRetry(() => import('./components/ResumePreviewEnhanced'));
const ErrorPage = lazyWithRetry(() => import('./components/annimations/ErrorPage'));
const BYOKGuide = lazyWithRetry(() => import('./components/public/BYOK'));

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center" role="status" aria-live="polite">
    <div className="h-10 w-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
    <span className="sr-only">Loading…</span>
  </div>
);

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

  // Router configuration moved outside component to prevent recreation
  return (
    <div className="App relative">
      <AnimatedBackground />
      <div className="relative z-10">
        <Suspense fallback={<PageFallback />}>
          <RouterProvider router={router} />
        </Suspense>
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
    </div>
  );
}

// Define router outside component
const router = createBrowserRouter([
  {
    path: PUBLIC_ROUTES.HOME,
    element: <Layout><HomePage /></Layout>,
    errorElement: <Layout><ErrorPage /></Layout>,
  },
  {
    path: PUBLIC_ROUTES.LOGIN,
    element: <Layout><ProtectedRoute requireAuth={false}><Login /></ProtectedRoute></Layout>,
  },
  {
    path: PUBLIC_ROUTES.ADMIN_LOGIN,
    element: <Layout><ProtectedRoute requireAuth={false}><Login isAdminLogin={true} /></ProtectedRoute></Layout>,
  },
  {
    path: PUBLIC_ROUTES.REGISTER,
    element: <Layout><ProtectedRoute requireAuth={false}><Register /></ProtectedRoute></Layout>,
  },
  {
    path: PUBLIC_ROUTES.PRIVACY_POLICY,
    element: <Layout><PrivacyPolicy /></Layout>,
  },
  {
    path: PUBLIC_ROUTES.TERMS_CONDITIONS,
    element: <Layout><TermsConditions /></Layout>,
  },
  {
    path: PUBLIC_ROUTES.CANCELLATION_REFUNDS,
    element: <Layout><CancellationRefunds /></Layout>,
  },
  {
    path: PUBLIC_ROUTES.SHIPPING,
    element: <Layout><Shipping /></Layout>,
  },
  {
    path: PUBLIC_ROUTES.CONTACT_US,
    element: <Layout><ContactUs /></Layout>,
  },
  {
    path: PUBLIC_ROUTES.BYOK,
    element: <Layout><BYOKGuide /></Layout>,
  },
  {
    path: PUBLIC_ROUTES.UNAUTHORIZED,
    element: <Layout><UnauthorizedPage /></Layout>,
  },
  {
    path: PUBLIC_ROUTES.AUTH_CALLBACK,
    element: <Layout><AuthCallback /></Layout>,
  },
  {
    path: PUBLIC_ROUTES.ERROR,
    element: <Layout><ErrorPage /></Layout>,
  },
  {
    path: PUBLIC_ROUTES.NETWORK_TIMEOUT,
    element: <Layout><ErrorPage errorCode="Network Timeout" /></Layout>,
  },
  {
    path: USER_ROUTES.DASHBOARD,
    element: <Layout><RoleProtectedRoute requiredRole={ROLES.USER}><ResumeList /></RoleProtectedRoute></Layout>,
  },
  {
    path: USER_ROUTES.RESUMES,
    element: <Layout><RoleProtectedRoute requiredRole={ROLES.USER}><ResumeList /></RoleProtectedRoute></Layout>,
  },
  {
    path: USER_ROUTES.RESUME_FORM,
    element: <Layout><RoleProtectedRoute requiredRole={ROLES.USER}><ResumeForm /></RoleProtectedRoute></Layout>,
  },
  {
    path: `${USER_ROUTES.TEMPLATE_SELECTION}/:resumeId`,
    element: <Layout><RoleProtectedRoute requiredRole={ROLES.USER}><TemplateSelection /></RoleProtectedRoute></Layout>,
  },
  {
    path: `${USER_ROUTES.RESUME_PREVIEW}/:resumeId`,
    element: <Layout><RoleProtectedRoute requiredRole={ROLES.USER}><ResumePreviewEnhanced /></RoleProtectedRoute></Layout>,
  },
  {
    path: USER_ROUTES.RESUME_TEMPLATES,
    element: <Layout><RoleProtectedRoute requiredRole={ROLES.USER}><ResumeTemplates /></RoleProtectedRoute></Layout>,
  },
  {
    path: USER_ROUTES.FEEDBACK,
    element: <Layout><RoleProtectedRoute requiredRole={ROLES.USER}><Feedback /></RoleProtectedRoute></Layout>,
  },
  {
    path: USER_ROUTES.PAYMENT,
    element: <Layout><RoleProtectedRoute requiredRole={ROLES.USER}><Payment /></RoleProtectedRoute></Layout>,
  },
  {
    path: USER_ROUTES.PROFILE,
    element: <Layout><RoleProtectedRoute requiredRole={ROLES.USER}><Profile /></RoleProtectedRoute></Layout>,
  },
  {
    path: USER_ROUTES.ANALYTICS,
    element: <Layout><RoleProtectedRoute requiredRole={ROLES.USER}><AnalyticsDashboard /></RoleProtectedRoute></Layout>,
  },
  {
    path: USER_ROUTES.CREATE_TEMPLATE,
    element: <Layout><RoleProtectedRoute requiredRole={ROLES.USER}><CreateTemplate /></RoleProtectedRoute></Layout>,
  },
  {
    path: ADMIN_ROUTES.DASHBOARD,
    element: <AdminLayout><RoleProtectedRoute requiredRole={ROLES.ADMIN}><AdminDashboard /></RoleProtectedRoute></AdminLayout>,
  },
  {
    path: ADMIN_ROUTES.USERS,
    element: <AdminLayout><RoleProtectedRoute requiredRole={ROLES.ADMIN}><AdminUsers /></RoleProtectedRoute></AdminLayout>,
  },
  {
    path: ADMIN_ROUTES.FEEDBACK,
    element: <AdminLayout><RoleProtectedRoute requiredRole={ROLES.ADMIN}><AdminFeedback /></RoleProtectedRoute></AdminLayout>,
  },
  {
    path: ADMIN_ROUTES.CONTACTS,
    element: <AdminLayout><RoleProtectedRoute requiredRole={ROLES.ADMIN}><AdminContacts /></RoleProtectedRoute></AdminLayout>,
  },
  {
    path: ADMIN_ROUTES.TOKENS,
    element: <AdminLayout><RoleProtectedRoute requiredRole={ROLES.ADMIN}><AdminTokens /></RoleProtectedRoute></AdminLayout>,
  },
  {
    path: ADMIN_ROUTES.PAYMENTS,
    element: <AdminLayout><RoleProtectedRoute requiredRole={ROLES.ADMIN}><AdminPayments /></RoleProtectedRoute></AdminLayout>,
  },
  {
    path: ADMIN_ROUTES.PROFILE,
    element: <AdminLayout><RoleProtectedRoute requiredRole={ROLES.ADMIN}><Profile isAdminLogin={true} /></RoleProtectedRoute></AdminLayout>,
  },
  {
    path: "*",
    element: (
      <Layout notFound>
        <ErrorPage
          title="Page not found"
          subtitle="This page doesn't exist or has moved. Head back to the home page to build your resume."
          showLoginButton={false}
        />
      </Layout>
    ),
  },
]);



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
