'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, PenSquare, Copy, Download, Loader2, AlertCircle, CheckCircle, Shield, Bookmark } from 'lucide-react';
import Layout from './components/Layout';
import ParticlesBackground from './components/ParticlesBackground';
import ErrorMessage from './components/ErrorMessage';
import ContentTemplateCard from './components/ContentTemplateCard';
import EnhancedContentForm from './components/EnhancedContentForm';
import ContentRefiner from './components/ContentRefiner';
import ResearchPanel from './components/ResearchPanel';
import ContentCalendar from './components/ContentCalendar';

// Import enhanced templates and platforms
import enhancedTemplates, { socialPlatforms, toolCategories } from './utils/enhanced-templates';

// Define local interfaces to avoid import errors
interface SocialPlatform {
  id: number;
  name: string;
  icon: string;
  characterLimit: number;
  imageRequired: boolean;
}

interface ContentTemplate {
  id: number;
  name: string;
  description: string;
  icon: string;
  category?: string;
  promptTemplate: string;
  formFields?: Record<string, any>[];
}

interface PlagiarismResult {
  isOriginal: boolean;
  similarityScore: number;
  similarSources: {
    url: string;
    title: string;
    similarityPercentage: number;
  }[];
}

interface SEOResult {
  readabilityScore: number;
  keywordDensity: Record<string, number>;
  suggestions: string[];
  wordCount: number;
}

interface MetaTags {
  title: string;
  description: string;
  keywords: string;
}

interface GeneratedContentData {
  content: string;
  imageUrl: string | null;
  plagiarismCheck: PlagiarismResult | null;
  seoOptimization: SEOResult | null;
  metaTags: MetaTags | null;
  suggestedKeywords: string[];
}

