// Simple test script to diagnose API connectivity issues
require('dotenv').config();
const { OpenAI } = require('openai');

// Log environment variables (sanitized)
console.log('Environment check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);
console.log('- OPENAI_API_KEY length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);
console.log('- DEEPSEEK_API_KEY present:', !!process.env.DEEPSEEK_API_KEY);
console.log('- USE_MOCK_SERVICES:', process.env.USE_MOCK_SERVICES);

async function testOpenAI() {
  console.log('\nTesting OpenAI connectivity...');
  
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    console.log('OpenAI client initialized');
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello, test message for EMC Content Generator" }],
      max_tokens: 50
    });
    
    console.log('OpenAI API test successful!');
    console.log('Response:', response.choices[0].message.content);
    return true;
  } catch (error) {
    console.error('OpenAI API test failed with error:');
    console.error(error.message);
    console.error('Full error:', error);
    return false;
  }
}

// Run the test
testOpenAI().then(success => {
  console.log('\nTest completed with status:', success ? 'SUCCESS' : 'FAILED');
  if (!success) {
    console.log('\nTroubleshooting tips:');
    console.log('1. Check if your API key is valid and correctly formatted (should start with "sk-")');
    console.log('2. Check if you have sufficient credits in your OpenAI account');
    console.log('3. Verify there are no network restrictions preventing API access');
  }
});
