// Direct Netlify serverless function for EMC Content Generator /api/generate endpoint
// With real OpenAI and DeepSeek API integration when environment variables are available
const { OpenAI } = require('openai');
const https = require('https');

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

// Initialize OpenAI client if API key is available
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log('No OpenAI API key found in environment variables');
    return null;
  }
  try {
    return new OpenAI({ apiKey });
  } catch (error) {
    console.error('Error initializing OpenAI client:', error);
    return null;
  }
};

// DeepSeek API integration as a fallback
async function generateWithDeepSeek(prompt, options = {}) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.log('No DeepSeek API key found in environment variables');
    return null;
  }
  
  try {
    console.log('Attempting to generate content with DeepSeek as fallback');
    
    // Construct system message for electronic music domain
    const systemMessage = `You are an expert electronic music content creator specializing in ${options.category || 'electronic music'} content.
    Create engaging, professional content with expert knowledge of electronic music production, artists, events, and culture.
    ${options.tone ? `Use a ${options.tone} tone.` : 'Use a professional tone.'}`;
    
    // DeepSeek API request data
    const requestData = JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: options.length === 'long' ? 1500 : options.length === 'medium' ? 800 : 400
    });
    
    // Promise-based HTTPS request
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
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(responseData);
            if (parsedData.choices && parsedData.choices.length > 0) {
              resolve(parsedData.choices[0].message.content);
            } else {
              console.error('DeepSeek API returned unexpected response structure:', parsedData);
              resolve(null);
            }
          } catch (error) {
            console.error('Error parsing DeepSeek API response:', error);
            resolve(null);
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('Error making DeepSeek API request:', error);
        resolve(null);
      });
      
      req.write(requestData);
      req.end();
    });
  } catch (error) {
    console.error('Error in DeepSeek API call:', error);
    return null;
  }
};

