// Multi-provider AI service manager with automatic fallback
import { 
  AITextGenerator, 
  AIImageGenerator,
  PlagiarismDetector,
  SEOOptimizer,
  TextGenerationOptions,
  ImageGenerationOptions,
  SEOOptions,
  PlagiarismResult
} from './ai-services';
import { RealOpenAIService } from './openai-service';
import { DeepSeekService } from './deepseek-service';

// Map of error types to provider status
interface ProviderStatus {
  lastError?: string;
  isQuotaExceeded: boolean;
  lastFailedTime?: number;
  failureCount: number;
}

/**
 * Multi-provider service that automatically falls back between providers
 * in case of quota limitations or errors
 */
export class MultiProviderService implements AITextGenerator, AIImageGenerator {
  private openAiService: RealOpenAIService;
  private deepSeekService: DeepSeekService;
  private seoService: SEOOptimizer;
  
  // Provider status tracking
  private providerStatus: Record<string, ProviderStatus> = {
    openai: { isQuotaExceeded: false, failureCount: 0 },
    deepseek: { isQuotaExceeded: false, failureCount: 0 }
  };
  
  constructor(
    openAiService: RealOpenAIService,
    deepSeekService: DeepSeekService,
    seoService: SEOOptimizer
  ) {
    this.openAiService = openAiService;
    this.deepSeekService = deepSeekService;
    this.seoService = seoService;
    
    // Reset quota exceeded status every hour
    setInterval(() => this.resetProviderStatus(), 60 * 60 * 1000);
  }
  
  /**
   * Generate content using available providers, with automatic fallback
   */
  async generateContent(prompt: string, options: TextGenerationOptions): Promise<string> {
    console.log('Multi-provider generating content');
    
    // Try OpenAI first if not exceeded quota
    if (!this.providerStatus.openai.isQuotaExceeded) {
      try {
        const result = await this.openAiService.generateContent(prompt, options);
        // Reset failure count on success
        this.providerStatus.openai.failureCount = 0;
        return result;
      } catch (error: any) {
        console.error('OpenAI error:', error);
        this.recordProviderError('openai', error);
        
        // Check if it's a quota error
        if (this.isQuotaError(error)) {
          console.log('OpenAI quota exceeded, falling back to DeepSeek');
          this.providerStatus.openai.isQuotaExceeded = true;
        }
      }
    }
    
    // Try DeepSeek if OpenAI failed or quota exceeded
    if (!this.providerStatus.deepseek.isQuotaExceeded) {
      try {
        console.log('Trying DeepSeek for content generation');
        const result = await this.deepSeekService.generateContent(prompt, options);
        // Reset failure count on success
        this.providerStatus.deepseek.failureCount = 0;
        return result;
      } catch (error: any) {
        console.error('DeepSeek error:', error);
        this.recordProviderError('deepseek', error);
        
        // Check if it's a quota error
        if (this.isQuotaError(error)) {
          console.log('DeepSeek quota exceeded');
          this.providerStatus.deepseek.isQuotaExceeded = true;
        }
      }
    }
    
    // If both providers failed, throw an error
    throw new Error('All AI providers failed. Please try again later or check your API keys.');
  }
  
  /**
   * Generate SEO suggestions using available providers, with automatic fallback
   */
  async generateSeoSuggestions(content: string): Promise<string[]> {
    // Try OpenAI first if not exceeded quota
    if (!this.providerStatus.openai.isQuotaExceeded) {
      try {
        const result = await this.openAiService.generateSeoSuggestions(content);
        // Reset failure count on success
        this.providerStatus.openai.failureCount = 0;
        return result;
      } catch (error: any) {
        console.error('OpenAI SEO error:', error);
        this.recordProviderError('openai', error);
        
        // Check if it's a quota error
        if (this.isQuotaError(error)) {
          this.providerStatus.openai.isQuotaExceeded = true;
        }
      }
    }
    
    // Try DeepSeek if OpenAI failed or quota exceeded
    if (!this.providerStatus.deepseek.isQuotaExceeded) {
      try {
        const result = await this.deepSeekService.generateSeoSuggestions(content);
        // Reset failure count on success
        this.providerStatus.deepseek.failureCount = 0;
        return result;
      } catch (error: any) {
        console.error('DeepSeek SEO error:', error);
        this.recordProviderError('deepseek', error);
        
        // Check if it's a quota error
        if (this.isQuotaError(error)) {
          this.providerStatus.deepseek.isQuotaExceeded = true;
        }
      }
    }
    
    // Use the SEO service directly as a last resort
    try {
      return await this.seoService.suggestKeywords('electronic music', 'music');
    } catch (error) {
      console.error('SEO service error:', error);
      // Return some default keywords if everything fails
      return [
        'electronic music',
        'music production',
        'EDM',
        'electronic',
        'producer'
      ];
    }
  }
  
  /**
   * Generate images using available providers
   * Note: Currently only OpenAI supports image generation in our implementation
   */
  async generateImage(prompt: string, options: ImageGenerationOptions): Promise<string> {
    // Try OpenAI for image generation
    if (!this.providerStatus.openai.isQuotaExceeded) {
      try {
        const result = await this.openAiService.generateImage(prompt, options);
        // Reset failure count on success
        this.providerStatus.openai.failureCount = 0;
        return result;
      } catch (error: any) {
        console.error('OpenAI image error:', error);
        this.recordProviderError('openai', error);
        
        // Check if it's a quota error
        if (this.isQuotaError(error)) {
          this.providerStatus.openai.isQuotaExceeded = true;
        }
      }
    }
    
    // If image generation fails, return a placeholder image
    const placeholderIds = ['614', '615', '616', '617', '618'];
    const randomId = placeholderIds[Math.floor(Math.random() * placeholderIds.length)];
    return `https://picsum.photos/id/${randomId}/800/450`;
  }
  
  /**
   * Reset provider status periodically
   */
  private resetProviderStatus() {
    console.log('Resetting provider status');
    
    // Only reset if it's been more than an hour since the last failure
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    for (const provider of ['openai', 'deepseek']) {
      const status = this.providerStatus[provider];
      
      // Reset only if the last failure was more than an hour ago or no failures
      if (!status.lastFailedTime || status.lastFailedTime < oneHourAgo) {
        this.providerStatus[provider] = {
          isQuotaExceeded: false,
          failureCount: 0
        };
      }
    }
  }
  
  /**
   * Record a provider error
   */
  private recordProviderError(provider: string, error: any) {
    const status = this.providerStatus[provider];
    status.lastError = error.message || 'Unknown error';
    status.lastFailedTime = Date.now();
    status.failureCount++;
    
    // If we've had multiple consecutive failures, consider it quota exceeded
    if (status.failureCount >= 3) {
      status.isQuotaExceeded = true;
    }
  }
  
  /**
   * Check if an error message indicates quota exceeded
   */
  private isQuotaError(error: any): boolean {
    const errorMessage = error.message || '';
    return (
      errorMessage.includes('quota') ||
      errorMessage.includes('rate limit') ||
      errorMessage.includes('exceeded') ||
      errorMessage.includes('429') ||
      errorMessage.includes('billing') ||
      errorMessage.includes('insufficient_quota')
    );
  }
  
  /**
   * Get the current status of all providers
   */
  getProviderStatus(): Record<string, ProviderStatus> {
    return { ...this.providerStatus };
  }
}
