import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';

const Layout = ({ children }) => {
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
      {shouldShowHeader && <Header />}
      {children}
    </>
  );
};

export default Layout; 