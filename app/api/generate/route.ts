import { NextRequest, NextResponse } from 'next/server';
import { 
  createAIServices, 
  TextGenerationOptions, 
  ImageGenerationOptions,
  SEOOptions
} from '../../lib/ai-services';
import { enhancePrompt, handleApiError } from '../../utils/ai-utils';

// Always use real AI services
const aiServices = createAIServices();

console.log('Using real AI services with API keys');

// Log API key presence for debugging
console.log(`OpenAI API key present: ${!!process.env.OPENAI_API_KEY}`);
console.log(`DeepSeek API key present: ${!!process.env.DEEPSEEK_API_KEY}`);

// Cache for plagiarism and SEO results to avoid redundant API calls
// In a production app, this would use Redis or a similar solution
const resultsCache = new Map<string, any>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// Middleware to log all API requests
const logRequest = (method: string, data: any) => {
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

    // Initial content generation is required before other operations
    let content = await aiServices.textGenerator.generateContent(enhancedPrompt, textOptions);
    
    // Generate a cache key for this content
    const contentHash = Buffer.from(content.substring(0, 100)).toString('base64');
    
    // Prepare parallel promises for additional operations
    const operations: Promise<any>[] = [];
    const results: Record<string, any> = {};
    
    // 1. Plagiarism check
    if (checkPlagiarism) {
      // Check if we have a cached result first
      const cachedPlagiarism = resultsCache.get(`plagiarism:${contentHash}`);
      
      if (cachedPlagiarism) {
        results.plagiarismCheck = cachedPlagiarism;
      } else {
        operations.push(
          aiServices.plagiarismDetector.checkPlagiarism(content)
            .then(plagiarismResult => {
              results.plagiarismCheck = plagiarismResult;
              
              // Cache the result
              resultsCache.set(`plagiarism:${contentHash}`, plagiarismResult);
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
                return aiServices.plagiarismDetector.checkPlagiarism(content);
              }
              return null;
            })
            .then(newPlagiarismResult => {
              if (newPlagiarismResult) {
                results.plagiarismCheck = newPlagiarismResult;
                
                // Update cache with new result
                resultsCache.set(`plagiarism:${contentHash}`, newPlagiarismResult);
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
      const cachedSeo = resultsCache.get(`seo:${contentHash}`);
      
      if (cachedSeo) {
        results.seoOptimization = cachedSeo;
      } else {
        operations.push(
          (async () => {
            try {
              // Parse keywords from the request or extract from content
              const keywordList = keywords 
                ? (typeof keywords === 'string' ? keywords.split(',') : keywords) 
                : await aiServices.seoOptimizer.suggestKeywords(topic || category, 'electronic music');
              
              // SEO optimization options
              const seoOptions: SEOOptions = {
                targetReadability: 'high',
                includeHeadings: true,
                targetKeywordDensity: 2.0 // percentage
              };
              
              // Optimize the content
              const seoResult = await aiServices.seoOptimizer.optimizeContent(content, keywordList, seoOptions);
              
              // Use the optimized content
              if (seoResult && seoResult.optimizedContent) {
                content = seoResult.optimizedContent;
              }
              
              results.seoOptimization = seoResult;
              
              // Cache the result
              resultsCache.set(`seo:${contentHash}`, seoResult);
              setTimeout(() => resultsCache.delete(`seo:${contentHash}`), CACHE_TTL);
              
              // Generate meta tags if applicable
              if (category === 'blog' || category === 'seo') {
                // Extract a title from the content or use the topic
                const titleMatch = content.match(/^#\s(.*?)$/m); // Look for markdown title
                const extractedTitle = titleMatch ? titleMatch[1] : topic || 'Electronic Music Content';
                
                const metaTags = await aiServices.seoOptimizer.generateMetaTags(content, extractedTitle);
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
            
            const imageUrl = await aiServices.imageGenerator.generateImage(imagePrompt, imageOptions);
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
          const suggestedKeywords = await aiServices.seoOptimizer.suggestKeywords(
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
  return aiServices.textGenerator.generateContent(originalityPrompt, regenerateOptions);
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

    const refinedContent = await aiServices.textGenerator.generateContent(refinementPrompt, textOptions);

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
