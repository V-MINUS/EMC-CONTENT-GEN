import OpenAI from 'openai';

// Initialize OpenAI client
// In production, use environment variables for the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '', // API key should be set in .env.local
  dangerouslyAllowBrowser: true // For client components - in production, use server components
});

// Generate content using OpenAI
export async function generateContent(
  prompt: string,
  maxTokens: number = 500
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Using the more affordable model
      messages: [
        {
          role: "system",
          content: "You are a content creator specializing in electronic music culture, events, and production. Your goal is to create engaging, accurate, and on-brand content for the Electronic Music Council."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || 'Could not generate content.';
  } catch (error) {
    console.error('Error generating content with OpenAI:', error);
    return 'Error generating content. Please try again.';
  }
}

// Generate image using DALL-E
export async function generateImage(
  prompt: string
): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-2", // DALL-E 2 is more affordable than DALL-E 3
      prompt: `Electronic music themed image: ${prompt}`,
      n: 1,
      size: "1024x1024",
    });

    return response.data && response.data[0]?.url ? response.data[0].url : '';
  } catch (error) {
    console.error('Error generating image with DALL-E:', error);
    return '';
  }
}

// Generate SEO keywords
export async function generateSeoSuggestions(
  content: string
): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an SEO specialist for electronic music content. Extract or suggest relevant keywords and hashtags from the provided content that would perform well on search engines and social media."
        },
        {
          role: "user",
          content: `Generate 5 SEO keyword suggestions and hashtags for the following content: ${content}`
        }
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    const suggestions = response.choices[0]?.message?.content?.split('\n') || [];
    return suggestions.filter(item => item.trim().length > 0);
  } catch (error) {
    console.error('Error generating SEO suggestions:', error);
    return [];
  }
}
