'use client';

import * as openai from './openai';
import * as huggingface from './huggingface';

// Configuration for AI provider selection
type AiProvider = 'openai' | 'huggingface';

interface AiServiceConfig {
  textProvider: AiProvider;
  imageProvider: AiProvider;
}

// Default configuration - can be changed based on user preferences or availability
let config: AiServiceConfig = {
  textProvider: 'openai', // Default to OpenAI for text
  imageProvider: 'huggingface', // Default to Hugging Face for images (more affordable)
};

// Update configuration
export function setAiConfig(newConfig: Partial<AiServiceConfig>) {
  config = { ...config, ...newConfig };
}

// Generate content using the configured provider
export async function generateContent(
  prompt: string,
  maxTokens: number = 500
): Promise<string> {
  try {
    if (config.textProvider === 'openai') {
      return await openai.generateContent(prompt, maxTokens);
    } else {
      return await huggingface.generateContent(prompt, maxTokens);
    }
  } catch (error) {
    console.error(`Error with ${config.textProvider} text generation:`, error);
    
    // Try the alternative provider if the primary one fails
    try {
      const alternativeProvider = config.textProvider === 'openai' ? 'huggingface' : 'openai';
      console.log(`Falling back to ${alternativeProvider} for text generation`);
      
      if (alternativeProvider === 'openai') {
        return await openai.generateContent(prompt, maxTokens);
      } else {
        return await huggingface.generateContent(prompt, maxTokens);
      }
    } catch (fallbackError) {
      console.error('Fallback text generation also failed:', fallbackError);
      return 'Could not generate content with any available AI provider. Please try again later.';
    }
  }
}

// Generate image using the configured provider
export async function generateImage(
  prompt: string
): Promise<string> {
  try {
    if (config.imageProvider === 'openai') {
      return await openai.generateImage(prompt);
    } else {
      return await huggingface.generateImage(prompt);
    }
  } catch (error) {
    console.error(`Error with ${config.imageProvider} image generation:`, error);
    
    // Try the alternative provider if the primary one fails
    try {
      const alternativeProvider = config.imageProvider === 'openai' ? 'huggingface' : 'openai';
      console.log(`Falling back to ${alternativeProvider} for image generation`);
      
      if (alternativeProvider === 'openai') {
        return await openai.generateImage(prompt);
      } else {
        return await huggingface.generateImage(prompt);
      }
    } catch (fallbackError) {
      console.error('Fallback image generation also failed:', fallbackError);
      return '';
    }
  }
}

// Generate SEO suggestions
export async function generateSeoSuggestions(
  content: string
): Promise<string[]> {
  try {
    if (config.textProvider === 'openai') {
      return await openai.generateSeoSuggestions(content);
    } else {
      return await huggingface.generateSeoSuggestions(content);
    }
  } catch (error) {
    console.error(`Error with ${config.textProvider} SEO suggestion generation:`, error);
    
    // Provide fallback keywords if both providers fail
    return [
      'electronic music',
      'techno events',
      'house music',
      'music production',
      'EDM festivals'
    ];
  }
}

// Advanced generation that includes both content and SEO suggestions
export async function generateFullContent(
  prompt: string,
  includeImage: boolean = false
): Promise<{
  content: string;
  imageUrl?: string;
  seoSuggestions: string[];
}> {
  const content = await generateContent(prompt);
  const seoSuggestions = await generateSeoSuggestions(content);
  
  let imageUrl;
  if (includeImage) {
    imageUrl = await generateImage(prompt);
  }
  
  return {
    content,
    imageUrl,
    seoSuggestions
  };
}
