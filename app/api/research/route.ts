import { NextRequest, NextResponse } from 'next/server';
import * as openai from '../../lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { query, researchType } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Research query is required' },
        { status: 400 }
      );
    }

    // Enhance the query based on research type
    let enhancedQuery = '';
    
    if (researchType === 'artist') {
      enhancedQuery = `Provide research on electronic music artist/producer: ${query}. Include their background, music style, notable releases, labels they've worked with, and their influence on the electronic music scene. Format as bullet points for easy content creation.`;
    } else if (researchType === 'trend') {
      enhancedQuery = `Research current trends in electronic music related to: ${query}. Include emerging artists, popular sounds, production techniques, and relevant events or festivals. Format as bullet points for easy content creation.`;
    } else if (researchType === 'venue') {
      enhancedQuery = `Research the electronic music venue: ${query}. Include its history, notable events hosted, capacity, location, and significance in the electronic music scene. Format as bullet points for easy content creation.`;
    } else {
      enhancedQuery = `Research the following topic related to electronic music: ${query}. Provide comprehensive information formatted as bullet points for easy content creation.`;
    }

    // Generate research content
    const researchContent = await openai.generateContent(enhancedQuery);

    return NextResponse.json({
      researchContent,
      query,
      researchType
    });
  } catch (error: Error | unknown) {
    console.error('Error in research API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage || 'Failed to generate research' },
      { status: 500 }
    );
  }
}
