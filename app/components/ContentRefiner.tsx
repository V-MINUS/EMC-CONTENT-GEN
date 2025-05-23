'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Wand2, RefreshCw, Check, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface ContentRefinerProps {
  content: string;
  onRefinementComplete: (refinedContent: string) => void;
}

// Predefined refinement options - moved outside component to avoid recreation on each render
const refinementOptions = [
  { id: 'expand', label: 'Expand and add more detail', instruction: 'expand this content with more detailed information and examples' },
  { id: 'shorten', label: 'Make it more concise', instruction: 'make this content more concise while preserving key information' },
  { id: 'simplify', label: 'Simplify language', instruction: 'simplify the language to be more accessible to a general audience' },
  { id: 'professional', label: 'More professional tone', instruction: 'adjust to a more professional tone suitable for industry experts' },
  { id: 'casual', label: 'More casual tone', instruction: 'adjust to a more casual, conversational tone' },
  { id: 'compelling', label: 'Make it more compelling', instruction: 'enhance the persuasive elements to make it more compelling and action-oriented' },
  { id: 'seo', label: 'Optimize for SEO', instruction: 'optimize this content for search engines while maintaining readability' },
  { id: 'actionable', label: 'Add actionable steps', instruction: 'add clear, actionable steps for the reader to follow' },
  { id: 'facts', label: 'Add facts & statistics', instruction: 'incorporate relevant facts and statistics about electronic music to support the content' },
  { id: 'quotes', label: 'Add expert quotes', instruction: 'add hypothetical quotes from industry experts to enhance credibility' }
];

const ContentRefiner: React.FC<ContentRefinerProps> = ({ content, onRefinementComplete }) => {
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [isOptionsVisible, setIsOptionsVisible] = useState<boolean>(false);
  const [customInstruction, setCustomInstruction] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [preserveSections, setPreserveSections] = useState<string[]>([]);
  const [selectedTone, setSelectedTone] = useState<string>('');

  // Parse content sections that could be preserved - memoized to avoid recalculation on every render
  const contentSections = useMemo(() => {
    // Find headings in markdown
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const matches = [...content.matchAll(headingRegex)];
    
    return matches.map(match => match[2].trim());
  }, [content]);

  // Handle refinement option selection - memoized callback
  const handleRefinementSelect = useCallback(async (instruction: string) => {
    await refineContent(instruction);
  }, []);

  // Handle custom refinement submission - memoized callback
  const handleCustomRefinement = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInstruction.trim()) {
      setError('Please enter a refinement instruction');
      return;
    }
    
    await refineContent(customInstruction);
  }, [customInstruction]);

  // Handle checkbox change for section preservation
  const handleSectionCheckboxChange = useCallback((section: string, checked: boolean) => {
    setPreserveSections(prev => 
      checked 
        ? [...prev, section] 
        : prev.filter(s => s !== section)
    );
  }, []);

  // Submit refinement request to API - memoized to avoid recreation, but dependent on current state
  const refineContent = useCallback(async (instruction: string) => {
    setIsRefining(true);
    setError('');
    
    try {
      const response = await fetch('/api/generate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          instructions: instruction,  // Changed from editInstruction to instructions to match API expectation
          preserveSections: preserveSections.length > 0 ? preserveSections : undefined,
          tone: selectedTone || undefined
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to refine content');
      }
      
      const data = await response.json();
      onRefinementComplete(data.refinedContent);
      
    } catch (err: any) {
      console.error('Error refining content:', err);
      setError(err.message || 'Failed to refine content. Please try again.');
    } finally {
      setIsRefining(false);
    }
  }, [content, preserveSections, selectedTone, onRefinementComplete]);

  // Toast feedback for errors - memoized component
  const ErrorToast = useMemo(() => {
    if (!error) return null;
    
    return (
      <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded-md flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>{error}</span>
      </div>
    );
  }, [error]);

  return (
    <div className="mt-6 border border-border rounded-lg p-4 bg-background-alt">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-text-light flex items-center">
          <Wand2 className="mr-2 h-5 w-5 text-primary" />
          Refine Content
        </h3>
        <button
          type="button"
          onClick={() => setIsOptionsVisible(!isOptionsVisible)}
          className="text-text-muted hover:text-text-light transition-colors"
        >
          {isOptionsVisible ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>

      {ErrorToast}

      {/* Quick refinement options */}
      <div className="flex flex-wrap gap-2 mb-4">
        {refinementOptions.map(option => (
          <button
            key={option.id}
            onClick={() => handleRefinementSelect(option.instruction)}
            disabled={isRefining}
            className="px-3 py-2 bg-background text-text-muted hover:bg-background/70 hover:text-text-light rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {option.label}
          </button>
        ))}
      </div>

      {isOptionsVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4 mt-4 border-t border-border pt-4"
        >
          {/* Custom instruction form */}
          <form onSubmit={handleCustomRefinement} className="space-y-4">
            <div>
              <label htmlFor="customInstruction" className="block text-sm font-medium text-text-light mb-2">
                Custom Refinement Instruction
              </label>
              <textarea
                id="customInstruction"
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder="Enter a specific instruction, e.g., 'add more examples about techno production techniques'"
                className="w-full px-3 py-2 border border-border bg-background rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary text-black dark:text-white resize-none"
                rows={3}
                disabled={isRefining}
              />
            </div>

            {/* Preserve sections selection */}
            <div>
              <label className="block text-sm font-medium text-text-light mb-2">
                Preserve Content Sections (Optional)
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto p-2 border border-border rounded-md bg-background">
                {contentSections.length > 0 ? (
                  contentSections.map((section, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        id={`section-${index}`}
                        type="checkbox"
                        checked={preserveSections.includes(section)}
                        onChange={(e) => handleSectionCheckboxChange(section, e.target.checked)}
                        className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                        disabled={isRefining}
                      />
                      <label htmlFor={`section-${index}`} className="ml-2 block text-sm text-text-light">
                        {section}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-text-muted text-sm">No distinct sections found in content</p>
                )}
              </div>
            </div>

            {/* Tone selection */}
            <div>
              <label htmlFor="refinementTone" className="block text-sm font-medium text-text-light mb-2">
                Desired Tone (Optional)
              </label>
              <select
                id="refinementTone"
                value={selectedTone}
                onChange={(e) => setSelectedTone(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-background rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary text-black dark:text-white"
                disabled={isRefining}
              >
                <option value="">Keep existing tone</option>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="enthusiastic">Enthusiastic</option>
                <option value="technical">Technical</option>
                <option value="humorous">Humorous</option>
                <option value="persuasive">Persuasive</option>
                <option value="inspirational">Inspirational</option>
                <option value="educational">Educational</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-white py-2 px-4 rounded-md shadow flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isRefining || !customInstruction.trim()}
            >
              {isRefining ? (
                <>
                  <RefreshCw className="animate-spin mr-2 h-5 w-5" />
                  Refining...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Apply Custom Refinement
                </>
              )}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default React.memo(ContentRefiner);
