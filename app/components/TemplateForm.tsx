'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';
import { Loader2 } from 'lucide-react';
import { ContentTemplate, SocialPlatform } from '../utils/templates';

interface TemplateFormProps {
  template: ContentTemplate | null;
  platforms?: SocialPlatform[];
  onSubmit: (values: Record<string, string>, platform?: SocialPlatform) => void;
  isGenerating: boolean;
}

const TemplateForm: React.FC<TemplateFormProps> = ({
  template,
  platforms,
  onSubmit,
  isGenerating
}) => {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);

  if (!template) {
    return (
      <div className="text-center py-12 text-text-muted bg-background-alt rounded-lg border border-border p-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-secondary opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <p>Select a template to get started</p>
      </div>
    );
  }

  // Extract template fields
  const extractFields = (template: string): string[] => {
    const matches = template.match(/\{([^}]+)\}/g) || [];
    return matches.map(match => match.replace(/[{}]/g, ''));
  };

  const templateFields = extractFields(template.promptTemplate);

  const handleChange = (field: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const shouldRequirePlatform = template.category === 'social';
    if (shouldRequirePlatform && !selectedPlatform) {
      // In a real app, show an error message
      return;
    }
    
    onSubmit(formValues, selectedPlatform || undefined);
  };

  const formatFieldLabel = (field: string): string => {
    // Convert camelCase to readable label
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-secondary mb-2">{template.name}</h3>
        <p className="text-text-muted text-sm">{template.description}</p>
      </div>

      {templateFields.map(field => (
        <div key={field} className="form-group mb-4">
          <label className="block text-text-light mb-2 text-sm font-medium">
            {formatFieldLabel(field)}
          </label>
          {field.toLowerCase().includes('description') || field.toLowerCase().includes('content') || field.toLowerCase().includes('bio') ? (
            <TextareaAutosize
              className="w-full bg-background-alt border border-border rounded-md p-3 text-text-light min-h-[100px] focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-colors"
              value={formValues[field] || ''}
              onChange={(e) => handleChange(field, e.target.value)}
              placeholder={`Enter ${formatFieldLabel(field).toLowerCase()}`}
              minRows={3}
            />
          ) : (
            <input
              type="text"
              className="w-full bg-background-alt border border-border rounded-md p-3 text-text-light focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-colors"
              value={formValues[field] || ''}
              onChange={(e) => handleChange(field, e.target.value)}
              placeholder={`Enter ${formatFieldLabel(field).toLowerCase()}`}
            />
          )}
        </div>
      ))}

      {/* Extra mentions field for all templates */}
      <div className="form-group mb-4 mt-6 border-t border-border pt-4">
        <label className="block text-text-light mb-2 text-sm font-medium">
          Additional Information (Optional)
        </label>
        <TextareaAutosize
          className="w-full bg-background-alt border border-border rounded-md p-3 text-text-light min-h-[80px] focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-colors"
          value={formValues['extraFeatures'] || ''}
          onChange={(e) => handleChange('extraFeatures', e.target.value)}
          placeholder="Add any additional details (sound system, live visuals, dancers, fire show, etc.)"
          minRows={2}
        />
      </div>

      {template.category === 'social' && platforms && (
        <div className="form-group mt-6">
          <label className="block text-text-light mb-2 text-sm font-medium">Platform</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {platforms.map(platform => (
              <div
                key={platform.id}
                className={`cursor-pointer p-3 rounded-md flex items-center gap-2 transition-all ${
                  selectedPlatform?.id === platform.id
                    ? 'bg-primary/20 border border-primary'
                    : 'bg-background-alt border border-border hover:border-primary/30'
                }`}
                onClick={() => setSelectedPlatform(platform)}
              >
                <i className={`${platform.icon} text-secondary`}></i>
                <span className="text-text-light">{platform.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-primary hover:bg-primary-hover text-text-light font-semibold py-3 px-4 rounded-md mt-6 transition-colors flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
        type="submit"
        disabled={isGenerating || (template.category === 'social' && !selectedPlatform)}
      >
        {isGenerating ? (
          <>
            <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
            Generating...
          </>
        ) : "Generate Content"}
      </motion.button>
    </form>
  );
};

export default TemplateForm;
