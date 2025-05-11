// Direct Netlify serverless function for the EMC Content Generator
// Uses a simpler naming structure for better Netlify compatibility
const { OpenAI } = require('openai');
const https = require('https');

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400'
};

// Mock electronic music content
const mockEMContent = `# Electronic Music Content Generator

This is placeholder content from the Netlify serverless function.
When you set up valid API keys, real content will be generated.

## Electronic Music Topics
- EDM production techniques
- Synthesizer programming
- Electronic music events
- Sound design fundamentals
- DJ techniques`;

// Initialize OpenAI client
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log('No OpenAI API key found');
    return null;
  }
  try {
    return new OpenAI({ apiKey });
  } catch (error) {
    console.error('Error initializing OpenAI client:', error);
    return null;
  }
};

// DeepSeek fallback
async function generateWithDeepSeek(prompt, options = {}) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.log('No DeepSeek API key found');
    return null;
  }
  
  try {
    console.log('Using DeepSeek as fallback');
    const systemMessage = `You are an expert electronic music content creator specializing in ${options.category || 'electronic music'} content.`;
    
    const requestData = JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: options.length === 'long' ? 1500 : options.length === 'medium' ? 800 : 400
    });
    
    return new Promise((resolve, reject) => {
      const requestOptions = {
        hostname: 'api.deepseek.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Content-Length': Buffer.byteLength(requestData)
        }
      };
      
      const req = https.request(requestOptions, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(responseData);
            if (parsedData.choices && parsedData.choices.length > 0) {
              resolve(parsedData.choices[0].message.content);
            } else {
              resolve(null);
            }
          } catch (error) {
            resolve(null);
          }
        });
      });
      
      req.on('error', () => resolve(null));
      req.write(requestData);
      req.end();
    });
  } catch (error) {
    return null;
  }
};

// Generate with OpenAI
async function generateWithOpenAI(prompt, options = {}) {
  const openai = getOpenAIClient();
  if (!openai) return null;
  
  try {
    console.log('Generating with OpenAI: ' + prompt.substring(0, 100) + '...');
    
    const systemMessage = `You are an expert electronic music content creator specializing in ${options.category || 'electronic music'} content.
    Create engaging, professional content with expert knowledge of electronic music production, artists, events, and culture.
    ${options.tone ? `Use a ${options.tone} tone.` : 'Use a professional tone.'}`;
    
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: options.length === 'long' ? 1500 : options.length === 'medium' ? 800 : 400
    });
    
    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI error:', error.message);
    return null;
  }
};

// Main handler function
exports.handler = async (event) => {
  console.log('EMC Generator received:', event.httpMethod, event.path);
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '{}'
    };
  }

  // POST for content generation, PUT for refinement
  if (event.httpMethod === 'POST' || event.httpMethod === 'PUT') {
    try {
      // Parse request data
      let requestBody = {};
      try {
        requestBody = JSON.parse(event.body || '{}');
      } catch (e) {
        console.error('Error parsing request:', e);
      }
      
      // Check if we should use real APIs
      const useRealAPI = process.env.USE_MOCK_SERVICES !== 'true';
      let generatedContent = null;
      let apiUsed = 'mock';
      
      if (useRealAPI) {
        // Determine prompt based on request type
        let prompt = '';
        let options = {};
        
        if (event.httpMethod === 'POST') {
          prompt = requestBody.prompt || 'Generate electronic music content';
          options = {
            category: requestBody.category || 'electronic music',
            tone: requestBody.tone,
            length: requestBody.length || 'medium'
          };
        } else { // PUT - refinement
          prompt = `Please refine this electronic music content: ${requestBody.content || ''}
          Instructions: ${requestBody.instructions || 'Improve quality'}
          ${requestBody.tone ? `Tone: ${requestBody.tone}` : ''}`;
          options = {
            category: 'refinement',
            tone: requestBody.tone || 'professional',
            length: 'medium'
          };
        }
        
        // Try OpenAI first
        if (process.env.OPENAI_API_KEY) {
          generatedContent = await generateWithOpenAI(prompt, options);
          if (generatedContent) {
            apiUsed = 'openai';
          }
        }
        
        // Try DeepSeek as fallback
        if (!generatedContent && process.env.DEEPSEEK_API_KEY) {
          generatedContent = await generateWithDeepSeek(prompt, options);
          if (generatedContent) {
            apiUsed = 'deepseek';
          }
        }
      }
      
      // Return appropriate response based on request type
      if (event.httpMethod === 'POST') {
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            content: generatedContent || mockEMContent,
            imageUrl: 'https://placehold.co/600x400?text=Electronic+Music+Content',
            plagiarismCheck: { isOriginal: true, similarityScore: 2, similarSources: [] },
            seoOptimization: { 
              readabilityScore: 85,
              keywordDensity: { 'electronic': 3.2, 'music': 2.8 },
              suggestions: ['Add more industry terms', 'Include artist names'],
              wordCount: generatedContent ? generatedContent.split(' ').length : 120
            },
            metaTags: {
              title: 'Electronic Music Content',
              description: 'Electronic music production and events',
              keywords: 'EDM, production, synthesizers, music'
            },
            suggestedKeywords: ['EDM', 'production', 'synthesizers', 'events', 'DJ'],
            apiUsed: apiUsed
          })
        };
      } else { // PUT - refinement
        const defaultContent = `# Refined Electronic Music Content\n\n${requestBody.content || 'Your refined content here'}\n\nRefined with ${requestBody.tone || 'professional'} tone.`;
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            content: generatedContent || defaultContent,
            success: true,
            apiUsed: apiUsed
          })
        };
      }
    } catch (error) {
      console.error('Error in handler:', error);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Server error', message: error.message })
      };
    }
  }
  
  // Default response for other methods
  return {
    statusCode: 405,
    headers: corsHeaders,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
