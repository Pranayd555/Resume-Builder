import React from 'react';
import { matchPath, useLocation } from 'react-router-dom';
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
    '/admin/settings',
    '/portfolio/:user'
  ];
  
  let shouldShowHeader = !routesWithoutHeader.some(pattern => 
    matchPath({ path: pattern }, location.pathname)
  );
  if(location.pathname.includes('portfolio')) {
    // 2. Define the paths you want to keep the header for
  const excludedSubPaths = ['edit', 'view'];
  const match = matchPath({ path: '/portfolio/:user' }, location.pathname);

  // 3. Logic: Match exists AND it's not an excluded path
  shouldShowHeader = !(match && !excludedSubPaths.includes(match.params.user));
  }

  return (
    <>
      {shouldShowHeader && <Header />}
      {children}
    </>
  );
};

export default Layout; 