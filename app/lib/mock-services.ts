// Mock service implementations for development
// This allows us to test the app without real API keys

import {
  AITextGenerator,
  AIImageGenerator,
  PlagiarismDetector,
  SEOOptimizer,
  TextGenerationOptions,
  ImageGenerationOptions,
  SEOOptions,
  PlagiarismResult,
  SEOResult,
  MetaTags
} from './ai-services';

// Mock implementation for OpenAI text generation
export class MockTextGenerator implements AITextGenerator {
  async generateContent(prompt: string, options: TextGenerationOptions): Promise<string> {
    console.log('Mock text generation with options:', { prompt, options });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate mock content based on the prompt
    const category = prompt.includes('social media') ? 'social' : 
                    prompt.includes('video') ? 'video' :
                    prompt.includes('blog') ? 'blog' : 'general';
    
    const length = options.length || 'medium';
    const tone = options.tone || 'professional';
    
    // Sample content based on category and length
    return generateMockContent(category, length, tone, prompt);
  }

  async generateSeoSuggestions(content: string): Promise<string[]> {
    console.log('Mock SEO suggestion generation:', { contentLength: content.length });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock keywords based on content
    return [
      'electronic music production',
      'music production tips',
      'electronic dance music',
      'EDM tutorials',
      'music production software',
      'electronic music events',
      'synthesizer techniques',
      'music promotion strategies'
    ];
  }
}

// Mock implementation for OpenAI image generation
export class MockImageGenerator implements AIImageGenerator {
  async generateImage(prompt: string, options: ImageGenerationOptions): Promise<string> {
    console.log('Mock image generation with options:', { prompt, options });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a random placeholder image
    const imageIds = [
      '614', '615', '616', '617', '618', 
      '619', '620', '621', '622', '623'
    ];
    
    const randomId = imageIds[Math.floor(Math.random() * imageIds.length)];
    return `https://picsum.photos/id/${randomId}/800/450`;
  }
}

// Mock implementation for plagiarism detection
export class MockPlagiarismDetector implements PlagiarismDetector {
  async checkPlagiarism(content: string): Promise<PlagiarismResult> {
    console.log('Mock plagiarism check:', { contentLength: content.length });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Generate a random plagiarism score between 0 and 15%
    const similarityScore = Math.random() * 15;
    const isOriginal = similarityScore < 10;
    
    // Sample similar sources (only shown if similarity is above threshold)
    const similarSources = similarityScore > 5 ? [
      {
        url: 'https://example.com/electronic-music-article',
        title: 'Guide to Electronic Music Production',
        similarityPercentage: similarityScore,
        matchedText: 'Electronic music production requires a good understanding of synthesis and sound design.'
      }
    ] : [];
    
    return {
      isOriginal,
      similarityScore,
      similarSources
    };
  }
}

// Mock implementation for SEO optimization
export class MockSEOOptimizer implements SEOOptimizer {
  async optimizeContent(content: string, keywords: string[], options: SEOOptions): Promise<SEOResult> {
    console.log('Mock SEO optimization:', { 
      contentLength: content.length, 
      keywords, 
      options 
    });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Generate random readability score
    const readabilityScore = Math.floor(Math.random() * 25) + 70;
    
    // Generate keyword density map
    const keywordDensity: Record<string, number> = {};
    keywords.forEach(keyword => {
      keywordDensity[keyword] = (Math.random() * 3) + 0.5;
    });
    
    // Sample suggestions
    const suggestions = [
      'Add more heading structures for better readability',
      'Include at least one internal link',
      'Consider adding a bullet list for key points',
      'Your content has good keyword density, but consider adding more variants'
    ];
    
    // Slightly enhance the content
    const optimizedContent = content.replace(
      /electronic music/gi, 
      '<strong>electronic music</strong>'
    ).replace(
      /production/gi,
      'production'
    );
    
    return {
      optimizedContent,
      readabilityScore,
      keywordDensity,
      suggestions,
      wordCount: content.split(/\s+/).length
    };
  }

  async generateMetaTags(content: string, title: string): Promise<MetaTags> {
    console.log('Mock meta tag generation:', { 
      contentLength: content.length,
      title
    });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Extract part of the content for description
    const description = content.substring(0, 150).trim() + '...';
    
    return {
      title: title,
      description,
      keywords: 'electronic music, production, music production, EDM, electronic, music'
    };
  }

