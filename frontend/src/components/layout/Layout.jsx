import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

const Layout = () => {
  const location = useLocation();

  // Let ThemeController handle theme logic globally.
  // Removing unconditional dark mode override to allow light theme on Landing pages.

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col transition-colors duration-300">
      <AnimatePresence mode="wait">
        <Outlet key={location.pathname} />
      </AnimatePresence>
    </div>
  );
};

export default Layout;
