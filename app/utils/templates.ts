// Export these interfaces so they can be imported from a single place
export interface ContentTemplate {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  promptTemplate: string;
  platform?: string; // Optional platform ID
}

export interface SocialPlatform {
  id: number;
  name: string;
  icon: string;
  characterLimit: number | null;
  imageRequired: boolean;
}

// Social Media Platforms
export const socialPlatforms: SocialPlatform[] = [
  {
    id: 1,
    name: "Instagram",
    icon: "fab fa-instagram",
    characterLimit: 2200,
    imageRequired: true
  },
  {
    id: 2,
    name: "Twitter",
    icon: "fab fa-twitter",
    characterLimit: 280,
    imageRequired: false
  },
  {
    id: 3,
    name: "Facebook",
    icon: "fab fa-facebook",
    characterLimit: 63206,
    imageRequired: false
  },
  {
    id: 4,
    name: "TikTok",
    icon: "fab fa-tiktok",
    characterLimit: 2200,
    imageRequired: true
  },
  {
    id: 5,
    name: "LinkedIn",
    icon: "fab fa-linkedin",
    characterLimit: 3000,
    imageRequired: false
  }
];

// Tool categories
export const toolCategories = [
  {
    id: 'social',
    name: 'Social Media',
    icon: 'fab fa-instagram',
    description: 'Create posts for various social media platforms'
  },
  {
    id: 'video',
    name: 'Video Content',
    icon: 'fab fa-youtube',
    description: 'Generate scripts and descriptions for YouTube and other video content'
  },
  {
    id: 'seo',
    name: 'SEO Tools',
    icon: 'fas fa-search',
    description: 'Optimize your content for search engines'
  },
  {
    id: 'planning',
    name: 'Content Planning',
    icon: 'fas fa-calendar-alt',
    description: 'Plan your content calendar and strategy'
  },
  {
    id: 'research',
    name: 'Web Research',
    icon: 'fas fa-globe',
    description: 'Research artists, venues, and electronic music trends'
  }
];

