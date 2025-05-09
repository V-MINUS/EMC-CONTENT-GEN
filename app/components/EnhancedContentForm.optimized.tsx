'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, RefreshCw, Settings, Zap, Shield, Pencil } from 'lucide-react';
import { ContentTemplate, SocialPlatform } from '../utils/templates';
import { ContentTone, contentTones } from '../lib/ai-services';

interface EnhancedContentFormProps {
  template: ContentTemplate | null;
  platforms?: SocialPlatform[];
  onSubmit: (values: Record<string, string>, platform?: SocialPlatform) => Promise<void>;
  isGenerating: boolean;
}

// Brand voice examples - moved outside component to avoid recreation on each render
const brandVoiceExamples = [
  { id: 'none', name: 'No Brand Voice' },
  { id: 'emc-official', name: 'EMC Official', description: 'Professional, authoritative voice of the Electronic Music Council' },
  { id: 'underground', name: 'Underground Scene', description: 'Edgy, authentic voice of the underground electronic music scene' },
  { id: 'festival-promoter', name: 'Festival Promoter', description: 'Enthusiastic, exciting voice focused on live events and experiences' },
  { id: 'music-educator', name: 'Music Educator', description: 'Clear, instructional voice focused on teaching production techniques' },
  { id: 'custom', name: 'Custom Brand Voice', description: 'Define your own brand voice' }
];

// Content formats - moved outside component
const contentFormats = [
  { id: 'paragraph', name: 'Paragraphs' },
  { id: 'bullets', name: 'Bullet Points' },
  { id: 'numbered', name: 'Numbered List' },
  { id: 'social', name: 'Social Post' },
  { id: 'script', name: 'Script Format' }
];

// Content lengths - moved outside component
const contentLengths = [
  { id: 'short', name: 'Short' },
  { id: 'medium', name: 'Medium' },
  { id: 'long', name: 'Long' }
];

