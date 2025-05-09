'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, PenSquare, Copy, Download, CalendarPlus, ExternalLink, Loader2 } from 'lucide-react';
import Layout from './components/Layout';
import ParticlesBackground from './components/ParticlesBackground';
import ErrorMessage from './components/ErrorMessage';
import ContentTemplateCard from './components/ContentTemplateCard';
import TemplateForm from './components/TemplateForm';
import GeneratedContent from './components/GeneratedContent';
import ResearchPanel from './components/ResearchPanel';
import ContentCalendar from './components/ContentCalendar';

// Import templates and platforms from utils if available
import { ContentTemplate, SocialPlatform, socialPlatforms, contentTemplates as templates } from './utils/templates';

export default function Home() {
  // View state - controls which view is currently active
  const [activeView, setActiveView] = useState<'generator' | 'calendar' | 'research'>('generator');
  
  // Generator states
  const [activeCategory, setActiveCategory] = useState<string>('social');
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [seoSuggestions, setSeoSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [researchResults, setResearchResults] = useState<string>('');

  // Tool categories for the generator
  const toolCategories = [
    {
      id: 'social',
      name: 'Social Media',
      icon: 'fab fa-instagram',
      description: 'Create posts for various social media platforms'
    },
    {
      id: 'video',
      name: 'Video Content',
      icon: 'fab fa-youtube',
      description: 'Generate scripts and descriptions for YouTube and other video content'
    },
    {
      id: 'seo',
      name: 'SEO Tools',
      icon: 'fas fa-search',
      description: 'Optimize your content for search engines'
    },
    {
      id: 'planning',
      name: 'Content Planning',
      icon: 'fas fa-calendar-alt',
      description: 'Plan your content calendar and strategy'
    },
    {
      id: 'research',
      name: 'Web Research',
      icon: 'fas fa-globe',
      description: 'Research artists, venues, and electronic music trends'
    }
  ];

  // Handle research completion
  const handleResearchComplete = (results: string) => {
    setResearchResults(results);
    // Also set in generated content so it can be copied/shared
    setGeneratedContent(results);
  };

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setSelectedTemplate(null);
    setFormValues({});
    setGeneratedContent('');
    setGeneratedImage(null);
    setSeoSuggestions([]);
  };

  // Handle template selection
  const handleTemplateSelect = (template: ContentTemplate) => {
    setSelectedTemplate(template);
    // Reset form values and generated content
    setFormValues({});
    setGeneratedContent('');
    setGeneratedImage(null);
    setSeoSuggestions([]);
  };

  // Filter templates by active category
  const filteredTemplates = templates.filter(
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
    let template = templates.find(t => 
      t.category === 'social' && 
      (t.name.toLowerCase().includes(entry.type.toLowerCase()) || 
       t.name.toLowerCase().includes('announcement'))
    );
    
    // Default to Event Announcement if no specific match
    if (!template) {
      template = templates.find(t => t.id === 2); // Event Announcement
    }
    
    if (template) {
      setSelectedTemplate(template);
      
      // Pre-fill some fields based on calendar entry
      const fields: Record<string, string> = {};
      
      if (template.name.toLowerCase().includes('event')) {
        fields['eventName'] = entry.title || '';
        fields['date'] = entry.date || '';
        fields['venue'] = entry.notes?.split(' at ')?.[1] || '';
        fields['artists'] = entry.notes?.includes('featuring') 
          ? entry.notes.split('featuring ')[1].split('.')[0] 
          : '';
        fields['genre'] = 'electronic music';
        fields['ticketPrice'] = 'available online';
      } else {
        // Generic pre-fill
        fields['title'] = entry.title || '';
        fields['date'] = entry.date || '';
        fields['content'] = entry.notes || '';
      }
      
      setFormValues(fields);
      
      // Set platform if applicable
      const platform = socialPlatforms.find(p => 
        p.name.toLowerCase() === entry.platform.toLowerCase()
      );
      if (platform) {
        setSelectedPlatform(platform);
      }
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
        prompt = prompt.replace(`{${key}}`, value);
      });

      // Determine if we should include an image based on platform or category
      const includeImage = platform?.imageRequired || activeCategory === 'video';
      
      // Use our server-side API route
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          includeImage,
          category: activeCategory,
          platform: platform?.id.toString() || '',
          topic: values.topic || values.keywords || '',
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content');
      }
      
      const data = await response.json();

      // Set results
      setGeneratedContent(data.content);
      setGeneratedImage(data.imageUrl || null);
      
      // Generate SEO suggestions if relevant
      if (activeCategory === 'social' || activeCategory === 'seo') {
        generateSeoSuggestions(data.content);
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

  // Generate SEO suggestions based on the content
  const generateSeoSuggestions = (content: string) => {
    // In a real implementation, this would use NLP to extract keywords
    // For now, we'll simulate with some electronic music related keywords
    const musicKeywords = [
      'electronic music cork', 'electronic music ireland', 'beat battle competition',
      'techno events cork', 'house music ireland', 'electronic music council',
      'electronic music production', 'cork nightlife', 'irish electronic artists',
      'techno', 'house music', 'electronic dance music', 'EDM', 'DJ', 'producer'
    ];
    
    // Randomly select 3-5 keywords
    const numSuggestions = Math.floor(Math.random() * 3) + 3;
    const shuffled = [...musicKeywords].sort(() => 0.5 - Math.random());
    
    setSeoSuggestions(shuffled.slice(0, numSuggestions));
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
              All-in-one AI content creation for Electronic Music Council
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
                  {activeCategory === 'seo' && 'SEO Tools'}
                  {activeCategory === 'planning' && 'Content Planning Tools'}
                  {activeCategory === 'research' && 'Research Tools'}
                </h2>
                {filteredTemplates.map(template => (
                  <ContentTemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate?.id === template.id}
                    onClick={() => handleTemplateSelect(template)}
                  />
                ))}
              </div>
              
              {/* Middle column - Form */}
              <div>
                {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
                
                <TemplateForm
                  template={selectedTemplate}
                  platforms={activeCategory === 'social' ? socialPlatforms : undefined}
                  onSubmit={generateContent}
                  isGenerating={isGenerating}
                />
              </div>
              
              {/* Right column - Generated Content */}
              <div>
                <GeneratedContent
                  content={generatedContent}
                  imageUrl={generatedImage || undefined}
                  seoSuggestions={seoSuggestions.length > 0 ? seoSuggestions : undefined}
                />
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
                <GeneratedContent
                  content={researchResults}
                  imageUrl={undefined}
                  seoSuggestions={undefined}
                />
              </div>
            </div>
          </div>
        )}

        {/* Content Calendar Link Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-text-light mb-4">Looking for more EMC content?</h2>
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