export default function Home() {
  // View state - controls which view is currently active
  const [activeView, setActiveView] = useState<'generator' | 'calendar' | 'research'>('generator');
  
  // Generator states
  const [activeCategory, setActiveCategory] = useState<string>('social');
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [generatedContentData, setGeneratedContentData] = useState<GeneratedContentData | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [researchResults, setResearchResults] = useState<string>('');

  // Handle research completion
  const handleResearchComplete = (results: string) => {
    setResearchResults(results);
    // Create a simplified version of generated content data
    setGeneratedContentData({
      content: results,
      imageUrl: null,
      plagiarismCheck: null,
      seoOptimization: null,
      metaTags: null,
      suggestedKeywords: []
    });
  };

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setSelectedTemplate(null);
    setGeneratedContentData(null);
  };

  // Handle template selection
  const handleTemplateSelect = (template: ContentTemplate) => {
    setSelectedTemplate(template);
    // Reset generated content
    setGeneratedContentData(null);
  };

  // Filter templates by active category
  const filteredTemplates = enhancedTemplates.filter(
    template => template.category === activeCategory
  );

  // Handle calendar entry selection
  const handleCalendarEntrySelect = (entry: any) => {
    // Create a pre-filled prompt from the calendar entry
    setActiveView('generator');
    if (activeCategory !== 'social') {
      setActiveCategory('social');
    }
    
    // Find a suitable template based on entry type
    let template = enhancedTemplates.find(t => 
      t.category === 'social' && 
      (t.name.toLowerCase().includes(entry.type.toLowerCase()) || 
       t.name.toLowerCase().includes('announcement'))
    );
    
    // Default to Event Announcement if no specific match
    if (!template) {
      template = enhancedTemplates.find(t => t.id === 2); // Event Announcement
    }
    
    if (template) {
      setSelectedTemplate(template);
    }
  };

  // Handle content refinement completion
  const handleRefinementComplete = (refinedContent: string) => {
    if (generatedContentData) {
      setGeneratedContentData({
        ...generatedContentData,
        content: refinedContent
      });
    }
  };

  // Generate content based on the selected template and form values
  const generateContent = async (values: Record<string, string>, platform?: SocialPlatform) => {
    if (!selectedTemplate) return;
    
    setIsGenerating(true);
    setError('');
    
    try {
      // Construct the prompt from the template
      let prompt = selectedTemplate.promptTemplate;
      
      // Replace placeholders with form values
      Object.entries(values).forEach(([key, value]) => {
        if (typeof value === 'string') {
          prompt = prompt.replace(`{${key}}`, value);
        }
      });

      // Get additional options from values
      const tone = values.tone;
      const brandVoice = values.brandVoice;
      const format = values.format;
      const length = values.length;
      const ethicalCheckEnabled = values.ethicalCheckEnabled !== 'false';
      const checkPlagiarism = values.checkPlagiarism !== 'false';
      const optimizeSeo = values.optimizeSeo !== 'false';
      
      // Determine if we should include an image based on platform or category
      const includeImage = platform?.imageRequired || activeCategory === 'video';
      
      // Use our enhanced API route with improved error handling
      try {
        console.log('EMC Generator: Making API request to generate content');
        
        const requestBody = {
          prompt,
          includeImage,
          category: activeCategory,
          platform: platform?.id.toString() || '',
          topic: values.topic || values.keywords || '',
          tone,
          brandVoice,
          format,
          length,
          ethicalCheckEnabled,
          checkPlagiarism,
          optimizeSeo
        };
        
        console.log('EMC Generator: Request data', JSON.stringify(requestBody).substring(0, 150) + '...');
        
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        console.log('EMC Generator: Response status:', response.status);
        
        // Handle non-OK responses
        if (!response.ok) {
          let errorMessage = 'Failed to generate content';
          
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
            console.error('EMC Generator: API error response:', errorData);
          } catch (parseError) {
            console.error('EMC Generator: Could not parse error response', parseError);
          }
          
          throw new Error(errorMessage);
        }
        
        // Parse successful response
        let data;
        try {
          data = await response.json();
          console.log('EMC Generator: Successfully received response data');
        } catch (parseError) {
          console.error('EMC Generator: Error parsing successful response', parseError);
          throw new Error('Error parsing response data');
        }

        // Set results
        setGeneratedContentData({
          content: data.content,
          imageUrl: data.imageUrl,
          plagiarismCheck: data.plagiarismCheck,
          seoOptimization: data.seoOptimization,
          metaTags: data.metaTags,
          suggestedKeywords: data.suggestedKeywords || []
        });
      } catch (innerError) {
        console.error('EMC Generator: Error in inner content generation:', innerError);
        throw innerError;
      }
      
      // Scroll to results
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
      
    } catch (err: any) {
      console.error('Error generating content:', err);
      setError(err.message || 'Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy content to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Could add a toast notification here
        console.log('Content copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy content: ', err);
      });
  };

  // Download content as markdown file
  const downloadAsMarkdown = (content: string, fileName: string = 'emc-content') => {
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `${fileName}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Layout>
      <ParticlesBackground />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Background gradient overlay */}
        <div className="fixed inset-0 bg-gradient-to-b from-background to-background-alt/80 -z-10"></div>
        
        {/* Hero Section */}
        <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-text-light mb-2">
              EMC <span className="text-accent">Content Generator</span>
            </h1>
            <p className="text-text-muted text-lg">
              AI-powered content creation for Electronic Music Council
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {activeView !== 'generator' && (
              <button 
                onClick={() => setActiveView('generator')}
                className="bg-border hover:bg-border/80 px-4 py-2 rounded-md text-text-light flex items-center gap-2 transition-colors"
              >
                <PenSquare size={18} />
                <span>Content Generator</span>
              </button>
            )}
            {activeView !== 'calendar' && (
              <button 
                onClick={() => setActiveView('calendar')}
                className="bg-secondary hover:bg-primary-hover px-4 py-2 rounded-md text-text-light flex items-center gap-2 transition-colors"
              >
                <Calendar size={18} />
                <span>Content Calendar</span>
              </button>
            )}
            {activeView !== 'research' && (
              <button
                onClick={() => setActiveView('research')}
                className="bg-secondary hover:bg-primary-hover px-4 py-2 rounded-md text-text-light flex items-center gap-2 transition-colors"
              >
                <Search size={18} />
                <span>Web Research</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Generator View */}
        {activeView === 'generator' && (
          <>
            {/* Tool Category Navigation */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-3">
                {toolCategories.map(category => (
                  <button
                    key={category.id}
                    className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                      activeCategory === category.id
                        ? 'bg-primary text-text-light'
                        : 'bg-background-alt text-text-muted hover:text-text-light hover:bg-background-alt/70'
                    }`}
                    onClick={() => handleCategoryChange(category.id)}
                  >
                    <i className={`${category.icon}`}></i>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Main Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left column - Templates */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-text-light mb-4">
                  {activeCategory === 'social' && 'Social Media Templates'}
                  {activeCategory === 'video' && 'Video Content Templates'}
                  {activeCategory === 'blog' && 'Blog Writing Templates'}
                  {activeCategory === 'email' && 'Email Marketing Templates'}
                  {activeCategory === 'seo' && 'SEO Tools Templates'}
                  {activeCategory === 'planning' && 'Content Planning Templates'}
                  {activeCategory === 'research' && 'Research Templates'}
                  {activeCategory === 'advertising' && 'Ad Copy Templates'}
                  {activeCategory === 'event' && 'Event Marketing Templates'}
                  {activeCategory === 'product' && 'Product Description Templates'}
                </h2>
                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 pb-4">
                  {filteredTemplates.map(template => (
                    <ContentTemplateCard
                      key={template.id}
                      template={template}
                      isSelected={selectedTemplate?.id === template.id}
                      onClick={() => handleTemplateSelect(template)}
                    />
                  ))}
                </div>
              </div>
              
              {/* Middle column - Form or Content Display */}
              <div>
                {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
                
                <EnhancedContentForm
                  template={selectedTemplate}
                  platforms={activeCategory === 'social' ? socialPlatforms : undefined}
                  onSubmit={generateContent}
                  isGenerating={isGenerating}
                />
              </div>
              
              {/* Right column - Generated Content */}
              <div>
                {generatedContentData ? (
                  <div className="bg-background-alt border border-border rounded-lg p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-text-light">Generated Content</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(generatedContentData.content)}
                          className="p-2 rounded-md bg-background hover:bg-background/70 text-text-muted hover:text-text-light transition-colors"
                          title="Copy to clipboard"
                        >
                          <Copy size={18} />
                        </button>
                        <button
                          onClick={() => downloadAsMarkdown(generatedContentData.content)}
                          className="p-2 rounded-md bg-background hover:bg-background/70 text-text-muted hover:text-text-light transition-colors"
                          title="Download as markdown"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Generated Image (if available) */}
                    {generatedContentData.imageUrl && (
                      <div className="mb-4">
                        <img 
                          src={generatedContentData.imageUrl} 
                          alt="Generated content visual" 
                          className="w-full h-auto rounded-md border border-border"
                        />
                      </div>
                    )}
                    
                    {/* AI Quality Checks */}
                    {(generatedContentData.plagiarismCheck || generatedContentData.seoOptimization) && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {generatedContentData.plagiarismCheck && (
                          <div className={`px-3 py-1 rounded-full text-xs ${
                            generatedContentData.plagiarismCheck.isOriginal
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          } flex items-center`}>
                            <CheckCircle size={12} className="mr-1" />
                            <span>
                              {generatedContentData.plagiarismCheck.isOriginal
                                ? 'Original Content'
                                : `${Math.round(generatedContentData.plagiarismCheck.similarityScore)}% Similar Content Detected`}
                            </span>
                          </div>
                        )}
                        
                        {generatedContentData.seoOptimization && (
                          <div className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200 flex items-center">
                            <Search size={12} className="mr-1" />
                            <span>SEO Score: {generatedContentData.seoOptimization.readabilityScore}/100</span>
                          </div>
                        )}
                        
                        <div className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 border border-purple-200 flex items-center">
                          <Shield size={12} className="mr-1" />
                          <span>AI Ethics Verified</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Content Display */}
                    <div className="prose prose-sm prose-invert max-w-none mb-6 pb-4 border-b border-border">
                      <div dangerouslySetInnerHTML={{
                        __html: generatedContentData.content
                          .replace(/\n/g, '<br>')
                          .replace(/#{1,6}\s+(.*?)$/gm, '<h3>$1</h3>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/`(.*?)`/g, '<code>$1</code>')
                      }} />
                    </div>
                    
                    {/* SEO & Keywords Section */}
                    {generatedContentData.suggestedKeywords.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-text-light mb-2 flex items-center">
                          <Bookmark size={14} className="mr-1 text-accent" />
                          Suggested Keywords
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {generatedContentData.suggestedKeywords.map((keyword, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-background text-text-muted text-xs rounded-md border border-border"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Meta Tags Section */}
                    {generatedContentData.metaTags && (
                      <div className="mb-4 p-3 bg-background border border-border rounded-md">
                        <h4 className="text-sm font-medium text-text-light mb-2">Suggested Meta Tags</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-accent">Title:</span>
                            <p className="text-text-muted">{generatedContentData.metaTags.title}</p>
                          </div>
                          <div>
                            <span className="text-accent">Description:</span>
                            <p className="text-text-muted">{generatedContentData.metaTags.description}</p>
                          </div>
                          <div>
                            <span className="text-accent">Keywords:</span>
                            <p className="text-text-muted">{generatedContentData.metaTags.keywords}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Human-in-the-loop refinement */}
                    <ContentRefiner 
                      content={generatedContentData.content}
                      onRefinementComplete={handleRefinementComplete}
                    />
                  </div>
                ) : (
                  <div className="bg-background-alt border border-border rounded-lg p-6 shadow-sm h-full flex flex-col items-center justify-center text-center">
                    <div className="mb-4 p-8 bg-background rounded-full">
                      <PenSquare size={48} className="text-accent opacity-70" />
                    </div>
                    <h3 className="text-lg font-medium text-text-light mb-2">Ready to Generate Content</h3>
                    <p className="text-text-muted">
                      Select a template and fill out the form to create AI-powered electronic music content
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Calendar View */}
        {activeView === 'calendar' && (
          <div className="mt-4">
            <ContentCalendar onEntrySelect={handleCalendarEntrySelect} />
          </div>
        )}

        {/* Research View */}
        {activeView === 'research' && (
          <div className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <ResearchPanel onResearchComplete={handleResearchComplete} />
              </div>
              <div className="lg:col-span-2">
                {researchResults ? (
                  <div className="bg-background-alt border border-border rounded-lg p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-text-light">Research Results</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(researchResults)}
                          className="p-2 rounded-md bg-background hover:bg-background/70 text-text-muted hover:text-text-light transition-colors"
                          title="Copy to clipboard"
                        >
                          <Copy size={18} />
                        </button>
                        <button
                          onClick={() => downloadAsMarkdown(researchResults, 'emc-research')}
                          className="p-2 rounded-md bg-background hover:bg-background/70 text-text-muted hover:text-text-light transition-colors"
                          title="Download as markdown"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="prose prose-sm prose-invert max-w-none">
                      <div dangerouslySetInnerHTML={{
                        __html: researchResults
                          .replace(/\n/g, '<br>')
                          .replace(/#{1,6}\s+(.*?)$/gm, '<h3>$1</h3>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/`(.*?)`/g, '<code>$1</code>')
                      }} />
                    </div>
                  </div>
                ) : (
                  <div className="bg-background-alt border border-border rounded-lg p-6 shadow-sm h-full flex flex-col items-center justify-center text-center">
                    <div className="mb-4 p-8 bg-background rounded-full">
                      <Search size={48} className="text-accent opacity-70" />
                    </div>
                    <h3 className="text-lg font-medium text-text-light mb-2">Start Your Research</h3>
                    <p className="text-text-muted">
                      Use the research panel to find information about artists, venues, and electronic music trends
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer Showcase Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-text-light mb-6">AI-Powered Content Creation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-background-alt border border-border rounded-lg p-5 shadow-sm">
              <div className="mb-4 p-3 bg-background rounded-full inline-block">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-text-light mb-2">Plagiarism Detection</h3>
              <p className="text-text-muted text-sm">
                Ensure your content is 100% original with our built-in plagiarism checker
              </p>
            </div>
            
            <div className="bg-background-alt border border-border rounded-lg p-5 shadow-sm">
              <div className="mb-4 p-3 bg-background rounded-full inline-block">
                <Search className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-text-light mb-2">SEO Optimization</h3>
              <p className="text-text-muted text-sm">
                Automatically optimize your content for search engines with keyword suggestions
              </p>
            </div>
            
            <div className="bg-background-alt border border-border rounded-lg p-5 shadow-sm">
              <div className="mb-4 p-3 bg-background rounded-full inline-block">
                <Calendar className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-lg font-medium text-text-light mb-2">Content Calendar</h3>
              <p className="text-text-muted text-sm">
                Plan and schedule your content with our integrated content calendar
              </p>
            </div>
            
            <div className="bg-background-alt border border-border rounded-lg p-5 shadow-sm">
              <div className="mb-4 p-3 bg-background rounded-full inline-block">
                <PenSquare className="h-6 w-6 text-yellow-500" />
              </div>
              <h3 className="text-lg font-medium text-text-light mb-2">40+ Templates</h3>
              <p className="text-text-muted text-sm">
                Choose from over 40 specialized templates for all your content needs
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://www.electronicmusiccouncil.com" className="bg-primary hover:bg-primary-hover px-6 py-3 rounded-md text-text-light font-medium transition-colors">
              Visit EMC Website
            </a>
            <a href="https://www.electronicmusiccouncil.com/events" className="bg-background-alt hover:bg-border px-6 py-3 rounded-md text-text-light font-medium transition-colors border border-border">
              Upcoming Events
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
