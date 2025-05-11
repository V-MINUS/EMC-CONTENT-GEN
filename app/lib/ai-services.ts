// AI Services Integration
// This file contains interfaces and connectors for various AI services

// Interface for AI text generation services
export interface AITextGenerator {
  generateContent: (prompt: string, options: TextGenerationOptions) => Promise<string>;
  generateSeoSuggestions: (content: string) => Promise<string[]>;
}

// Interface for AI image generation services
export interface AIImageGenerator {
  generateImage: (prompt: string, options: ImageGenerationOptions) => Promise<string>;
}

// Interface for AI plagiarism detection services
export interface PlagiarismDetector {
  checkPlagiarism: (content: string) => Promise<PlagiarismResult>;
}

// Interface for SEO optimization services
export interface SEOOptimizer {
  optimizeContent: (content: string, keywords: string[], options: SEOOptions) => Promise<SEOResult>;
  generateMetaTags: (content: string, title: string) => Promise<MetaTags>;
  suggestKeywords: (topic: string, industry: string) => Promise<string[]>;
}

// Service options interfaces
export interface TextGenerationOptions {
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  temperature?: number; // Controls randomness - lower means more deterministic
  brandVoice?: string; // Reference to a saved brand voice
  format?: string; // Output format (paragraph, bullet points, etc.)
  ethicalChecks?: boolean; // Whether to apply ethical filters
}

export interface ImageGenerationOptions {
  size?: string;
  style?: string;
  quality?: 'standard' | 'hd';
}

export interface SEOOptions {
  targetReadability?: string;
  maxWordCount?: number;
  targetKeywordDensity?: number;
  includeHeadings?: boolean;
}

// Result interfaces
export interface PlagiarismResult {
  isOriginal: boolean;
  similarityScore: number;
  similarSources: SimilarSource[];
}

export interface SimilarSource {
  url: string;
  title: string;
  similarityPercentage: number;
  matchedText: string;
}

export interface SEOResult {
  optimizedContent: string;
  readabilityScore: number;
  keywordDensity: Record<string, number>;
  suggestions: string[];
  wordCount: number;
}

export interface MetaTags {
  title: string;
  description: string;
  keywords: string;
}

// Brand voice interface
export interface BrandVoice {
  id: string;
  name: string;
  description: string;
  examples: string[];
  toneAttributes: string[];
}

// Tone interface
export interface ContentTone {
  id: string;
  name: string;
  description: string;
  examples: string[];
}

// Mock implementation for OpenAI integration
export class OpenAIService implements AITextGenerator, AIImageGenerator {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateContent(prompt: string, options: TextGenerationOptions): Promise<string> {
    // In a real implementation, this would call the OpenAI API
    console.log('Generating content with OpenAI', { prompt, options });
    
    // Mock implementation
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: this.buildSystemPrompt(options)
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: options.temperature || 0.7
        })
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating content with OpenAI:', error);
      return 'Error generating content. Please try again.';
    }
  }

  private buildSystemPrompt(options: TextGenerationOptions): string {
    let systemPrompt = 'You are an expert content creator for the electronic music industry.';
    
    if (options.tone) {
      systemPrompt += ` Write in a ${options.tone} tone.`;
    }
    
    if (options.brandVoice) {
      systemPrompt += ` Emulate the brand voice described as: ${options.brandVoice}.`;
    }
    
    if (options.format) {
      systemPrompt += ` Format the output as ${options.format}.`;
    }
    
    if (options.length) {
      systemPrompt += ` Keep the content ${options.length}.`;
    }
    
    if (options.ethicalChecks) {
      systemPrompt += ` Ensure the content is factual, ethical, and avoids hallucinations or misleading claims. Do not generate clickbait.`;
    }
    
    return systemPrompt;
  }

  async generateSeoSuggestions(content: string): Promise<string[]> {
    // In a real implementation, this would call the OpenAI API
    console.log('Generating SEO suggestions with OpenAI', { content });
    
    // Mock implementation
    return [
      'electronic music production',
      'EDM events',
      'house music producers',
      'techno scene',
      'music production tips'
    ];
  }

  async generateImage(prompt: string, options: ImageGenerationOptions): Promise<string> {
    // In a real implementation, this would call the OpenAI DALL-E API
    console.log('Generating image with OpenAI', { prompt, options });
    
    // Return a placeholder URL for now
    return 'https://picsum.photos/800/450';
  }
}

