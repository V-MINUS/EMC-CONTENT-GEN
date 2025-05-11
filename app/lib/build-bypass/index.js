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
  // Only return true for actual build environments, not development
  // This will enable real API services during development
  
  // If USE_MOCK_SERVICES is explicitly set, respect it
  if (process.env.USE_MOCK_SERVICES === 'true') {
    return true;
  }
  
  // If USE_MOCK_SERVICES is explicitly false, never use mocks
  if (process.env.USE_MOCK_SERVICES === 'false') {
    return false;
  }
  
  // Only use mocks during actual Vercel/Netlify build process
  return process.env.VERCEL_BUILD_STEP === 'true' || 
         process.env.VERCEL_BUILD_MODE === 'true';
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
