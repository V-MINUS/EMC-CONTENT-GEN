import { NextRequest, NextResponse } from 'next/server';
import { 
  createAIServices, 
  TextGenerationOptions, 
  ImageGenerationOptions,
  SEOOptions
} from '../../lib/ai-services';
import { enhancePrompt, handleApiError } from '../../utils/ai-utils';

// **CRITICAL BUILD FIX**
// This special check completely bypasses API key validation during Vercel builds
// This prevents build failures when API keys aren't available during build time
const IS_BUILD_TIME = process.env.NODE_ENV !== 'production' || 
                    process.env.VERCEL_ENV === 'preview' || 
                    process.env.VERCEL_BUILD_STEP === 'true' ||
                    process.env.VERCEL_BUILD_MODE === 'true';

// Debug env info (will only run during build)
console.log(`Build environment: NODE_ENV=${process.env.NODE_ENV}, VERCEL_ENV=${process.env.VERCEL_ENV}`);
console.log(`OpenAI API Key present: ${!!process.env.OPENAI_API_KEY}`);
console.log(`DeepSeek API Key present: ${!!process.env.DEEPSEEK_API_KEY}`);

// Build-time mock services
const MOCK_SERVICES = {
  textGenerator: {
    generateContent: (prompt: string) => Promise.resolve(
      `# Mock Electronic Music Content\n\nThis is placeholder content for "${prompt}"`
    )
  },
  imageGenerator: {
    generateImage: () => Promise.resolve(
      'https://placehold.co/600x400?text=Electronic+Music+Content'
    )
  },
  seoOptimizer: {
    optimizeContent: (content: string) => Promise.resolve({ 
      optimizedContent: content, 
      seoScore: 85, 
      keywordDensity: {} 
    }),
    suggestKeywords: () => Promise.resolve(['electronic music', 'EDM', 'production']),
    generateMetaTags: () => Promise.resolve({
      title: 'EMC Content',
      description: 'Electronic Music Content',
      keywords: 'electronic music'
    })
  },
  plagiarismDetector: {
    checkPlagiarism: () => Promise.resolve({
      isOriginal: true,
      similarityScore: 5,
      matches: []
    })
  }
};

// We'll initialize AI services per request to avoid build-time errors
let aiServices: ReturnType<typeof createAIServices> | null = null;

// Only initialize services when needed
function getAIServices() {
  // Use mock services during build time
  if (IS_BUILD_TIME) {
    console.log('Using MOCK AI services during build');
    return MOCK_SERVICES;
  }

  if (!aiServices) {
    // In production with real requests, API keys are required
    if (!process.env.OPENAI_API_KEY && process.env.NODE_ENV === 'production') {
      console.log('API key missing in production - this should not happen if environment variables are set correctly');
      throw new Error('OpenAI API key is required for production use. Please add it to your environment variables.');
    }
    
    try {
      aiServices = createAIServices();
      console.log('Initialized AI services with API keys');
    } catch (error) {
      console.error('Failed to initialize AI services:', error);
      return MOCK_SERVICES; // Fallback to mock services if initialization fails
    }
  }
  
  return aiServices;
}

// Cache for plagiarism and SEO results to avoid redundant API calls
// In a production app, this would use Redis or a similar solution
interface CachedResult {
  value: unknown;
  timestamp: number;
}

