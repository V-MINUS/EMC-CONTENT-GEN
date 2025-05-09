// Runtime configuration with build-time fallbacks
export const config = {
  // Use process.env during runtime, fallback to mock values during build
  openAiKey: process.env.OPENAI_API_KEY || 'mock-api-key-for-build',
  deepSeekKey: process.env.DEEPSEEK_API_KEY || 'mock-api-key-for-build',
  useMockServices: process.env.USE_MOCK_SERVICES === 'true' || 
                   process.env.VERCEL_ENV !== 'production',
  
  // Helper function to determine if we're in a build environment
  isBuildTime: () => {
    return process.env.NODE_ENV !== 'production' || 
           process.env.VERCEL_ENV === 'preview' || 
           process.env.VERCEL_BUILD_STEP === 'true' ||
           process.env.VERCEL_BUILD_MODE === 'true';
  },
  
  // Fallback content for build time
  buildTimePlaceholders: {
    contentTitle: "Electronic Music Content Generator",
    contentBody: "This is a placeholder for the EMC Content Generator. Real content will be generated once deployed with proper API keys.",
    imageUrl: "https://placehold.co/600x400?text=Electronic+Music+Content"
  }
};

// Mock services for build time
export const mockServices = {
  textGenerator: {
    generateContent: (prompt) => Promise.resolve(
      `# Electronic Music Content\n\nThis is placeholder content for "${prompt}"`
    )
  },
  imageGenerator: {
    generateImage: () => Promise.resolve(config.buildTimePlaceholders.imageUrl)
  },
  seoOptimizer: {
    optimizeContent: (content) => Promise.resolve({ 
      optimizedContent: content, 
      seoScore: 85, 
      keywordDensity: {} 
    }),
    suggestKeywords: () => Promise.resolve([
      'electronic music', 
      'EDM', 
      'music production', 
      'synthesizers'
    ]),
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
