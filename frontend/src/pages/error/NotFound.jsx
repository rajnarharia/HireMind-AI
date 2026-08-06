import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center relative overflow-hidden px-4">
      {/* Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10"
      >
        <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-4 tracking-tighter">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Page not found</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-10 text-lg">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        
        <Link to="/" className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-full hover:scale-105 transition-transform shadow-xl">
          <ArrowLeft className="w-4 h-4 mr-2" /> Return Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