const EnhancedContentForm: React.FC<EnhancedContentFormProps> = ({
  template,
  platforms,
  onSubmit,
  isGenerating
}) => {
  // Form state
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
  
  // Advanced options state
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false);
  const [selectedTone, setSelectedTone] = useState<string>('professional');
  const [customBrandVoice, setCustomBrandVoice] = useState<string>('');
  const [contentFormat, setContentFormat] = useState<string>('paragraph');
  const [contentLength, setContentLength] = useState<string>('medium');
  const [ethicalCheckEnabled, setEthicalCheckEnabled] = useState(true);
  const [plagiarismCheckEnabled, setPlagiarismCheckEnabled] = useState(true);
  const [seoOptimizationEnabled, setSeoOptimizationEnabled] = useState(true);

  // Extract required fields from template - memoized to avoid recalculation on every render
  const requiredFields = useMemo(() => {
    if (!template) return [];
    
    const fieldRegex = /{([^}]+)}/g;
    const matches = template.promptTemplate.match(fieldRegex);
    
    if (!matches) return [];
    
    return matches.map(match => match.replace(/{|}/g, ''));
  }, [template]);

  // Handle input change - memoized callback
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle platform change - memoized callback
  const handlePlatformChange = useCallback((platformId: number) => {
    if (!platforms) return;
    const platform = platforms.find(p => p.id === platformId) || null;
    setSelectedPlatform(platform);
  }, [platforms]);

  // Handle form submission - memoized callback
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add advanced options to form values
    const enhancedFormValues = {
      ...formValues,
      tone: selectedTone,
      brandVoice: selectedTone === 'brandVoice' && customBrandVoice ? customBrandVoice : undefined,
      format: contentFormat,
      length: contentLength,
      ethicalCheckEnabled: ethicalCheckEnabled.toString(),
      checkPlagiarism: plagiarismCheckEnabled.toString(),
      optimizeSeo: seoOptimizationEnabled.toString()
    };
    
    await onSubmit(enhancedFormValues, selectedPlatform || undefined);
  }, [
    formValues, 
    selectedTone, 
    customBrandVoice, 
    contentFormat, 
    contentLength, 
    ethicalCheckEnabled, 
    plagiarismCheckEnabled, 
    seoOptimizationEnabled,
    selectedPlatform,
    onSubmit
  ]);

  // If no template is selected, show a placeholder
  if (!template) {
    return (
      <div className="bg-background-alt border border-border rounded-lg p-6 shadow-sm h-full">
        <h3 className="text-lg font-medium text-text-light mb-4">Generate Content</h3>
        <p className="text-text-muted mb-4">Select a template from the left to get started.</p>
        <div className="border border-dashed border-border rounded-md p-6 flex flex-col items-center justify-center">
          <Zap className="h-12 w-12 text-text-muted mb-2" />
          <p className="text-center text-text-muted">Choose a template to create electronic music content</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background-alt border border-border rounded-lg p-6 shadow-sm"
    >
      <h3 className="text-lg font-medium text-text-light mb-4">Generate {template.name}</h3>
      <form onSubmit={handleSubmit}>
        {/* Platform selection if applicable */}
        {platforms && platforms.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-light mb-2">
              Platform
            </label>
            <div className="flex flex-wrap gap-2">
              {platforms.map(platform => (
                <button
                  key={platform.id}
                  type="button"
                  className={`px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${
                    selectedPlatform?.id === platform.id
                      ? 'bg-primary text-text-light'
                      : 'bg-background text-text-muted hover:bg-background/70 hover:text-text-light'
                  }`}
                  onClick={() => handlePlatformChange(platform.id)}
                >
                  <i className={platform.icon}></i>
                  <span>{platform.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Required fields from template */}
        {requiredFields.map(field => (
          <div key={field} className="mb-4">
            <label 
              htmlFor={field} 
              className="block text-sm font-medium text-text-light mb-2"
            >
              {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
            </label>
            <input
              id={field}
              type="text"
              value={formValues[field] || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="w-full px-3 py-2 border border-border bg-background rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary text-text-light"
              placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
              required
            />
          </div>
        ))}

        {/* Advanced Options Toggle */}
        <div className="mb-4 mt-6">
          <button
            type="button"
            className="flex items-center gap-2 text-text-muted hover:text-text-light transition-colors text-sm"
            onClick={() => setAdvancedOptionsOpen(!advancedOptionsOpen)}
          >
            <Settings className="h-4 w-4" />
            <span>{advancedOptionsOpen ? 'Hide' : 'Show'} Advanced Options</span>
          </button>
        </div>

        {/* Advanced Options Panel */}
        {advancedOptionsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 bg-background p-4 rounded-md border border-border"
          >
            {/* Tone Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-light mb-2">
                Content Tone
              </label>
              <select
                value={selectedTone}
                onChange={(e) => setSelectedTone(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-background rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary text-text-light"
              >
                {contentTones.map(tone => (
                  <option key={tone.id} value={tone.id}>
                    {tone.name} - {tone.description}
                  </option>
                ))}
                <option value="brandVoice">Use Brand Voice</option>
              </select>
            </div>

            {/* Brand Voice Selection (shown only if brand voice is selected) */}
            {selectedTone === 'brandVoice' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-light mb-2">
                  Brand Voice
                </label>
                <select
                  value={customBrandVoice ? 'custom' : 'emc-official'}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      // Keep existing custom value if any
                    } else if (e.target.value !== 'none') {
                      setCustomBrandVoice(e.target.value);
                    } else {
                      setCustomBrandVoice('');
                    }
                  }}
                  className="w-full px-3 py-2 border border-border bg-background rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary text-text-light mb-2"
                >
                  {brandVoiceExamples.map(voice => (
                    <option key={voice.id} value={voice.id}>
                      {voice.name}
                    </option>
                  ))}
                </select>
                
                {(customBrandVoice === 'custom' || brandVoiceExamples.find(v => v.id === customBrandVoice)?.id === 'custom') && (
                  <textarea
                    value={typeof customBrandVoice === 'string' && customBrandVoice !== 'custom' ? customBrandVoice : ''}
                    onChange={(e) => setCustomBrandVoice(e.target.value)}
                    placeholder="Describe your brand voice in detail or paste sample text that exemplifies your preferred style..."
                    className="w-full px-3 py-2 border border-border bg-background rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary text-text-light resize-none"
                    rows={3}
                  />
                )}
              </div>
            )}

            {/* Content Format */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-light mb-2">
                Content Format
              </label>
              <div className="flex flex-wrap gap-2">
                {contentFormats.map(format => (
                  <button
                    key={format.id}
                    type="button"
                    className={`px-3 py-2 rounded-md text-sm transition-colors ${
                      contentFormat === format.id
                        ? 'bg-primary text-text-light'
                        : 'bg-background text-text-muted hover:bg-background/70 hover:text-text-light'
                    }`}
                    onClick={() => setContentFormat(format.id)}
                  >
                    {format.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Length */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-light mb-2">
                Content Length
              </label>
              <div className="flex flex-wrap gap-2">
                {contentLengths.map(length => (
                  <button
                    key={length.id}
                    type="button"
                    className={`px-3 py-2 rounded-md text-sm transition-colors ${
                      contentLength === length.id
                        ? 'bg-primary text-text-light'
                        : 'bg-background text-text-muted hover:bg-background/70 hover:text-text-light'
                    }`}
                    onClick={() => setContentLength(length.id)}
                  >
                    {length.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Quality Options */}
            <div className="space-y-3 mt-6">
              <div className="flex items-center">
                <input
                  id="ethical-check"
                  type="checkbox"
                  checked={ethicalCheckEnabled}
                  onChange={(e) => setEthicalCheckEnabled(e.target.checked)}
                  className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                />
                <label htmlFor="ethical-check" className="ml-2 block text-sm text-text-light flex items-center gap-1">
                  <Shield className="h-4 w-4 text-green-500" />
                  Ethical Content Filter
                  <span className="text-xs text-text-muted ml-1">(prevents hallucinations & clickbait)</span>
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="plagiarism-check"
                  type="checkbox"
                  checked={plagiarismCheckEnabled}
                  onChange={(e) => setPlagiarismCheckEnabled(e.target.checked)}
                  className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                />
                <label htmlFor="plagiarism-check" className="ml-2 block text-sm text-text-light flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  Plagiarism Check
                  <span className="text-xs text-text-muted ml-1">(ensures originality)</span>
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="seo-optimization"
                  type="checkbox"
                  checked={seoOptimizationEnabled}
                  onChange={(e) => setSeoOptimizationEnabled(e.target.checked)}
                  className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                />
                <label htmlFor="seo-optimization" className="ml-2 block text-sm text-text-light flex items-center gap-1">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  SEO Optimization
                  <span className="text-xs text-text-muted ml-1">(improves search visibility)</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-4 bg-primary hover:bg-primary-hover text-white py-2 px-4 rounded-md shadow flex items-center justify-center transition-colors"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="animate-spin mr-2 h-5 w-5" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-5 w-5" />
              Generate Content
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default React.memo(EnhancedContentForm);
