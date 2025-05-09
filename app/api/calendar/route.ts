import { NextRequest, NextResponse } from 'next/server';
import * as openai from '../../lib/openai';
import { addDays, format } from 'date-fns';

// Temporarily store calendar data in memory
// In a real app, this would be stored in a database
interface CalendarEntry {
  id: string;
  title: string;
  description: string;
  date: string;
  content?: string;
  status?: string;
}

let calendarEntries: CalendarEntry[] = [];

export async function GET() {
  try {
    return NextResponse.json({ entries: calendarEntries });
  } catch (error: Error | unknown) {
    console.error('Error fetching calendar entries:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage || 'Failed to fetch calendar entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, entry, timeframe, contentFocus, numberOfPosts, topicAreas } = await request.json();

    // Handle different actions
    if (action === 'add') {
      // Add a single entry
      if (entry) {
        const newEntry = {
          id: Date.now(),
          ...entry,
        };
        calendarEntries.push(newEntry);
        return NextResponse.json({ success: true, entry: newEntry });
      }
      return NextResponse.json(
        { error: 'Entry data is required' },
        { status: 400 }
      );
    } 
    else if (action === 'generate') {
      // Generate a content calendar based on parameters
      if (!timeframe || !contentFocus || !numberOfPosts || !topicAreas) {
        return NextResponse.json(
          { error: 'Missing parameters for calendar generation' },
          { status: 400 }
        );
      }

      // Create prompt for AI to generate calendar suggestions
      const prompt = `Generate a ${timeframe} content calendar for an electronic music platform focusing on ${contentFocus}. 
      Include ${numberOfPosts} post ideas covering ${topicAreas} with optimal posting schedules.
      Format each entry as a JSON object with date, title, type, platform, and status fields.`;

      // Generate calendar suggestion content
      const generatedContent = await openai.generateContent(prompt);
      
      // Try to parse the AI response into structured data
      let newEntries = [];
      try {
        // Find JSON-like content in the response and parse it
        const jsonContent = generatedContent.match(/\[[\s\S]*\]/);
        if (jsonContent) {
          newEntries = JSON.parse(jsonContent[0]);
        } else {
          // Fallback: Create some structured entries manually
          const today = new Date();
          const platforms = ['Instagram', 'Twitter', 'Facebook', 'TikTok'];
          const types = ['post', 'story', 'video', 'article'];
          
          for (let i = 0; i < parseInt(numberOfPosts); i++) {
            newEntries.push({
              id: Date.now() + i,
              date: format(addDays(today, i * 2), 'yyyy-MM-dd'),
              title: `${contentFocus} content #${i+1}`,
              type: types[i % types.length],
              platform: platforms[i % platforms.length],
              status: 'planned'
            });
          }
        }
        
        // Add the entries to our calendar
        calendarEntries = [...calendarEntries, ...newEntries];
        
        return NextResponse.json({ 
          success: true, 
          entries: newEntries,
          calendar: calendarEntries 
        });
      } catch (parseError) {
        console.error('Error parsing AI generated calendar:', parseError);
        return NextResponse.json(
          { error: 'Failed to generate calendar entries' },
          { status: 500 }
        );
      }
    }
    else if (action === 'delete') {
      // Delete an entry
      if (!entry?.id) {
        return NextResponse.json(
          { error: 'Entry ID is required for deletion' },
          { status: 400 }
        );
      }
      calendarEntries = calendarEntries.filter(e => e.id !== entry.id);
      return NextResponse.json({ success: true });
    }
    else if (action === 'update') {
      // Update an entry
      if (!entry?.id) {
        return NextResponse.json(
          { error: 'Entry ID is required for update' },
          { status: 400 }
        );
      }
      calendarEntries = calendarEntries.map(e => 
        e.id === entry.id ? { ...e, ...entry } : e
      );
      return NextResponse.json({ success: true, entry });
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: Error | unknown) {
    console.error('Error managing calendar:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage || 'Failed to process calendar request' },
      { status: 500 }
    );
  }
}
