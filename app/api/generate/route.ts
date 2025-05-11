import { NextRequest, NextResponse } from 'next/server';
import { createAIServices, TextGenerationOptions, ImageGenerationOptions, SEOOptions } from '../../lib/ai-services';
import { enhancePrompt, handleApiError } from '../../utils/ai-utils';
import { getSafeServices } from '../../lib/build-bypass';

// Initialize services with build-safe approach
const services = getSafeServices(createAIServices);

// Cache configuration for API requests
const ENABLE_CACHING = true;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// Cache for plagiarism, SEO results, and content to avoid redundant API calls
interface CachedResult<T> {
  value: T;
  timestamp: number;
}

// Caches for different types of data
const requestCache = new Map<string, CachedResult<any>>(); // For full API requests
const resultsCache = new Map<string, CachedResult<any>>(); // For individual results like plagiarism checks

// Helper to check if a cached item is still valid
function isCacheValid<T>(cached: CachedResult<T> | undefined): cached is CachedResult<T> {
  if (!cached) return false;
  const now = Date.now();
  return now - cached.timestamp < CACHE_TTL;
}

// Generate a cache key from request parameters
function generateCacheKey(data: Record<string, any>): string {
  // Only cache based on core content generation parameters
  const { prompt, category, platform, topic, tone, length } = data;
  return JSON.stringify({ prompt, category, platform, topic, tone, length });
}

// Define proper types for the SEO optimization results
interface SEOResult {
  optimizedContent: string;
  seoScore: number;
  keywordDensity: Record<string, number>;
}

// Define the proper types for SEO options
interface ExtendedSEOOptions extends SEOOptions {
  targetLength?: string;
  platform?: string;
  industry?: string;
}

// Middleware to log all API requests
const logRequest = (method: string, data: Record<string, unknown>) => {
  console.log(`EMC Generator API ${method} request:`, {
    timestamp: new Date().toISOString(),
    data: JSON.stringify(data).substring(0, 100) + '...'
  });
};

// Helper function to add CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    { success: true },
    { headers: corsHeaders() }
  );
}

