// Real OpenAI service implementation
import { 
  AITextGenerator, 
  AIImageGenerator,
  TextGenerationOptions,
  ImageGenerationOptions
} from './ai-services';

// Types for OpenAI API responses
interface OpenAITextResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenAIImageResponse {
  created: number;
  data: {
    url: string;
    revised_prompt?: string;
  }[];
}

/**
 * Real OpenAI service implementation for text and image generation
 * Requires a valid OpenAI API key in environment variables
 */
export class RealOpenAIService implements AITextGenerator, AIImageGenerator {
  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1';
  private textModel: string = 'gpt-4o';
  private imageModel: string = 'dall-e-3';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  /**
   * Generate content using OpenAI's GPT-4o model
   */
  async generateContent(prompt: string, options: TextGenerationOptions): Promise<string> {
    try {
      console.log('Generating content with OpenAI', { prompt: prompt.substring(0, 50) + '...', options });
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.textModel,
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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json() as OpenAITextResponse;
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating content with OpenAI:', error);
      throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Generate SEO suggestions based on content
   */
  async generateSeoSuggestions(content: string): Promise<string[]> {
    try {
      console.log('Generating SEO suggestions with OpenAI');
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.textModel,
          messages: [
            {
              role: 'system',
              content: 'You are an SEO expert specializing in electronic music content. Generate 5-8 relevant keywords for the content. Return ONLY the keywords as a comma-separated list with no additional text or formatting.'
            },
            {
              role: 'user',
              content: `Generate SEO keywords for this electronic music content:\n\n${content.substring(0, 2000)}`
            }
          ],
          temperature: 0.3,
          max_tokens: 200
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json() as OpenAITextResponse;
      
      // Parse the comma-separated response
      const keywords = data.choices[0].message.content
        .split(',')
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0);
      
      return keywords;
    } catch (error) {
      console.error('Error generating SEO suggestions with OpenAI:', error);
      
      // Fallback to electronic music keywords
      return [
        'electronic music production',
        'EDM events',
        'house music producers',
        'techno scene',
        'music production tips'
      ];
    }
  }
  
  /**
   * Generate images using DALL-E 3
   */
  async generateImage(prompt: string, options: ImageGenerationOptions): Promise<string> {
    try {
      console.log('Generating image with OpenAI DALL-E', { prompt: prompt.substring(0, 50) + '...', options });
      
      const response = await fetch(`${this.baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.imageModel,
          prompt: `Electronic music themed image: ${prompt}`,
          n: 1,
          size: options.size || '1024x1024',
          quality: options.quality || 'standard',
          style: options.style || 'vivid'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json() as OpenAIImageResponse;
      return data.data[0].url;
    } catch (error) {
      console.error('Error generating image with OpenAI:', error);
      
      // Fallback to placeholder image
      return 'https://picsum.photos/seed/electronic/800/450';
    }
  }
  
  /**
   * Build the system prompt based on options
   */
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
}
