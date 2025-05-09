// Utilities for AI operations

/**
 * Enhance a prompt with category-specific context for the Electronic Music Council
 */
export function enhancePrompt(prompt: string, category: string, platform?: string): string {
  const categoryContexts: Record<string, string> = {
    'social': `As an electronic music content creator for the Electronic Music Council, ${prompt} Ensure the content is engaging and optimized for ${platform || 'social media'}.`,
    'video': `As an electronic music video content specialist for the Electronic Music Council, ${prompt} Make the script dynamic and engaging for the electronic music audience.`,
    'blog': `As a blog writer for the Electronic Music Council, ${prompt} Include relevant electronic music terminology and ensure the content is informative and engaging.`,
    'email': `As an email marketer for the Electronic Music Council, ${prompt} Create compelling email content that drives engagement and conversions.`,
    'seo': `As an SEO specialist for the Electronic Music Council's content, ${prompt} Focus on electronic music keywords and search optimization.`,
    'research': `As an electronic music researcher for the Electronic Music Council, ${prompt} Provide accurate and comprehensive information about the electronic music scene.`,
    'planning': `As a content strategist for the Electronic Music Council, ${prompt} Develop a coherent content plan that aligns with electronic music events and trends.`,
    'advertising': `As an advertising specialist for the Electronic Music Council, ${prompt} Create compelling ad copy that resonates with electronic music fans and drives action.`,
    'event': `As an event marketing specialist for the Electronic Music Council, ${prompt} Develop engaging event promotion content that attracts electronic music enthusiasts.`,
    'product': `As a product description writer for the Electronic Music Council, ${prompt} Create compelling product descriptions that appeal to electronic music fans.`,
  };

  // Return the category-specific context or a default if category not found
  return categoryContexts[category] || 
    `As an electronic music content specialist for the Electronic Music Council, ${prompt}`;
}

/**
 * Handle API errors in a consistent way
 */
export function handleApiError(error: any, fallbackMessage: string = 'An error occurred'): { 
  error: string, 
  status: number 
} {
  console.error('API Error:', error);
  
  // If it's an API response with a structured error
  if (error.response && error.response.data && error.response.data.error) {
    return {
      error: error.response.data.error,
      status: error.response.status || 500
    };
  }
  
  // If it's an Error object with a message
  if (error.message) {
    return {
      error: error.message,
      status: 500
    };
  }
  
  // Default fallback
  return {
    error: fallbackMessage,
    status: 500
  };
}

/**
 * Extract relevant keywords from text for image generation
 */
export function extractImageKeywords(text: string, maxKeywords: number = 5): string {
  // A basic implementation - in a real app, this would use NLP
  const words = text.split(/\s+/).filter(word => 
    word.length > 3 && 
    !['with', 'that', 'this', 'from', 'have', 'what'].includes(word.toLowerCase())
  );
  
  const uniqueWords = [...new Set(words)];
  const selectedWords = uniqueWords.slice(0, maxKeywords);
  
  return selectedWords.join(' ');
}
