'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onDismiss }) => {
  if (!message) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-red-500/20 border border-red-600 text-white p-4 rounded-lg mb-6 flex items-start"
    >
      <XCircle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
      <div className="flex-1">{message}</div>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="text-white/80 hover:text-white transition-colors"
          aria-label="Dismiss error"
        >
          <XCircle size={16} />
        </button>
      )}
    </motion.div>
  );
};

export default ErrorMessage;
