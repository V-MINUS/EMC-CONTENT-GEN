import { NextRequest, NextResponse } from 'next/server';
import { createAIServices, TextGenerationOptions, ImageGenerationOptions, SEOOptions } from '../../lib/ai-services';
import { enhancePrompt, handleApiError } from '../../utils/ai-utils';
import { getSafeServices } from '../../lib/build-bypass';

// Initialize services with build-safe approach
const services = getSafeServices(createAIServices);

// Cache for plagiarism and SEO results to avoid redundant API calls
interface CachedResult {
  value: unknown;
  timestamp: number;
}

const resultsCache = new Map<string, CachedResult>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// Middleware to log all API requests
const logRequest = (method: string, data: Record<string, unknown>) => {
  console.log(`EMC Generator API ${method} request:`, {
    timestamp: new Date().toISOString(),
    data: JSON.stringify(data).substring(0, 100) + '...'
  });
};

export async function POST(request: NextRequest) {
  // Log the incoming request
  logRequest('POST', await request.clone().json().catch(() => ({})));
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
              const seoOptions: SEOOptions = {
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
            const firstParagraphMatch = content.match(/^#\s.*?\n\n(.*?)(\n\n|$)/s);
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
    
    // Return the final enhanced content and results
    return NextResponse.json({
      content,
      ...results
    });
  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json({ 
      error: handleApiError(error) 
    }, { 
      status: 500 
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
    });
  } catch (error) {
    console.error('Content refinement error:', error);
    return NextResponse.json({ 
      error: handleApiError(error) 
    }, { 
      status: 500 
    });
  }
}
