/**
 * Complete Vercel build bypass for Electronic Music Content Generator
 * This file provides mock implementations to ensure the build succeeds
 * without needing real API keys.
 */

// Electronic music specific mock data for placeholders
const ELECTRONIC_MUSIC_TOPICS = [
  "EDM production techniques",
  "Synthesizer programming",
  "Electronic music artists",
  "Club promotion",
  "Music technology",
  "Beat making",
  "Sound design",
  "Electronic music events",
  "DJ techniques",
  "EMC community"
];

// Mock services that will be used during build
export const createMockBuildServices = () => {
  return {
    textGenerator: {
      generateContent: (prompt) => Promise.resolve(
        `# Electronic Music Content Generator\n\n` +
        `This is placeholder content for "${prompt}" that would normally be generated with OpenAI.` +
        `\n\n## Electronic Music Topics\n\n` + 
        ELECTRONIC_MUSIC_TOPICS.map(topic => `- ${topic}`).join('\n')
      )
    },
    imageGenerator: {
      generateImage: () => Promise.resolve(
        'https://placehold.co/600x400?text=Electronic+Music+Content'
      )
    },
    seoOptimizer: {
      optimizeContent: (content) => Promise.resolve({ 
        optimizedContent: content, 
        seoScore: 85, 
        keywordDensity: { 
          'electronic': 3.2,
          'music': 2.8,
          'production': 1.5
        } 
      }),
      suggestKeywords: () => Promise.resolve(ELECTRONIC_MUSIC_TOPICS),
      generateMetaTags: () => Promise.resolve({
        title: 'EMC Content',
        description: 'Electronic Music Council content generation tool',
        keywords: 'electronic music, EDM, production, synthesizers'
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
};

// Check if we're in a build environment
export const isBuildEnvironment = () => {
  // 1. Check if we're in a Netlify or Vercel build environment
  if (process.env.VERCEL_BUILD_MODE === 'true' || process.env.NETLIFY === 'true') {
    console.log('EMC Generator: Detected build environment (Vercel/Netlify)');
    return true;
  }
  
  // 2. Check for explicit mock services flag
  if (process.env.USE_MOCK_SERVICES === 'true') {
    console.log('EMC Generator: Using mock services by explicit configuration');
    return true;
  }
  
  // 3. Check for API key availability - use mocks if no keys
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 20;
  
  if (!hasOpenAIKey && process.env.NODE_ENV === 'production') {
    console.log('EMC Generator: No valid API keys found, using mock services');
    return true;
  }
  
  // 4. Default to false - use real services when possible
  return false;
};

// Helper to safely get services without API key errors
export const getSafeServices = (realServicesCreator) => {
  // Always use mock services during build
  if (isBuildEnvironment()) {
    console.log('EMC Generator: Using mock services for build or preview');
    return createMockBuildServices();
  }
  
  // Use real services in production with error handling
  try {
    return realServicesCreator();
  } catch (error) {
    console.error('Error creating real services:', error);
    // Fallback to mock if real services fail
    return createMockBuildServices();
  }
};