// Content templates for electronic music content
export const contentTemplates: ContentTemplate[] = [
  // Social Media Templates
  {
    id: 1,
    name: "Artist Spotlight",
    description: "Feature an artist with their bio, music style, and latest releases",
    icon: "fas fa-user-circle",
    category: "social",
    promptTemplate: "Create a social media post spotlighting {artistName}, a {genre} artist known for {keyTraits}. Mention their latest release '{latestRelease}' and their unique sound characteristics."
  },
  {
    id: 2,
    name: "Event Announcement",
    description: "Promote an upcoming EMC event with key details",
    icon: "fas fa-calendar-alt",
    category: "social",
    promptTemplate: "Generate an exciting announcement for {eventName} happening on {date} at {venue}. The event features {artists} and focuses on {genre} music. Tickets are {ticketPrice}."
  },
  {
    id: 3,
    name: "Beat Battle Promotion",
    description: "Promote EMC's beat battle competitions",
    icon: "fas fa-trophy",
    category: "social",
    promptTemplate: "Create a compelling post announcing our {battleName} beat battle. The theme is {theme}, submission deadline is {deadline}, and the winner gets {prize}. Use hashtag {hashtag}."
  },
  {
    id: 4,
    name: "Release Announcement",
    description: "Announce a new music release from the EMC community",
    icon: "fas fa-compact-disc",
    category: "social",
    promptTemplate: "Announce the release of '{trackName}' by {artistName}, out now on {label}. The {genre} track features {keyElements} and is available on {platforms}."
  },
  {
    id: 5,
    name: "Production Tip",
    description: "Share music production tips and techniques",
    icon: "fas fa-sliders-h",
    category: "social",
    promptTemplate: "Share a quick tip about {technique} for {genre} production. Explain how to {specificTip} to achieve {desiredResult}."
  },
  
  // Video Content Templates
  {
    id: 6,
    name: "YouTube Tutorial Script",
    description: "Create a script for a music production tutorial video",
    icon: "fab fa-youtube",
    category: "video",
    promptTemplate: "Generate a script for a {duration} minute YouTube tutorial on {topic} for {skillLevel} producers. Include an intro, {numberOfSteps} steps, and a conclusion with {callToAction}."
  },
  {
    id: 7,
    name: "Event Aftermovie Voiceover",
    description: "Create voiceover text for an event recap video",
    icon: "fas fa-film",
    category: "video",
    promptTemplate: "Create a voiceover script for a {duration} minute aftermovie of {eventName} that took place at {venue} featuring {artists}. Highlight the {atmosphere} atmosphere and {highlightMoments}."
  },
  {
    id: 8,
    name: "Artist Interview Questions",
    description: "Generate interview questions for an artist",
    icon: "fas fa-microphone",
    category: "video",
    promptTemplate: "Create {numberOfQuestions} insightful interview questions for {artistName}, a {genre} artist known for {keyWorks}. Include questions about their creative process, influences, and {specificTopics}."
  },
  
  // SEO Templates
  {
    id: 9,
    name: "Event SEO Description",
    description: "Create SEO-optimized event descriptions",
    icon: "fas fa-search",
    category: "seo",
    promptTemplate: "Generate an SEO-optimized description for {eventName} happening on {date} at {venue}. Target keywords: {targetKeywords}. Include relevant information about {artists} and the {genre} scene."
  },
  {
    id: 10,
    name: "Artist Bio Optimizer",
    description: "Optimize artist bios for search engines",
    icon: "fas fa-user-edit",
    category: "seo",
    promptTemplate: "Optimize this artist bio for SEO: {existingBio}. Target keywords: {targetKeywords}. Maintain the artist's unique voice while improving searchability."
  },
  {
    id: 11,
    name: "Music Label SEO",
    description: "Optimize record label descriptions for search engines",
    icon: "fas fa-tag",
    category: "seo",
    promptTemplate: "Create an SEO-optimized description for {labelName}, a {genre} record label featuring artists like {featuredArtists}. Target keywords: {targetKeywords}."
  },
  
  // Planning Templates
  {
    id: 12,
    name: "Content Calendar Generator",
    description: "Create a content calendar for upcoming posts",
    icon: "fas fa-calendar-week",
    category: "planning",
    promptTemplate: "Generate a {timeframe} content calendar for our electronic music platform focusing on {contentFocus}. Include {numberOfPosts} post ideas covering {topicAreas} with optimal posting schedules."
  },
  {
    id: 13,
    name: "Event Marketing Plan",
    description: "Create a marketing plan for an electronic music event",
    icon: "fas fa-bullhorn",
    category: "planning",
    promptTemplate: "Create a {timeframe} marketing plan for {eventName} happening on {date}. Include pre-event, during-event, and post-event content ideas targeting {targetAudience}."
  },
  
  // Research Templates
  {
    id: 14,
    name: "Artist Research",
    description: "Gather information about electronic music artists",
    icon: "fas fa-search",
    category: "research",
    promptTemplate: "Research {artistName}, gathering key information about their musical style, notable releases, career highlights, and {specificDetails}. Format as bullet points for easy content creation."
  },
  {
    id: 15,
    name: "Electronic Music Trend Analysis",
    description: "Research current trends in electronic music",
    icon: "fas fa-chart-line",
    category: "research",
    promptTemplate: "Research current trends in {subgenre} electronic music, focusing on {specificAspects}. Identify key artists, upcoming events, and production techniques defining this trend."
  },
  {
    id: 16,
    name: "Cork Music Scene Research",
    description: "Research the electronic music scene in Cork",
    icon: "fas fa-map-marker-alt",
    category: "research",
    promptTemplate: "Research the {subgenre} electronic music scene in Cork, including venues, artists, labels, and events. Focus on {specificAspect} and highlight {relevantTimeframe} developments."
  }
];
