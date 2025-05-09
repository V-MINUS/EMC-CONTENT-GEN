'use client';

import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ResearchPanelProps {
  onResearchComplete: (results: string) => void;
}

const ResearchPanel: React.FC<ResearchPanelProps> = ({ onResearchComplete }) => {
  const [query, setQuery] = useState('');
  const [researchType, setResearchType] = useState<'artist' | 'trend' | 'venue' | 'general'>('artist');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a research query');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          researchType,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to perform research');
      }
      
      const data = await response.json();
      onResearchComplete(data.researchContent);
      
    } catch (err: any) {
      console.error('Error performing research:', err);
      setError(err.message || 'Research failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background-alt p-5 rounded-lg border border-border">
      <h3 className="text-xl font-bold mb-4 text-text-light">Web Research</h3>
      <p className="text-text-muted mb-4">
        Research electronic music artists, trends, venues, and more to create accurate content.
      </p>
      
      <form onSubmit={handleResearch} className="space-y-4">
        <div>
          <label className="block text-text-light mb-2 text-sm font-medium">
            Research Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              type="button"
              className={`p-3 rounded-md border transition-colors ${
                researchType === 'artist' 
                  ? 'bg-primary/20 border-primary text-secondary' 
                  : 'border-border text-text-muted hover:border-border-hover'
              }`}
              onClick={() => setResearchType('artist')}
            >
              Artist / Producer
            </button>
            <button
              type="button"
              className={`p-3 rounded-md border transition-colors ${
                researchType === 'trend' 
                  ? 'bg-primary/20 border-primary text-secondary' 
                  : 'border-border text-text-muted hover:border-border-hover'
              }`}
              onClick={() => setResearchType('trend')}
            >
              Music Trend
            </button>
            <button
              type="button"
              className={`p-3 rounded-md border transition-colors ${
                researchType === 'venue' 
                  ? 'bg-primary/20 border-primary text-secondary' 
                  : 'border-border text-text-muted hover:border-border-hover'
              }`}
              onClick={() => setResearchType('venue')}
            >
              Venue
            </button>
            <button
              type="button"
              className={`p-3 rounded-md border transition-colors ${
                researchType === 'general' 
                  ? 'bg-primary/20 border-primary text-secondary' 
                  : 'border-border text-text-muted hover:border-border-hover'
              }`}
              onClick={() => setResearchType('general')}
            >
              General
            </button>
          </div>
        </div>
        
        <div>
          <label htmlFor="research-query" className="block text-text-light mb-2 text-sm font-medium">
            Search Query
          </label>
          <div className="relative">
            <input
              id="research-query"
              type="text"
              className="w-full bg-background-dark border border-border rounded-md p-3 pr-10 text-text-light focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-colors"
              placeholder={`Enter ${researchType === 'artist' ? 'artist name' : researchType === 'trend' ? 'trend keyword' : researchType === 'venue' ? 'venue name' : 'research topic'}`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-3 text-text-muted" size={20} />
          </div>
        </div>
        
        {error && (
          <div className="text-error text-sm p-3 bg-error/10 border border-error/20 rounded-md">
            {error}
          </div>
        )}
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-primary hover:bg-primary-hover text-text-light font-semibold py-3 px-4 rounded-md mt-2 transition-colors flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
              Researching...
            </>
          ) : "Start Research"}
        </motion.button>
      </form>
    </div>
  );
};

export default ResearchPanel;