export async function POST(request: NextRequest) {
  // Add CORS headers to all responses
  const headers = corsHeaders();
  
  // Initialize requestData with default empty object
  let requestData: Record<string, any> = {};
  
  try {
    // Clone the request to read its body multiple times
    requestData = await request.clone().json().catch((e) => {
      console.error('Error parsing request JSON:', e);
      return {};
    });
    
    // Log the incoming request (sanitized)
    logRequest('POST', requestData);
    
    // Add debug info about environment
    console.log('EMC API Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      OPENAI_KEY_LENGTH: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
      RUNNING_ON: typeof window === 'undefined' ? 'server' : 'client',
      IS_NETLIFY: process.env.NETLIFY === 'true',
      USE_MOCK_SERVICES: process.env.USE_MOCK_SERVICES
    });
    
    // Safety check to ensure we have a valid request
    if (!requestData || Object.keys(requestData).length === 0) {
      console.error('Empty or invalid request data');
      return NextResponse.json({ error: 'Invalid request data' }, {
        status: 400,
        headers
      });
    }
    
    // Check if result is in cache (only for non-production or if caching is enabled)
    if (ENABLE_CACHING && process.env.NODE_ENV !== 'production') {
      const cacheKey = generateCacheKey(requestData);
      const cachedResult = requestCache.get(cacheKey);
      
      if (isCacheValid(cachedResult)) {
        console.log('Cache hit for request: Using cached result');
        return NextResponse.json(cachedResult.value, {
          headers,
          status: 200
        });
      }
    }
  } catch (outerError) {
    console.error('Outer error in POST handler:', outerError);
    return NextResponse.json({ error: 'Server error processing request' }, {
      status: 500,
      headers
    });
  }
  
  try {
    const { 
      prompt, 
      includeImage, 
      category, 
      platform,
      tone,
      brandVoice,
      format,
      length,
      keywords,
      ethicalCheckEnabled,
      checkPlagiarism,
      optimizeSeo,
      topic
    } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Use the utility function to enhance the prompt based on category
    const enhancedPrompt = enhancePrompt(prompt, category, platform);

    // Text generation options with tone customization
    const textOptions: TextGenerationOptions = {
      tone: tone || 'professional',
      brandVoice: brandVoice || undefined,
      format: format || undefined,
      length: length || 'medium',
      temperature: 0.7,
      ethicalChecks: ethicalCheckEnabled !== false // Default to true
    };

    // Initial content generation is required before other operations
    let content = await services.textGenerator.generateContent(enhancedPrompt, textOptions);
    
    // Generate a cache key for this content
    const contentHash = Buffer.from(content.substring(0, 100)).toString('base64');
    
    // Prepare parallel promises for additional operations
    const operations: Promise<any>[] = [];
    const results: Record<string, any> = {};
    
    // 1. Plagiarism check
    if (checkPlagiarism) {
      // Check if we have a cached result first
      const cachedEntry = resultsCache.get(`plagiarism:${contentHash}`);
      const cachedPlagiarism = cachedEntry?.value;
      
      if (cachedPlagiarism) {
        results.plagiarismCheck = cachedPlagiarism;
      } else {
        operations.push(
          services.plagiarismDetector.checkPlagiarism(content)
            .then(plagiarismResult => {
              results.plagiarismCheck = plagiarismResult;
              
              // Cache the result
              resultsCache.set(`plagiarism:${contentHash}`, {
                value: plagiarismResult,
                timestamp: Date.now()
              });
              setTimeout(() => resultsCache.delete(`plagiarism:${contentHash}`), CACHE_TTL);
              
              // If content is not original enough, regenerate with higher creativity
              if (!plagiarismResult.isOriginal && plagiarismResult.similarityScore > 25) {
                // Only regenerate if needed
                return regenerateContent(enhancedPrompt, textOptions);
              }
              return null;
            })
            .then(regeneratedContent => {
              if (regeneratedContent) {
                // Update content with regenerated version
                content = regeneratedContent;
                
                // Recheck plagiarism for regenerated content
                return services.plagiarismDetector.checkPlagiarism(content);
              }
              return null;
            })
            .then(recheckResult => {
              if (recheckResult) {
                results.plagiarismCheck = recheckResult;
                
                // Update the cache with the new result
                resultsCache.set(`plagiarism:${contentHash}`, {
                  value: recheckResult,
                  timestamp: Date.now()
                });
              }
            })
            .catch(error => {
              console.error('Plagiarism check error:', error);
              results.plagiarismError = handleApiError(error);
            })
        );
      }
    }
    
    // 2. SEO optimization
    if (optimizeSeo) {
      operations.push(
        (async () => {
          try {
            // Check if we have a cached result first
            const cachedEntry = resultsCache.get(`seo:${contentHash}`);
            const cachedSeo = cachedEntry?.value;
            
            if (cachedSeo) {
              results.seoOptimization = cachedSeo;
              
              // Use the cached optimized content if available
              if (cachedSeo.optimizedContent) {
                content = cachedSeo.optimizedContent;
              }
            } else {
              // Parse keywords from the request or extract from content
              const keywordList = keywords 
                ? (typeof keywords === 'string' ? keywords.split(',') : keywords) 
                : await services.seoOptimizer.suggestKeywords(topic || category, 'electronic music');
              
              // SEO optimization options
              const seoOptions: ExtendedSEOOptions = {
                targetLength: length || 'medium',
                platform: platform || 'blog'
              };
              
              // Optimize the content
              const seoResult = await services.seoOptimizer.optimizeContent(content, keywordList, seoOptions);
              
              // Use the optimized content
              if (seoResult && seoResult.optimizedContent) {
                content = seoResult.optimizedContent;
              }
              
              // Cache the result
              resultsCache.set(`seo:${contentHash}`, {
                value: seoResult,
                timestamp: Date.now()
              });
              setTimeout(() => resultsCache.delete(`seo:${contentHash}`), CACHE_TTL);
              
              results.seoOptimization = seoResult;
              
              // Also generate meta tags for the content
              const titleMatch = content.match(/^#\s(.*?)$/m); // Look for markdown title
              const extractedTitle = titleMatch ? titleMatch[1] : topic || 'Electronic Music Content';
              
              const metaTags = await services.seoOptimizer.generateMetaTags(content, extractedTitle);
              results.metaTags = metaTags;
            }
          } catch (error) {
            console.error('SEO optimization error:', error);
            results.seoError = handleApiError(error);
          }
        })()
      );
    }
    
    // 3. Image generation
    if (includeImage) {
      operations.push(
        (async () => {
          try {
            // Extract a good image prompt from the content
            // Regular expression to extract first paragraph for image prompt, avoiding 's' flag
            const firstParagraphMatch = content.match(/^#\s.*?\n\n([\s\S]*?)(\n\n|$)/);
            const imagePrompt = firstParagraphMatch 
              ? `electronic music visual: ${firstParagraphMatch[1].substring(0, 100)}`
              : `electronic music visual related to: ${prompt}`;
            
            // Image generation options
            const imageOptions: ImageGenerationOptions = {
              size: '512x512',
              style: 'vivid',
              quality: 'hd'
            };
            
            const imageUrl = await services.imageGenerator.generateImage(imagePrompt, imageOptions);
            results.imageUrl = imageUrl;
          } catch (error) {
            console.error('Image generation error:', error);
            results.imageError = handleApiError(error);
          }
        })()
      );
    }
    
    // 4. Keyword suggestions
    operations.push(
      (async () => {
        try {
          const suggestedKeywords = await services.seoOptimizer.suggestKeywords(
            topic || category, 
            'electronic music'
          );
          results.suggestedKeywords = suggestedKeywords;
        } catch (error) {
          console.error('Keyword suggestion error:', error);
          results.keywordError = handleApiError(error);
        }
      })()
    );
    
    // Wait for all operations to complete
    await Promise.all(operations);
    
    // Prepare the response data
    const responseData = {
      content,
      ...results
    };
    
    // Cache the successful response if caching is enabled
    if (ENABLE_CACHING) {
      const cacheKey = generateCacheKey(requestData); 
      requestCache.set(cacheKey, {
        value: responseData,
        timestamp: Date.now()
      });
      console.log('Saved result to cache for future requests');
    }
    
    // Return the final enhanced content and results
    return NextResponse.json(responseData, {
      headers: corsHeaders(),
      status: 200
    });
  } catch (error) {
    console.error('Content generation error:', error);
    
    // Log detailed error information for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    return NextResponse.json({ 
      error: handleApiError(error),
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      timestamp: new Date().toISOString(),
      // Include API key status (true/false only, not the actual key)
      api_status: {
        openai: !!process.env.OPENAI_API_KEY,
        deepseek: !!process.env.DEEPSEEK_API_KEY
      }
    }, { 
      status: 500,
      headers: corsHeaders()
    });
  }
}

