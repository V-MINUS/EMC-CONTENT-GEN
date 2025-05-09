import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face client
// In production, use environment variables for the API key
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || ''); // API key should be set in .env.local

// Text generation using Hugging Face models
export async function generateContent(
  prompt: string,
  maxLength: number = 300
): Promise<string> {
  try {
    // For free text generation, we're using Meta's MPT model which works well for content creation
    const response = await hf.textGeneration({
      model: 'meta-llama/Llama-2-7b-chat-hf', // This is just an example - might require Pro subscription or specific permissions
      inputs: `<s>[INST] <<SYS>>
You are a content creator specializing in electronic music culture, events, and production. Your goal is to create engaging, accurate, and on-brand content for the Electronic Music Council.
<</SYS>>

${prompt} [/INST]`,
      parameters: {
        max_new_tokens: maxLength,
        temperature: 0.7,
        top_p: 0.95,
      }
    });

    return response.generated_text || 'Could not generate content.';
  } catch (error) {
    console.error('Error generating content with Hugging Face:', error);
    
    // Fallback to a smaller, fully open model that doesn't require tokens
    try {
      const fallbackResponse = await hf.textGeneration({
        model: 'gpt2',  // Completely free alternative
        inputs: prompt,
        parameters: {
          max_new_tokens: maxLength,
          temperature: 0.7,
          top_p: 0.95,
        }
      });
      
      return fallbackResponse.generated_text || 'Could not generate content.';
    } catch (fallbackError) {
      console.error('Error with fallback model:', fallbackError);
      return 'Error generating content. Please try again.';
    }
  }
}

// Image generation using Hugging Face Stable Diffusion
export async function generateImage(
  prompt: string
): Promise<string> {
  try {
    // Using Stable Diffusion 2 which is freely available
    const response = await hf.textToImage({
      model: 'stabilityai/stable-diffusion-2',
      inputs: `Electronic music themed image: ${prompt}`,
      parameters: {
        negative_prompt: 'blurry, bad quality, distorted'
      }
    });
    
    // Different HF client configurations can return different response types
    // For client components or browser environments, we typically get a Blob
    // For server components, we might get a string URL or other formats
    
    try {
      // First attempt to handle as Blob (client-side usage)
      if (typeof window !== 'undefined') { // Check if we're in browser environment
        // Cast to Blob after verifying it has the expected Blob properties
        const responseData = response as any;
        if (responseData && typeof responseData.size === 'number' && typeof responseData.type === 'string') {
          const blob = responseData as Blob;
          const reader = new FileReader();
          
          return new Promise<string>((resolve) => {
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
            reader.readAsDataURL(blob);
          });
        }
      }
      
      // Handle string response (could be a URL or base64 data)
      if (typeof response === 'string') {
        return response;
      }
      
      // Handle response as buffer or other formats
      console.log('Using fallback image handling method');
      // Cast to any to safely check if toString exists
      const anyResponse = response as any;
      if (anyResponse && typeof anyResponse.toString === 'function') {
        return anyResponse.toString();
      }
      return '';
    } catch (processingError) {
      console.error('Error processing Hugging Face image response:', processingError);
      return '';
    }
  } catch (error) {
    console.error('Error generating image with Hugging Face:', error);
    return '';
  }
}

// Generate SEO keywords using Hugging Face
export async function generateSeoSuggestions(
  content: string
): Promise<string[]> {
  try {
    const response = await hf.textGeneration({
      model: 'distilgpt2', // Smaller model that's free to use
      inputs: `Generate 5 SEO keyword suggestions for electronic music content: ${content.substring(0, 100)}...`,
      parameters: {
        max_new_tokens: 100,
        temperature: 0.7,
      }
    });
    
    // Parse the response and extract keywords
    const suggestions = response.generated_text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Remove numbering if present
      .filter(line => line.length > 0)
      .slice(0, 5); // Limit to 5 suggestions
      
    return suggestions;
  } catch (error) {
    console.error('Error generating SEO suggestions with Hugging Face:', error);
    
    // Return some default electronic music keywords as fallback
    return [
      'electronic music',
      'techno',
      'house music',
      'EDM events',
      'music production'
    ];
  }
}
