import React from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', hoverEffect = true, delay = 0, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`glass-card ${hoverEffect ? 'glass-card-hover' : ''} ${className}`}
      {...props}
      style={{
        padding: '1.5rem',
        ...props.style
      }}
    >
      {children}
    </motion.div>
  );
}
