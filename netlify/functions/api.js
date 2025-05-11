// Ultra-minimal Netlify serverless function for EMC Content Generator
// This avoids the 250MB size limit by being extremely lightweight

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
};

// Mock electronic music content for testing
const mockEMContent = `# Electronic Music Content Generator

This is placeholder content from the minimal Netlify serverless function.
When you set up valid API keys, real content will be generated.

## Electronic Music Topics
- EDM production techniques
- Synthesizer programming
- Electronic music events
- Sound design fundamentals
- DJ techniques`;

exports.handler = async (event) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '{}'
    };
  }

  // Basic path handling
  const path = event.path.replace(/^\/.netlify\/functions\/api/, '');
  
  // Generate endpoint
  if (path === '/generate') {
    // Mock response for content generation
    if (event.httpMethod === 'POST') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          content: mockEMContent,
          imageUrl: 'https://placehold.co/600x400?text=Electronic+Music+Content',
          plagiarismCheck: { isOriginal: true, similarityScore: 2, similarSources: [] },
          seoOptimization: { 
            readabilityScore: 85,
            keywordDensity: { 'electronic': 3.2, 'music': 2.8 },
            suggestions: ['Add more industry terms', 'Include artist names'],
            wordCount: 120
          },
          metaTags: {
            title: 'Electronic Music Content',
            description: 'Content about electronic music production and events',
            keywords: 'EDM, production, synthesizers, music'
          },
          suggestedKeywords: ['EDM', 'production', 'synthesizers', 'events', 'DJ']
        })
      };
    }
    
    // Content refinement endpoint
    if (event.httpMethod === 'PUT') {
      let requestBody = {};
      try {
        requestBody = JSON.parse(event.body || '{}');
      } catch (e) {
        // Ignore parsing errors
      }
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          content: `# Refined Electronic Music Content

${requestBody.content || 'Your refined content here'}

Refined with professional tone for electronic music context.`,
          success: true
        })
      };
    }
  }

  // Default response
  return {
    statusCode: 404,
    headers: corsHeaders,
    body: JSON.stringify({ error: 'Not found' })
  };
};
