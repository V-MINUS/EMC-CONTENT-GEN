// Direct Netlify serverless function for EMC Content Generator /api/generate endpoint
// This avoids the 404 errors by mapping directly to the path the app is requesting

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
};

// Mock electronic music content for generating posts
const mockEMContent = `# Electronic Music Content Generator

This is placeholder content from the Netlify serverless function.
When you set up valid API keys, real content will be generated.

## Electronic Music Topics
- EDM production techniques
- Synthesizer programming
- Electronic music events
- Sound design fundamentals
- DJ techniques`;

// Handler function for all requests to /api/generate
exports.handler = async (event) => {
  console.log('EMC Generator API request received:', event.httpMethod, event.path);
  
  // Handle OPTIONS preflight requests (important for CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '{}'
    };
  }

  try {
    // For POST requests (content generation)
    if (event.httpMethod === 'POST') {
      // Parse request body if possible
      let requestBody = {};
      try {
        requestBody = JSON.parse(event.body || '{}');
        console.log('Request details:', JSON.stringify(requestBody).substring(0, 100) + '...');
      } catch (e) {
        console.error('Error parsing request body:', e);
      }

      // Return mock response with electronic music content
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          content: mockEMContent,
          imageUrl: 'https://placehold.co/600x400?text=Electronic+Music+Content',
          plagiarismCheck: { 
            isOriginal: true, 
            similarityScore: 2, 
            similarSources: [] 
          },
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
    
    // For PUT requests (content refinement)
    if (event.httpMethod === 'PUT') {
      let requestBody = {};
      try {
        requestBody = JSON.parse(event.body || '{}');
      } catch (e) {
        console.error('Error parsing refinement request body:', e);
      }
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          content: `# Refined Electronic Music Content

${requestBody.content || 'Your refined electronic music content here'}

Refined with professional tone for electronic music industry standards.`,
          success: true
        })
      };
    }
    
    // For unhandled methods
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
    
  } catch (error) {
    console.error('Error handling request:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Server error processing request',
        message: error.message
      })
    };
  }
};
