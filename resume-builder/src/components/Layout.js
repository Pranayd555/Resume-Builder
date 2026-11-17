import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import RouteSeo from './RouteSeo';

// notFound: set on the catch-all route so unknown URLs get noindex.
const Layout = ({ children, notFound = false }) => {
  const location = useLocation();
  
  // Routes that should not show the header
  const routesWithoutHeader = [
    '/',
    '/login', 
    '/register', 
    '/privacy-policy', 
    '/unauthorized',
    '/terms-conditions',
    '/cancellation-refunds',
    '/shipping',
    '/contact-us',
    '/feedback',
    '/admin-login',
    '/admin/dashboard',
    '/admin/users',
    '/admin/resumes',
    '/admin/templates',
    '/admin/contacts',
    '/admin/feedback',
    '/admin/analytics',
    '/admin/email-test',
    '/admin/settings'
  ];
  
  const shouldShowHeader = !routesWithoutHeader.includes(location.pathname);

  return (
    <>
      <RouteSeo notFound={notFound} />
      {shouldShowHeader && <Header />}
      {children}
    </>
  );
};

export default Layout; 