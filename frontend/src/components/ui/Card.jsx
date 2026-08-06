import React from 'react';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

const Card = React.forwardRef(({ className, children, hoverEffect = false, ...props }, ref) => {
  const hoverStyles = hoverEffect ? "transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1" : "";
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "rounded-2xl border border-gray-100 bg-white shadow-sm p-6 dark:bg-[var(--color-card-dark)] dark:border-gray-800",
        hoverStyles,
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = "Card";

export { Card };