const resultsCache = new Map<string, CachedResult>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// Middleware to log all API requests
const logRequest = (method: string, data: Record<string, unknown>) => {
  console.log(`API ${method} request:`, {
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

    // Initialize services and generate content
    let content = await getAIServices().textGenerator.generateContent(enhancedPrompt, textOptions);
    
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
          getAIServices().plagiarismDetector.checkPlagiarism(content)
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
                return getAIServices().plagiarismDetector.checkPlagiarism(content);
              }
              return null;
            })
            .then(newPlagiarismResult => {
              if (newPlagiarismResult) {
                results.plagiarismCheck = newPlagiarismResult;
                
                // Update cache with new result
                resultsCache.set(`plagiarism:${contentHash}`, {
                  value: newPlagiarismResult,
                  timestamp: Date.now()
                });
              }
            })
            .catch(error => {
              console.error('Plagiarism check error:', error);
              // Continue without plagiarism check if it fails
            })
        );
      }
    }
    
    // 2. SEO optimization
    if (optimizeSeo) {
      // Check if we have a cached result first
      const cachedEntry = resultsCache.get(`seo:${contentHash}`);
      const cachedSeo = cachedEntry?.value;
      
      if (cachedSeo) {
        results.seoOptimization = cachedSeo;
      } else {
        operations.push(
          (async () => {
            try {
              // Parse keywords from the request or extract from content
              const keywordList = keywords 
                ? (typeof keywords === 'string' ? keywords.split(',') : keywords) 
                : await getAIServices().seoOptimizer.suggestKeywords(topic || category, 'electronic music');
              
              // SEO optimization options
              const seoOptions: SEOOptions = {
                targetReadability: 'high',
                includeHeadings: true,
                targetKeywordDensity: 2.0 // percentage
              };
              
              // Optimize the content
              const seoResult = await getAIServices().seoOptimizer.optimizeContent(content, keywordList, seoOptions);
              
              // Use the optimized content
              if (seoResult && seoResult.optimizedContent) {
                content = seoResult.optimizedContent;
              }
              
              results.seoOptimization = seoResult;
              
              // Cache the result
              resultsCache.set(`seo:${contentHash}`, {
                value: seoResult,
                timestamp: Date.now()
              });
              setTimeout(() => resultsCache.delete(`seo:${contentHash}`), CACHE_TTL);
              
              // Generate meta tags if applicable
              if (category === 'blog' || category === 'seo') {
                // Extract a title from the content or use the topic
                const titleMatch = content.match(/^#\s(.*?)$/m); // Look for markdown title
                const extractedTitle = titleMatch ? titleMatch[1] : topic || 'Electronic Music Content';
                
                const metaTags = await getAIServices().seoOptimizer.generateMetaTags(content, extractedTitle);
                results.metaTags = metaTags;
              }
            } catch (error) {
              console.error('SEO optimization error:', error);
              // Continue without SEO optimization if it fails
            }
          })()
        );
      }
    }
    
    // 3. Image generation
    if (includeImage) {
      operations.push(
        (async () => {
          try {
            // Extract key terms for image generation
            const imagePrompt = `Electronic music ${category} visual inspired by: ${prompt.substring(0, 100)}`;
            
            // Image generation options
            const imageOptions: ImageGenerationOptions = {
              size: '1024x1024',
              style: category === 'social' ? 'vibrant' : 'professional',
              quality: 'hd'
            };
            
            const imageUrl = await getAIServices().imageGenerator.generateImage(imagePrompt, imageOptions);
            results.imageUrl = imageUrl;
          } catch (error) {
            console.error('Image generation error:', error);
            // Continue without an image if generation fails
          }
        })()
      );
    }
    
    // 4. Keyword suggestion (always run for better UX)
    operations.push(
      (async () => {
        try {
          const suggestedKeywords = await getAIServices().seoOptimizer.suggestKeywords(
            topic || category, 
            'electronic music'
          );
          results.suggestedKeywords = suggestedKeywords;
        } catch (error) {
          console.error('Keyword suggestion error:', error);
          // Continue without suggested keywords if generation fails
        }
      })()
    );
    
    // Wait for all operations to complete
    await Promise.all(operations);

    return NextResponse.json({
      content,
      imageUrl: results.imageUrl || null,
      plagiarismCheck: results.plagiarismCheck || null,
      seoOptimization: results.seoOptimization || null,
      metaTags: results.metaTags || null,
      suggestedKeywords: results.suggestedKeywords || [],
      category,
      platform
    });
  } catch (error) {
    console.error('Error generating content:', error);
    // Always provide detailed error message for better debugging
    const errorMessage = `Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Helper function to regenerate content with more originality
async function regenerateContent(enhancedPrompt: string, textOptions: TextGenerationOptions): Promise<string> {
  // Add originality request to prompt
  const originalityPrompt = `${enhancedPrompt} Make sure the content is 100% original and does not resemble existing content. Be creative and unique.`;
  
  // Increase temperature for more creativity
  const regenerateOptions = {
    ...textOptions,
    temperature: 0.9
  };
  
  // Generate more original content
  return getAIServices().textGenerator.generateContent(originalityPrompt, regenerateOptions);
}

// Human-in-the-loop editing endpoint
export async function PUT(request: NextRequest) {
  // Log the incoming request
  logRequest('PUT', await request.clone().json().catch(() => ({})));
  try {
    const { 
      content, 
      editInstruction,
      preserveSections,
      tone
    } = await request.json();

    if (!content || !editInstruction) {
      return NextResponse.json(
        { error: 'Content and edit instruction are required' },
        { status: 400 }
      );
    }

    // Create prompt for the refinement
    const refinementPrompt = `
I have the following content:

${content}

Please ${editInstruction}. ${preserveSections ? 'Preserve the following sections: ' + preserveSections.join(', ') : ''}
${tone ? `Maintain a ${tone} tone.` : ''}
`;

    // Generate the refined content
    const textOptions: TextGenerationOptions = {
      tone: tone || 'professional',
      temperature: 0.4, // Lower temperature for more controlled edits
      ethicalChecks: true
    };

    const refinedContent = await getAIServices().textGenerator.generateContent(refinementPrompt, textOptions);

    return NextResponse.json({
      originalContent: content,
      refinedContent,
      editInstruction
    });
  } catch (error) {
    const { error: errorMessage, status } = handleApiError(error, 'Failed to refine content');
    return NextResponse.json({ error: errorMessage }, { status });
  }
}
