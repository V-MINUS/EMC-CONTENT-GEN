import { NextRequest, NextResponse } from 'next/server';
import { 
  createAIServices, 
  TextGenerationOptions, 
  ImageGenerationOptions,
  SEOOptions
} from '../../lib/ai-services';

// Get AI services based on environment configuration
const aiServices = createAIServices();

export async function POST(request: NextRequest) {
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

    // Enhanced prompt with electronic music context depending on category
    let enhancedPrompt = prompt;
    
    // Add category-specific context to the prompt
    if (category === 'social') {
      enhancedPrompt = `As an electronic music content creator for the Electronic Music Council, ${prompt} Ensure the content is engaging and optimized for ${platform || 'social media'}.`;
    } else if (category === 'video') {
      enhancedPrompt = `As an electronic music video content specialist for the Electronic Music Council, ${prompt} Make the script dynamic and engaging for the electronic music audience.`;
    } else if (category === 'blog') {
      enhancedPrompt = `As a blog writer for the Electronic Music Council, ${prompt} Include relevant electronic music terminology and ensure the content is informative and engaging.`;
    } else if (category === 'email') {
      enhancedPrompt = `As an email marketer for the Electronic Music Council, ${prompt} Create compelling email content that drives engagement and conversions.`;
    } else if (category === 'seo') {
      enhancedPrompt = `As an SEO specialist for the Electronic Music Council's content, ${prompt} Focus on electronic music keywords and search optimization.`;
    } else if (category === 'research') {
      enhancedPrompt = `As an electronic music researcher for the Electronic Music Council, ${prompt} Provide accurate and comprehensive information about the electronic music scene.`;
    } else if (category === 'planning') {
      enhancedPrompt = `As a content strategist for the Electronic Music Council, ${prompt} Develop a coherent content plan that aligns with electronic music events and trends.`;
    } else if (category === 'advertising') {
      enhancedPrompt = `As an advertising specialist for the Electronic Music Council, ${prompt} Create compelling ad copy that resonates with electronic music fans and drives action.`;
    } else if (category === 'event') {
      enhancedPrompt = `As an event marketing specialist for the Electronic Music Council, ${prompt} Develop engaging event promotion content that attracts electronic music enthusiasts.`;
    } else if (category === 'product') {
      enhancedPrompt = `As a product description writer for the Electronic Music Council, ${prompt} Create compelling product descriptions that appeal to electronic music fans.`;
    }

    // Text generation options with tone customization
    const textOptions: TextGenerationOptions = {
      tone: tone || 'professional',
      brandVoice: brandVoice || undefined,
      format: format || undefined,
      length: length || 'medium',
      temperature: 0.7,
      ethicalChecks: ethicalCheckEnabled !== false // Default to true
    };

    // Generate content with the configured service and enhanced options
    let content = await aiServices.textGenerator.generateContent(enhancedPrompt, textOptions);

    // Check for plagiarism if requested
    let plagiarismResult = null;
    if (checkPlagiarism) {
      try {
        plagiarismResult = await aiServices.plagiarismDetector.checkPlagiarism(content);
        
        // If plagiarism is detected above threshold, regenerate with more originality
        if (!plagiarismResult.isOriginal && plagiarismResult.similarityScore > 25) {
          // Enhance prompt to request more originality
          enhancedPrompt = `${enhancedPrompt} Make sure the content is 100% original and does not resemble existing content. Be creative and unique.`;
          // Regenerate with higher temperature for more creativity
          textOptions.temperature = 0.9;
          content = await aiServices.textGenerator.generateContent(enhancedPrompt, textOptions);
          // Recheck plagiarism
          plagiarismResult = await aiServices.plagiarismDetector.checkPlagiarism(content);
        }
      } catch (error) {
        console.error('Error checking plagiarism:', error);
        // Continue with the generated content even if plagiarism check fails
      }
    }

    // Optimize for SEO if requested
    let seoResult = null;
    if (optimizeSeo) {
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
        seoResult = await aiServices.seoOptimizer.optimizeContent(content, keywordList, seoOptions);
        
        // Use the optimized content
        content = seoResult.optimizedContent;
      } catch (error) {
        console.error('Error optimizing for SEO:', error);
        // Continue with the original content if SEO optimization fails
      }
    }

    // Generate image if requested
    let imageUrl = '';
    if (includeImage) {
      try {
        // Extract key terms for image generation
        const imagePrompt = `Electronic music ${category} visual inspired by: ${prompt.substring(0, 100)}`;
        
        // Image generation options
        const imageOptions: ImageGenerationOptions = {
          size: '1024x1024',
          style: category === 'social' ? 'vibrant' : 'professional',
          quality: 'hd'
        };
        
        imageUrl = await aiServices.imageGenerator.generateImage(imagePrompt, imageOptions);
      } catch (error) {
        console.error('Error generating image:', error);
        // Continue without an image if generation fails
      }
    }

    // Generate meta tags for SEO if applicable
    let metaTags = null;
    if (category === 'blog' || category === 'seo') {
      try {
        // Extract a title from the content or use the topic
        const titleMatch = content.match(/^#\s(.*?)$/m); // Look for markdown title
        const extractedTitle = titleMatch ? titleMatch[1] : topic || 'Electronic Music Content';
        
        metaTags = await aiServices.seoOptimizer.generateMetaTags(content, extractedTitle);
      } catch (error) {
        console.error('Error generating meta tags:', error);
        // Continue without meta tags if generation fails
      }
    }

    // Generate relevant keywords for all content types
    let suggestedKeywords = [];
    try {
      suggestedKeywords = await aiServices.seoOptimizer.suggestKeywords(
        topic || category, 
        'electronic music'
      );
    } catch (error) {
      console.error('Error suggesting keywords:', error);
      // Continue without suggested keywords if generation fails
    }

    return NextResponse.json({
      content,
      imageUrl: imageUrl || null,
      plagiarismCheck: plagiarismResult,
      seoOptimization: seoResult,
      metaTags,
      suggestedKeywords,
      category,
      platform
    });
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}

// Human-in-the-loop editing endpoint
export async function PUT(request: NextRequest) {
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
    console.error('Error refining content:', error);
    return NextResponse.json(
      { error: 'Failed to refine content' },
      { status: 500 }
    );
  }
}