// Helper function to regenerate content with more originality
async function regenerateContent(enhancedPrompt: string, textOptions: TextGenerationOptions): Promise<string> {
  // Enhance the prompt to request more originality
  const originalityPrompt = `
    ${enhancedPrompt}
    
    IMPORTANT: Generate COMPLETELY ORIGINAL content. Avoid common phrases and formats.
    Be creative, unique, and innovative in your language and structure.
  `;
  
  // Adjust options for more creative output
  const regenerateOptions = {
    ...textOptions,
    temperature: 0.9, // Higher temperature for more randomness
    ethicalChecks: true
  };
  
  // Generate more original content
  return services.textGenerator.generateContent(originalityPrompt, regenerateOptions);
}

// Human-in-the-loop editing endpoint
export async function PUT(request: NextRequest) {
  // Add CORS headers to all responses
  const headers = corsHeaders();
  
  // Log the incoming request
  logRequest('PUT', await request.clone().json().catch(() => ({})));
  
  try {
    const { 
      content, 
      refinement, 
      instructions,
      tone
    } = await request.json();
    
    if (!content) {
      return NextResponse.json(
        { error: 'Original content is required' },
        { status: 400 }
      );
    }
    
    if (!refinement && !instructions) {
      return NextResponse.json(
        { error: 'Either refinement or instructions are required' },
        { status: 400 }
      );
    }
    
    // Construct a prompt for the refinement
    const refinementPrompt = `
      ORIGINAL CONTENT:
      ${content}
      
      ${refinement ? `USER REFINEMENT:
      ${refinement}` : ''}
      
      ${instructions ? `INSTRUCTIONS:
      ${instructions}` : ''}
      
      Please refine the original content based on the user's input while maintaining the overall message and quality.
      Use a ${tone || 'professional'} tone.
    `;
    
    // Options for content refinement
    const textOptions: TextGenerationOptions = {
      tone: tone || 'professional',
      length: 'medium',
      temperature: 0.7,
      ethicalChecks: true
    };

    const refinedContent = await services.textGenerator.generateContent(refinementPrompt, textOptions);

    return NextResponse.json({
      originalContent: content,
      refinedContent,
      refinement,
      instructions
    }, {
      headers: corsHeaders(),
      status: 200
    });
  } catch (error: any) {
    // Log detailed error information for debugging
    console.error('Error generating content:', error?.message || error);
    if (error?.stack) {
      console.error('Error stack:', error.stack);
    }
    
    // Prepare a safe error message for the client
    const errorMessage = handleApiError(error);
    
    // Return a properly formatted error response with CORS headers
    return NextResponse.json({ 
      error: errorMessage,
      success: false,
      message: 'Content generation failed, please try again',
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers // Using the pre-defined headers with CORS support
    });
  }
}

// ... (rest of the code remains the same)