// Mock implementation for Semrush SEO integration
export class SemrushSEOService implements SEOOptimizer {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async optimizeContent(content: string, keywords: string[], options: SEOOptions): Promise<SEOResult> {
    // In a real implementation, this would call the Semrush API
    console.log('Optimizing content with Semrush', { content, keywords, options });
    
    // Mock implementation
    return {
      optimizedContent: content,
      readabilityScore: 75,
      keywordDensity: keywords.reduce((acc, keyword) => ({ ...acc, [keyword]: Math.random() * 5 }), {}),
      suggestions: [
        'Add more heading structures for better readability',
        'Include keywords in the first paragraph',
        'Add internal links to related content'
      ],
      wordCount: content.split(' ').length
    };
  }

  async generateMetaTags(content: string, title: string): Promise<MetaTags> {
    // In a real implementation, this would call the Semrush API
    console.log('Generating meta tags with Semrush', { content, title });
    
    // Mock implementation
    return {
      title: title,
      description: content.substring(0, 160) + '...',
      keywords: 'electronic music, EDM, production, music production, house, techno'
    };
  }

  async suggestKeywords(topic: string, industry: string): Promise<string[]> {
    // In a real implementation, this would call the Semrush API
    console.log('Suggesting keywords with Semrush', { topic, industry });
    
    // Mock implementation for electronic music industry
    return [
      'electronic music production',
      'EDM festivals',
      'house music production',
      'techno music',
      'music production software',
      'electronic music artists',
      'DJ equipment',
      'synthesizer tutorials',
      'beat making',
      'music production tips'
    ];
  }
}

// Mock implementation for Plagiarism Detection
export class CopyScapeService implements PlagiarismDetector {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async checkPlagiarism(content: string): Promise<PlagiarismResult> {
    // In a real implementation, this would call the CopyScape API
    console.log('Checking plagiarism with CopyScape', { content });
    
    // Mock implementation
    return {
      isOriginal: Math.random() > 0.2, // 80% chance of being original
      similarityScore: Math.random() * 30, // 0-30% similarity
      similarSources: Math.random() > 0.7 ? [
        {
          url: 'https://example.com/electronic-music-article',
          title: 'Guide to Electronic Music Production',
          similarityPercentage: Math.random() * 20,
          matchedText: 'Electronic music production requires a good understanding of synthesis and sound design.'
        }
      ] : []
    };
  }
}

// Pre-defined content tones
export const contentTones: ContentTone[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Formal, business-appropriate language',
    examples: ['Our electronic music production course offers comprehensive instruction in synthesis techniques.']
  },
  {
    id: 'casual',
    name: 'Casual',
    description: 'Relaxed, conversational language',
    examples: ['Hey music lovers! Ready to dive into some awesome electronic beats?']
  },
  {
    id: 'enthusiastic',
    name: 'Enthusiastic',
    description: 'High-energy, excited language',
    examples: ['WOW! This new synthesizer is absolutely MIND-BLOWING for electronic music production!']
  },
  {
    id: 'technical',
    name: 'Technical',
    description: 'Detailed, technical language',
    examples: ['The oscillator module generates waveforms that pass through the voltage-controlled filter to shape timbre.']
  },
  {
    id: 'humorous',
    name: 'Humorous',
    description: 'Light-hearted, funny language',
    examples: ['Who needs sleep when you\'ve got a new drum machine? Just kidding, please sleep...eventually.']
  },
  {
    id: 'persuasive',
    name: 'Persuasive',
    description: 'Convincing, compelling language',
    examples: ['Don\'t miss this once-in-a-lifetime opportunity to learn from the industry\'s top electronic music producers.']
  },
  {
    id: 'inspirational',
    name: 'Inspirational',
    description: 'Uplifting, motivational language',
    examples: ['Every great electronic music producer started somewhere. Today could be your first step toward greatness.']
  },
  {
    id: 'educational',
    name: 'Educational',
    description: 'Instructional, informative language',
    examples: ['To create a sidechained compression effect, first route your kick drum to a bus, then apply a compressor to your bass.']
  }
];

