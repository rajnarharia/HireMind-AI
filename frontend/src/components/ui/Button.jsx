import React from 'react';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

const Button = React.forwardRef(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
    
    const variants = {
      primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-md shadow-blue-500/20',
      secondary: 'bg-[var(--color-secondary)] text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20',
      outline: 'border border-gray-200 bg-transparent hover:bg-gray-100 text-[var(--color-text-primary)]',
      ghost: 'bg-transparent hover:bg-gray-100 text-[var(--color-text-primary)]',
      gradient: 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:opacity-90 shadow-lg shadow-indigo-500/30'
    };

    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-11 px-6 py-2',
      lg: 'h-14 px-8 text-lg rounded-2xl',
      icon: 'h-10 w-10'
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
