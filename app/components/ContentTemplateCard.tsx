'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ContentTemplate } from '../utils/templates';

interface ContentTemplateCardProps {
  template: ContentTemplate;
  isSelected: boolean;
  onClick: () => void;
}

const ContentTemplateCard: React.FC<ContentTemplateCardProps> = ({
  template,
  isSelected,
  onClick
}) => {
  const handleClick = () => {
    onClick();
  };

  return (
    <div 
      className={`relative overflow-hidden group p-4 rounded-lg border transition-all duration-300 ${isSelected ? 'border-secondary bg-background-alt shadow-lg' : 'border-border bg-background-card hover:border-secondary/50 hover:shadow-lg'}`}
      onClick={handleClick}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <h3 className="text-xl font-bold mb-2 text-text-light relative z-10">{template.name}</h3>
      <p className="text-text-muted text-sm mb-4 relative z-10">{template.description}</p>
      
      <div className="flex items-center justify-between relative z-10">
        <span className="bg-primary/20 border border-primary/30 text-xs px-3 py-1 rounded-full text-secondary font-medium">
          {template.category}
        </span>
        <button className="text-secondary hover:text-text-light transition-colors flex items-center">
          <span>{isSelected ? 'Selected' : 'Select'}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ContentTemplateCard;