  async suggestKeywords(topic: string, industry: string): Promise<string[]> {
    console.log('Mock keyword suggestion:', { topic, industry });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Default electronic music keywords
    const defaultKeywords = [
      'electronic music production',
      'EDM production',
      'music production software',
      'synthesizer tutorials',
      'electronic music events',
      'music mixing techniques',
      'mastering electronic music',
      'electronic music promotion'
    ];
    
    // Add topic-specific keywords if provided
    if (topic) {
      return [
        ...defaultKeywords,
        `${topic} guide`,
        `best ${topic} techniques`,
        `${topic} electronic music`,
        `how to ${topic.toLowerCase()}`
      ].slice(0, 10);
    }
    
    return defaultKeywords;
  }
}

// Helper function to generate mock content
function generateMockContent(category: string, length: string, tone: string, prompt: string): string {
  // Length multiplication factor
  const lengthFactor = length === 'short' ? 1 : length === 'medium' ? 2 : 3;
  
  // Base content by category
  let baseContent = '';
  
  switch (category) {
    case 'social':
      baseContent = `🎵 **Electronic Music at its Finest!**\n\nDiscover the latest trends in electronic music today. Our community is growing with talented producers and exciting events.\n\nStay tuned for more updates and don't forget to follow us for the latest electronic music news! #ElectronicMusic #MusicProduction`;
      break;
    case 'video':
      baseContent = `# Video Script: Electronic Music Production\n\n**Intro (0:00-0:30)**\nHello and welcome to another tutorial on electronic music production! Today we're diving into synthesis techniques that will elevate your sound.\n\n**Main Section (0:30-3:00)**\nLet's explore how to create that perfect bass sound using subtractive synthesis. First, start with a saw wave oscillator, then apply a low-pass filter...\n\n**Conclusion (3:00-3:30)**\nThat's it for today's tutorial! Remember to experiment with these techniques and make them your own. Don't forget to like and subscribe for more content!`;
      break;
    case 'blog':
      baseContent = `# The Evolution of Electronic Music\n\nElectronic music has come a long way since its early days. From the pioneering work of artists like Kraftwerk to the modern EDM scene, the journey has been remarkable.\n\n## The Early Days\n\nThe 1970s saw the emergence of electronic music as a distinct genre. Artists began experimenting with synthesizers and drum machines to create entirely new sounds.\n\n## The Modern Scene\n\nToday, electronic music encompasses countless sub-genres, from house and techno to dubstep and trap. Production technology has advanced dramatically, allowing creators to push boundaries further than ever before.\n\n## Looking Forward\n\nAs we look to the future, AI and machine learning are beginning to influence electronic music production. These technologies offer new possibilities for sound design and composition that were unimaginable just a decade ago.`;
      break;
    default:
      baseContent = `# Electronic Music Content\n\nElectronic music continues to evolve and inspire audiences worldwide. From production techniques to live performances, the electronic music scene is constantly innovating.\n\nProducers are exploring new sounds and pushing the boundaries of what's possible with technology. The community remains vibrant and supportive, with collaboration being a key aspect of the creative process.\n\nStay connected with the Electronic Music Council for the latest updates, events, and resources for electronic music enthusiasts.`;
  }
  
  // Expand content based on length factor
  let expandedContent = baseContent;
  for (let i = 1; i < lengthFactor; i++) {
    // Add additional paragraphs based on the prompt
    expandedContent += `\n\n## More About ${prompt.split(' ').slice(0, 3).join(' ')}\n\nThe electronic music community continues to thrive with innovative approaches to production and performance. Artists are constantly pushing boundaries and exploring new sonic territories.\n\nTechnology plays a crucial role in the evolution of electronic music, with new tools and techniques emerging regularly. This keeps the genre fresh and exciting for both creators and listeners.`;
  }
  
  // Adjust tone
  if (tone === 'casual') {
    expandedContent = expandedContent.replace(/Electronic music/g, 'Electronic music... it\'s so awesome!')
      .replace(/Production/g, 'Production (the fun part!)')
      .replace(/technology/g, 'cool tech')
      .replace(/\./g, '!');
  } else if (tone === 'technical') {
    expandedContent = expandedContent.replace(/Electronic music/g, 'Electronic music synthesis')
      .replace(/Production/g, 'Audio signal processing')
      .replace(/techniques/g, 'methodologies and algorithms')
      .replace(/sounds/g, 'audio waveforms');
  } else if (tone === 'enthusiastic') {
    expandedContent = expandedContent.replace(/Electronic music/g, 'AMAZING electronic music')
      .replace(/Production/g, 'Incredible production')
      .replace(/\./g, '!!!')
      .replace(/interesting/g, 'MIND-BLOWING');
  }
  
  return expandedContent;
}

// Create and export mock services
export function createMockServices() {
  return {
    textGenerator: new MockTextGenerator(),
    imageGenerator: new MockImageGenerator(),
    plagiarismDetector: new MockPlagiarismDetector(),
    seoOptimizer: new MockSEOOptimizer()
  };
}