import { RealOpenAIService } from './openai-service';
import { DeepSeekService } from './deepseek-service';
import { MultiProviderService } from './multi-provider-service';
import { createMockServices } from './mock-ai-services';

// We'll dynamically import these services to avoid errors if files don't exist
// This helps during Vercel build process
type SEOServiceType = any;
type PlagiarismServiceType = any;

// Check if we're in Vercel build mode
const IS_VERCEL_BUILD = process.env.VERCEL_BUILD_MODE === 'true';

// Factory function to create AI service instances based on configuration
export function createAIServices() {
  // Only use mock services during actual Vercel build process - not during normal operation
  if (IS_VERCEL_BUILD && process.env.NODE_ENV !== 'development' && process.env.USE_MOCK_SERVICES !== 'false') {
    console.log('EMC Generator: Using mock services for build or preview');
    return createMockServices();
  }
  
  console.log('EMC Generator: Using REAL OpenAI services for content generation');
  
  // Get API keys from environment variables
  const openAiKey = process.env.OPENAI_API_KEY || '';
  const deepSeekKey = process.env.DEEPSEEK_API_KEY || null; // Optional DeepSeek API key
  const semrushKey = process.env.SEMRUSH_API_KEY || '';
  const copyScapeKey = process.env.COPYSCAPE_API_KEY || '';
  
  // Use try-catch to handle possible missing service files during build
  let seoService: SEOServiceType;
  let plagiarismService: PlagiarismServiceType;
  
  try {
    // These will be imported dynamically only when needed
    const { SemrushSEOService } = require('./seo-service');
    const { CopyScapeService } = require('./plagiarism-service');
    
    seoService = new SemrushSEOService(semrushKey);
    plagiarismService = new CopyScapeService(copyScapeKey);
  } catch (error) {
    console.warn('Could not load SEO or plagiarism services:', error);
    // Create mock/stub services if we can't load the real ones
    const mockServices = createMockServices();
    seoService = mockServices.seoOptimizer;
    plagiarismService = mockServices.plagiarismDetector;
  }
  
  // Debug which API keys we have available
  console.log(`OpenAI API Key present: ${!!openAiKey}`);
  console.log(`DeepSeek API Key present: ${!!deepSeekKey}`);
  
  if (!openAiKey) {
    throw new Error('OpenAI API key is required. Please add it to your .env.local file.');
  }
  
  console.log('Using real AI services with automatic fallback');
  
  // Create direct OpenAI service if DeepSeek isn't available
  if (!deepSeekKey) {
    console.log('DeepSeek API key not found - using OpenAI only');
    const openAiService = new RealOpenAIService(openAiKey);
    
    return {
      textGenerator: openAiService,
      imageGenerator: openAiService,
      seoOptimizer: seoService,
      plagiarismDetector: plagiarismService
    };
  }
  
  // Create the multi-provider service with automatic fallback
  // No mock services, just real APIs
  const openAiService = new RealOpenAIService(openAiKey);
  const deepSeekService = new DeepSeekService(deepSeekKey);
  
  // Use modified multi-provider that only uses real APIs
  const multiProvider = new MultiProviderService(
    openAiService,
    deepSeekService,
    seoService
  );
  
  return {
    textGenerator: multiProvider,
    imageGenerator: multiProvider,
    seoOptimizer: seoService,
    plagiarismDetector: plagiarismService
  };
}