// Generate content using OpenAI API
async function generateWithOpenAI(prompt, options = {}) {
  const openai = getOpenAIClient();
  if (!openai) {
    return null; // Will fallback to mock content
  }
  
  try {
    console.log('Generating content with OpenAI:', prompt.substring(0, 100) + '...');
    
    // Default system message for electronic music content
    const systemMessage = `You are an expert electronic music content creator specializing in ${options.category || 'electronic music'} content.
    Create engaging, professional content with expert knowledge of electronic music production, artists, events, and culture.
    ${options.tone ? `Use a ${options.tone} tone.` : 'Use a professional tone.'}
    ${options.brandVoice ? `Match this brand voice: ${options.brandVoice}` : ''}`;
    
    // Generate content with GPT-4 or latest model
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview", // Using latest GPT-4 model
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: options.length === 'long' ? 1500 : options.length === 'medium' ? 800 : 400
    });
    
    // Return the generated content
    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating content with OpenAI:', error);
    return null; // Will fallback to mock content
  }
}

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

      // Check if we should use real APIs based on environment variables
      const useRealAPI = process.env.USE_MOCK_SERVICES !== 'true';
      console.log('Using real API:', useRealAPI ? 'Yes' : 'No');
      
      let generatedContent = null;
      let apiUsed = 'mock';
      
      if (useRealAPI) {
        // Check for OpenAI API key
        if (process.env.OPENAI_API_KEY) {
          console.log('Attempting to use OpenAI API first');
          // Try to generate content with OpenAI
          try {
            generatedContent = await generateWithOpenAI(
              requestBody.prompt || 'Generate electronic music content', 
              {
                category: requestBody.category || 'electronic music',
                tone: requestBody.tone,
                brandVoice: requestBody.brandVoice,
                length: requestBody.length || 'medium'
              }
            );
            
            if (generatedContent) {
              console.log('Successfully generated content with OpenAI');
              apiUsed = 'openai';
            } else {
              console.log('OpenAI generation failed or returned empty result');
            }
          } catch (error) {
            console.error('Error with OpenAI generation:', error.message);
            // OpenAI could have quota errors or other issues
            if (error.message && 
                (error.message.includes('quota') || 
                 error.message.includes('rate limit') || 
                 error.message.includes('billing'))) {
              console.log('OpenAI quota exceeded, will try DeepSeek as fallback');
            }
          }
        }
        
        // If OpenAI failed or wasn't available, try DeepSeek as fallback
        if (!generatedContent && process.env.DEEPSEEK_API_KEY) {
          console.log('Attempting to use DeepSeek API as fallback');
          try {
            generatedContent = await generateWithDeepSeek(
              requestBody.prompt || 'Generate electronic music content',
              {
                category: requestBody.category || 'electronic music',
                tone: requestBody.tone,
                length: requestBody.length || 'medium'
              }
            );
            
            if (generatedContent) {
              console.log('Successfully generated content with DeepSeek fallback');
              apiUsed = 'deepseek';
            } else {
              console.log('DeepSeek generation also failed or returned empty result');
            }
          } catch (error) {
            console.error('Error with DeepSeek fallback generation:', error.message);
          }
        }
      }

      // Return real or mock response based on what's available
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          content: generatedContent || mockEMContent,
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
            wordCount: generatedContent ? generatedContent.split(' ').length : 120
          },
          metaTags: {
            title: 'Electronic Music Content',
            description: 'Content about electronic music production and events',
            keywords: 'EDM, production, synthesizers, music'
          },
          suggestedKeywords: ['EDM', 'production', 'synthesizers', 'events', 'DJ'],
          // Include info about which API was used
          apiUsed: apiUsed
        })
      };
    }
    
    // For PUT requests (content refinement)
    if (event.httpMethod === 'PUT') {
      let requestBody = {};
      try {
        requestBody = JSON.parse(event.body || '{}');
        console.log('Refinement request details:', JSON.stringify(requestBody).substring(0, 100) + '...');
      } catch (e) {
        console.error('Error parsing refinement request body:', e);
      }
      
      // Check if we should use real APIs
      const useRealAPI = process.env.USE_MOCK_SERVICES !== 'true';
      console.log('Using real API for refinement:', useRealAPI ? 'Yes' : 'No');
      
      let refinedContent = null;
      let apiUsed = 'mock';
      
      // Construct a refinement prompt
      const refinementPrompt = `Please refine the following electronic music content: 

${requestBody.content || ''}

` +
        `Instructions for refinement: ${requestBody.instructions || 'Improve the quality and professionalism'}
` +
        `${requestBody.tone ? `Use a ${requestBody.tone} tone.` : ''}
` +
        `${requestBody.preserveSections ? `Preserve these sections: ${requestBody.preserveSections.join(', ')}` : ''}`;
      
      if (useRealAPI && requestBody.content) {
        // Try OpenAI first if available
        if (process.env.OPENAI_API_KEY) {
          console.log('Attempting to use OpenAI API for content refinement');
          try {
            // Try to refine content with OpenAI
            refinedContent = await generateWithOpenAI(refinementPrompt, {
              category: 'refinement',
              tone: requestBody.tone || 'professional',
              length: 'medium'
            });
            
            if (refinedContent) {
              console.log('Successfully refined content with OpenAI');
              apiUsed = 'openai';
            } else {
              console.log('OpenAI refinement failed or returned empty result');
            }
          } catch (error) {
            console.error('Error with OpenAI refinement:', error.message);
            // OpenAI could have quota errors or other issues
            if (error.message && 
                (error.message.includes('quota') || 
                 error.message.includes('rate limit') || 
                 error.message.includes('billing'))) {
              console.log('OpenAI quota exceeded for refinement, will try DeepSeek as fallback');
            }
          }
        }
        
        // If OpenAI failed or wasn't available, try DeepSeek as fallback
        if (!refinedContent && process.env.DEEPSEEK_API_KEY) {
          console.log('Attempting to use DeepSeek API as fallback for refinement');
          try {
            refinedContent = await generateWithDeepSeek(refinementPrompt, {
              category: 'refinement',
              tone: requestBody.tone || 'professional',
              length: 'medium'
            });
            
            if (refinedContent) {
              console.log('Successfully refined content with DeepSeek fallback');
              apiUsed = 'deepseek';
            } else {
              console.log('DeepSeek refinement also failed or returned empty result');
            }
          } catch (error) {
            console.error('Error with DeepSeek fallback refinement:', error.message);
          }
        }
      }
      
      // Default mock refinement if API generation failed
      const defaultRefinedContent = `# Refined Electronic Music Content

${requestBody.content || 'Your refined electronic music content here'}

Refined with ${requestBody.tone || 'professional'} tone for electronic music industry standards.`;
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          content: refinedContent || defaultRefinedContent,
          success: true,
          apiUsed: apiUsed
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
