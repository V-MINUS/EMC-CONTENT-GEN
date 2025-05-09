// DeepSeek AI service implementation - free alternative to OpenAI
import { 
  AITextGenerator, 
  TextGenerationOptions 
} from './ai-services';

// Types for DeepSeek API responses
interface DeepSeekTextResponse {
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

/**
 * DeepSeek service implementation for text generation
 * Using the free DeepSeek Coder model as a fallback option
 */
export class DeepSeekService implements AITextGenerator {
  private apiKey: string | null;
  private baseUrl: string = 'https://api.deepseek.com/v1';
  private model: string = 'deepseek-chat';
  
  constructor(apiKey: string | null = null) {
    this.apiKey = apiKey;
  }
  
  /**
   * Generate content using DeepSeek models
   */
  async generateContent(prompt: string, options: TextGenerationOptions): Promise<string> {
    try {
      console.log('Generating content with DeepSeek', { prompt: prompt.substring(0, 50) + '...', options });
      
      // For compatibility with DeepSeek API
      const actualPrompt = this.buildSystemPrompt(options) + "\n\n" + prompt;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Add API key if available
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: actualPrompt
            }
          ],
          temperature: options.temperature || 0.7,
          max_tokens: this.getMaxTokensByLength(options.length)
        })
      });
      
      if (!response.ok) {
        let errorMessage = `DeepSeek API error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = `DeepSeek API error: ${errorData.error?.message || errorMessage}`;
        } catch (e) {
          // If we can't parse the error as JSON, just use the status
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json() as DeepSeekTextResponse;
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating content with DeepSeek:', error);
      throw new Error(`Failed to generate content with DeepSeek: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Generate SEO suggestions (simpler implementation that focuses on keywords)
   */
  async generateSeoSuggestions(content: string): Promise<string[]> {
    try {
      console.log('Generating SEO suggestions with DeepSeek');
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: `You are an SEO expert. Extract 5-8 relevant keywords from this electronic music content. Return ONLY the keywords as a comma-separated list:\n\n${content.substring(0, 1500)}`
            }
          ],
          temperature: 0.3,
          max_tokens: 100
        })
      });
      
      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json() as DeepSeekTextResponse;
      
      // Parse the comma-separated response
      const keywords = data.choices[0].message.content
        .split(',')
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0);
      
      return keywords;
    } catch (error) {
      console.error('Error generating SEO suggestions with DeepSeek:', error);
      
      // Fallback to electronic music keywords
      return [
        'electronic music',
        'EDM',
        'music production',
        'electronic beats',
        'synthesizers'
      ];
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
      systemPrompt += ` Keep the content ${options.length} length.`;
    }
    
    if (options.ethicalChecks) {
      systemPrompt += ` Ensure the content is factual, ethical, and avoids hallucinations or misleading claims. Do not generate clickbait.`;
    }
    
    return systemPrompt;
  }
  
  /**
   * Convert length settings to token counts
   */
  private getMaxTokensByLength(length: string | undefined): number {
    switch (length) {
      case 'short': return 400;
      case 'medium': return 800;
      case 'long': return 1500;
      default: return 800;
    }
  }
}
