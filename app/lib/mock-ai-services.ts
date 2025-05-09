/**
 * Mock AI services implementation for use during Vercel build
 * These services return dummy data without requiring real API keys
 */

import { TextGenerationOptions, ImageGenerationOptions, SEOOptions } from './ai-services';

// Mock text generation service
export class MockTextGenerator {
  async generateContent(prompt: string, options?: TextGenerationOptions): Promise<string> {
    return `# Mock Electronic Music Content\n\nThis is placeholder content generated during build time for "${prompt}".\n\n## Features\n\n- Designed for electronic music content\n- No API key required during build\n- Real content will be generated when deployed with API keys`;
  }
}

// Mock image generation service
export class MockImageGenerator {
  async generateImage(prompt: string, options?: ImageGenerationOptions): Promise<string> {
    return 'https://placeholder.com/600x400?text=Mock+Electronic+Music+Image';
  }
}

// Mock SEO optimization service
export class MockSEOOptimizer {
  async optimizeContent(content: string, keywords: string[], options?: SEOOptions): Promise<{
    optimizedContent: string;
    seoScore: number;
    keywordDensity: Record<string, number>;
  }> {
    return {
      optimizedContent: content,
      seoScore: 85,
      keywordDensity: {
        'electronic': 2.5,
        'music': 3.2,
        'production': 1.8
      }
    };
  }

  async suggestKeywords(topic: string, industry?: string): Promise<string[]> {
    return [
      'electronic music',
      'EDM',
      'music production',
      'synthesizers',
      'beat making'
    ];
  }

  async generateMetaTags(content: string, title: string): Promise<{
    title: string;
    description: string;
    keywords: string;
  }> {
    return {
      title: title,
      description: 'Electronic Music Council content - placeholder description for build time',
      keywords: 'electronic music, EDM, music production, synthesizers'
    };
  }
}

// Mock plagiarism detector
export class MockPlagiarismDetector {
  async checkPlagiarism(content: string): Promise<{
    isOriginal: boolean;
    similarityScore: number;
    matches: Array<{source: string, text: string, similarity: number}>;
  }> {
    return {
      isOriginal: true,
      similarityScore: 5,
      matches: []
    };
  }
}

// Create mock services
export function createMockServices() {
  return {
    textGenerator: new MockTextGenerator(),
    imageGenerator: new MockImageGenerator(),
    seoOptimizer: new MockSEOOptimizer(),
    plagiarismDetector: new MockPlagiarismDetector()
  };
}
