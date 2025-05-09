'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, CalendarPlus, ExternalLink } from 'lucide-react';

interface GeneratedContentProps {
  content: string;
  imageUrl?: string;
  seoSuggestions?: string[];
}

const GeneratedContent: React.FC<GeneratedContentProps> = ({
  content,
  imageUrl,
  seoSuggestions
}) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    // In a real app, show a toast notification
  };

  if (!content) {
    return (
      <div className="text-center py-12 text-text-muted bg-background-alt rounded-lg border border-border p-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-secondary opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18l-1.406-1.406A6 6 0 012 12V2h10a6 6 0 01-.672 4.303" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12v-6a2 2 0 00-2-2h-4v12a2 2 0 002 2h8a2 2 0 002-2v-4a2 2 0 00-2-2h-4" />
        </svg>
        <p>Your generated content will appear here</p>
        <p className="text-xs text-text-muted mt-3">
          Using AI-powered technology to generate electronic music content
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {imageUrl && (
        <div className="mb-4">
          <img
            src={imageUrl}
            alt="Generated content"
            className="rounded-lg w-full h-48 object-cover"
          />
        </div>
      )}
      <div className="bg-background-alt p-5 rounded-lg border border-border">
        <pre className="whitespace-pre-wrap text-text-light font-sans text-sm leading-relaxed">
          {content}
        </pre>
      </div>

      <div className="flex flex-wrap gap-3 mt-5">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-primary hover:bg-primary-hover px-4 py-2 rounded-md text-text-light flex items-center gap-2 transition-colors"
          onClick={copyToClipboard}
        >
          <Copy size={16} />
          <span>Copy Text</span>
        </motion.button>

        {imageUrl && (
          <motion.a
            href={imageUrl}
            download="generated-image.jpg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary hover:bg-primary-hover px-4 py-2 rounded-md text-text-light flex items-center gap-2 transition-colors"
          >
            <Download size={16} />
            <span>Download Image</span>
          </motion.a>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-primary hover:bg-primary-hover px-4 py-2 rounded-md text-text-light flex items-center gap-2 transition-colors"
        >
          <CalendarPlus size={16} />
          <span>Add to Calendar</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-background-alt hover:bg-border px-4 py-2 rounded-md text-secondary border border-border hover:border-secondary flex items-center gap-2 transition-colors"
        >
          <ExternalLink size={16} />
          <span>Share</span>
        </motion.button>
      </div>

      {/* SEO Suggestions if available */}
      {seoSuggestions && seoSuggestions.length > 0 && (
        <div className="mt-6 bg-background-alt p-5 rounded-lg border border-border">
          <h3 className="text-lg font-medium text-secondary mb-3">SEO Suggestions</h3>
          <ul className="list-disc list-inside text-text-light space-y-2">
            {seoSuggestions.map((suggestion, index) => (
              <li key={index} className="text-sm">{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default GeneratedContent;
