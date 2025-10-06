import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Set to false to disable StrictMode in development (prevents useEffect double-invoke)
const ENABLE_STRICT_MODE = false;

const root = ReactDOM.createRoot(document.getElementById('root'));

// Conditional StrictMode wrapper
const AppWithStrictMode = () => {
  if (ENABLE_STRICT_MODE) {
    return (
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
  return <App />;
};

root.render(<AppWithStrictMode />);

// Performance monitoring removed - using Tailwind CSS for styling
