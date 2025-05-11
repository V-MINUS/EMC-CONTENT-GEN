// Enhanced templates for the EMC Content Generator
// Providing 40+ templates as requested

import { ContentTemplate, SocialPlatform, contentTones } from '../lib/ai-services';

// Social Media Platforms with enhanced options
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
  },
  {
    id: 6,
    name: "YouTube",
    icon: "fab fa-youtube",
    characterLimit: 5000,
    imageRequired: true
  },
  {
    id: 7,
    name: "Snapchat",
    icon: "fab fa-snapchat",
    characterLimit: 250,
    imageRequired: true
  },
  {
    id: 8,
    name: "Pinterest",
    icon: "fab fa-pinterest",
    characterLimit: 500,
    imageRequired: true
  },
  {
    id: 9,
    name: "Twitch",
    icon: "fab fa-twitch",
    characterLimit: null,
    imageRequired: false
  },
  {
    id: 10,
    name: "SoundCloud",
    icon: "fab fa-soundcloud",
    characterLimit: 5000,
    imageRequired: false
  }
];

// Tool categories - expanded
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
    id: 'blog',
    name: 'Blog Writing',
    icon: 'fas fa-blog',
    description: 'Create compelling blog articles and content'
  },
  {
    id: 'email',
    name: 'Email Marketing',
    icon: 'fas fa-envelope',
    description: 'Compose marketing emails and newsletters'
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
  },
  {
    id: 'advertising',
    name: 'Ad Copy',
    icon: 'fas fa-ad',
    description: 'Write compelling ad copy for paid campaigns'
  },
  {
    id: 'event',
    name: 'Event Marketing',
    icon: 'fas fa-ticket-alt',
    description: 'Create content for promoting music events and festivals'
  },
  {
    id: 'product',
    name: 'Product Descriptions',
    icon: 'fas fa-tags',
    description: 'Write descriptions for merchandise and products'
  }
];

// Over 40 content templates covering all categories
export const enhancedTemplates: ContentTemplate[] = [
  // SOCIAL MEDIA TEMPLATES
  {
    id: 1,
    name: "Artist Spotlight",
    description: "Feature an artist with their bio, music style, and latest releases",
    icon: "fas fa-user-circle",
    category: "social",
    promptTemplate: "Create a social media post highlighting the electronic music artist {artistName}. Include their background, music style ({genre}), and mention their latest release {latestRelease}. Make it engaging and include relevant hashtags."
  },
  {
    id: 2,
    name: "Event Announcement",
    description: "Announce an upcoming electronic music event or festival",
    icon: "fas fa-calendar-day",
    category: "social",
    promptTemplate: "Create an exciting announcement for the electronic music event {eventName} happening on {date} at {venue}. The event will feature headliner {headliner} with support from {supportActs} playing {genre} music. Tickets are {ticketPrice}. {extraFeatures} Include a call-to-action to buy tickets and relevant hashtags."
  },
  {
    id: 3,
    name: "Track Release",
    description: "Announce a new music release",
    icon: "fas fa-music",
    category: "social",
    promptTemplate: "Announce the new track release '{trackName}' by {artistName}. The track is a {genre} style production with {trackDescription}. It's available on {platforms}. Include relevant hashtags and a call-to-action to listen to the track."
  },
  {
    id: 4,
    name: "Music Production Tip",
    description: "Share a helpful tip for electronic music production",
    icon: "fas fa-sliders-h",
    category: "social",
    promptTemplate: "Create a helpful tip for electronic music producers about {productionTopic}. Explain how this technique can improve their {benefitArea} and mention what genre it's most useful for. Keep it concise and include relevant hashtags."
  },
  {
    id: 5,
    name: "Industry News Update",
    description: "Share news about the electronic music industry",
    icon: "fas fa-newspaper",
    category: "social",
    promptTemplate: "Create a social media post about this recent electronic music industry news: {newsItem}. Explain why this matters for {audience} and what it might mean for the future of electronic music. Include relevant hashtags."
  },
  {
    id: 6,
    name: "Venue Spotlight",
    description: "Feature a venue that hosts electronic music events",
    icon: "fas fa-map-marker-alt",
    category: "social",
    promptTemplate: "Create a spotlight post featuring {venueName}, a venue known for electronic music events. Describe its atmosphere, famous nights hosted there ({famousEvents}), and its importance to the {localCity} electronic music scene. Include relevant hashtags."
  },
  {
    id: 7,
    name: "Throwback Thursday",
    description: "Nostalgic post about electronic music history",
    icon: "fas fa-history",
    category: "social",
    promptTemplate: "Create a Throwback Thursday post about {historicTopic} from {year} in electronic music history. Explain its significance, how it influenced current electronic music, and why it's worth remembering. Include nostalgic hashtags."
  },
  {
    id: 8,
    name: "Community Poll",
    description: "Create an engaging poll for your audience",
    icon: "fas fa-poll",
    category: "social",
    promptTemplate: "Create an engaging poll for electronic music fans about {pollTopic}. Include 3-4 interesting options related to {subtopic} and write a compelling question to maximize engagement. Add relevant hashtags."
  },
  {
    id: 9,
    name: "Festival Survival Guide",
    description: "Tips for attending electronic music festivals",
    icon: "fas fa-campground",
    category: "social",
    promptTemplate: "Create a helpful post with essential survival tips for attending {festivalName} or similar electronic music festivals. Include advice about {specificTopic} and other crucial information for festival-goers. Add relevant hashtags."
  },
  {
    id: 10,
    name: "Gear Review",
    description: "Brief review of music production gear",
    icon: "fas fa-keyboard",
    category: "social",
    promptTemplate: "Create a concise review of the {productName} for electronic music production. Highlight its key features, how it can be used for {musicGenre} production, and give it a rating out of 10. Include relevant hashtags."
  },
  
  // VIDEO CONTENT TEMPLATES
  {
    id: 11,
    name: "YouTube Tutorial Script",
    description: "Script for a tutorial video on electronic music production",
    icon: "fas fa-video",
    category: "video",
    promptTemplate: "Write a script for a YouTube tutorial on how to {tutorialTopic} in electronic music production. Include an engaging introduction, step-by-step instructions, pro tips, and a conclusion with call-to-action. The tutorial should be aimed at {audienceLevel} producers."
  },
  {
    id: 12,
    name: "Artist Interview Questions",
    description: "Questions for interviewing an electronic music artist",
    icon: "fas fa-microphone",
    category: "video",
    promptTemplate: "Create a set of 10 interesting interview questions for electronic music artist {artistName} who specializes in {genre}. Include questions about their production process, influences, recent release '{recentWork}', and future plans. These questions should reveal insights that fans would find fascinating."
  },
  {
    id: 13,
    name: "Music Video Concept",
    description: "Creative concept for an electronic music video",
    icon: "fas fa-film",
    category: "video",
    promptTemplate: "Develop a creative concept for a music video for the electronic track '{trackName}' by {artistName}. The track has a {mood} vibe with elements of {genre}. Include visual themes, storyline ideas, location suggestions, and special effects that would complement the music."
  },
  {
    id: 14,
    name: "Video Title & Description",
    description: "SEO-optimized title and description for a music video",
    icon: "fas fa-heading",
    category: "video",
    promptTemplate: "Create a YouTube-optimized title and description for a video about {videoTopic} in electronic music. The video features {keyElements} and is targeted at {targetAudience}. Include relevant tags and keywords for maximum discovery."
  },
  {
    id: 15,
    name: "Studio Tour Script",
    description: "Script for a tour of a music production studio",
    icon: "fas fa-door-open",
    category: "video",
    promptTemplate: "Write a script for a video tour of an electronic music production studio. Include sections on the {gearType} setup, acoustic treatment, workflow optimization, and special features of the studio. Make it educational for aspiring producers who want to build their own studios."
  },
  
  // BLOG TEMPLATES
  {
    id: 16,
    name: "Production Technique Article",
    description: "In-depth article on a production technique",
    icon: "fas fa-file-alt",
    category: "blog",
    promptTemplate: "Write a detailed blog article about {technique} technique in electronic music production. Include its history, how it works technically, examples of its use in famous tracks, step-by-step instructions for beginners, and advanced tips. Target word count: 1200-1500 words."
  },
  {
    id: 17,
    name: "Artist Profile",
    description: "Comprehensive profile of an electronic music artist",
    icon: "fas fa-id-card",
    category: "blog",
    promptTemplate: "Write a comprehensive artist profile for electronic music artist {artistName}. Include their background, musical journey, key releases, production style, influences, achievements, and impact on the {genre} scene. Also include a quote about their artistic philosophy. Target word count: 1000-1200 words."
  },
  {
    id: 18,
    name: "Genre Deep Dive",
    description: "Exploration of an electronic music genre",
    icon: "fas fa-music",
    category: "blog",
    promptTemplate: "Write a deep dive analysis of the {genre} electronic music genre. Cover its origins, defining characteristics, key artists, classic tracks, evolution over time, and current state. Include subgenres and fusion styles. Make it educational but accessible. Target word count: 1500-2000 words."
  },
  {
    id: 19,
    name: "Festival Review",
    description: "Review of an electronic music festival",
    icon: "fas fa-star",
    category: "blog",
    promptTemplate: "Write a comprehensive review of the {festivalName} electronic music festival. Include highlights from performances by {headliners}, production quality, venue assessment, crowd atmosphere, and organization. Rate different aspects and give an overall score. Target word count: 1200-1500 words."
  },
  {
    id: 20,
    name: "Industry Trends Analysis",
    description: "Analysis of trends in the electronic music industry",
    icon: "fas fa-chart-line",
    category: "blog",
    promptTemplate: "Write an analytical blog post about current trends in the electronic music industry, focusing on {specificTrend}. Discuss how these trends are affecting artists, labels, and fans. Include expert insights, statistics if applicable, and predictions for the future. Target word count: 1200-1500 words."
  },
  
  // EMAIL MARKETING TEMPLATES
  {
    id: 21,
    name: "Event Invitation Email",
    description: "Email inviting subscribers to an electronic music event",
    icon: "fas fa-envelope-open",
    category: "email",
    promptTemplate: "Write an email inviting subscribers to attend {eventName}, an electronic music event on {date} at {venue}. Feature artists {artistLineup}, highlight the unique aspects of this event, and include clear ticket information and a strong call-to-action. The email should be exciting but concise."
  },
  {
    id: 22,
    name: "New Release Announcement",
    description: "Email announcing a new music release",
    icon: "fas fa-compact-disc",
    category: "email",
    promptTemplate: "Write an email announcing the release of '{releaseName}' by {artistName}. Describe the release's style ({genre}), highlight standout tracks, mention available platforms, and include quotes from the artist about the creative process. Add a clear call-to-action to stream or purchase."
  },
  {
    id: 23,
    name: "Monthly Newsletter",
    description: "Monthly roundup of electronic music news and updates",
    icon: "fas fa-newspaper",
    category: "email",
    promptTemplate: "Create a monthly electronic music newsletter for {month}. Include sections for: new releases, upcoming events, artist spotlights, industry news, and a featured production tip. Keep each section concise but informative and include relevant links throughout."
  },
  {
    id: 24,
    name: "Course or Workshop Promotion",
    description: "Email promoting an educational offering",
    icon: "fas fa-graduation-cap",
    category: "email",
    promptTemplate: "Write a promotional email for the {courseName} electronic music production course/workshop. Highlight the key skills participants will learn, instructor credentials, schedule details, pricing, and exclusive bonuses. Include testimonials and a strong enrollment call-to-action with deadline."
  },
  {
    id: 25,
    name: "Community Survey Email",
    description: "Email requesting feedback from your community",
    icon: "fas fa-comment-dots",
    category: "email",
    promptTemplate: "Create an email asking your electronic music community for feedback on {topicForFeedback}. Explain why their input matters, what you'll do with the information, and how long the survey will take. Make the request friendly but compelling, and offer an incentive for completion if applicable."
  },
  
  // SEO TEMPLATES
  {
    id: 26,
    name: "Keyword Research Plan",
    description: "Strategic keyword plan for electronic music content",
    icon: "fas fa-key",
    category: "seo",
    promptTemplate: "Create a keyword research plan for content about {contentTopic} in electronic music. Include primary keywords, secondary keywords, long-tail variations, semantic related terms, and keyword difficulty estimates. Group keywords by user intent and suggest content types for each group."
  },
  {
    id: 27,
    name: "SEO-Optimized Blog Post",
    description: "Blog post structured for search engines",
    icon: "fas fa-search-plus",
    category: "seo",
    promptTemplate: "Write an SEO-optimized blog post about {topic} in electronic music. Target the keyword '{primaryKeyword}' and related terms. Include an optimized title, meta description, headings with keywords, internal linking suggestions, and a content structure following SEO best practices. Word count: 1200-1500 words."
  },
  {
    id: 28,
    name: "Meta Descriptions Generator",
    description: "Generate meta descriptions for electronic music content",
    icon: "fas fa-tags",
    category: "seo",
    promptTemplate: "Create 5 alternative meta descriptions for content about {contentTopic} targeting the keyword '{targetKeyword}'. Each description should be under 160 characters, include the keyword naturally, communicate value, and contain a call-to-action. Make each one unique in approach and compelling."
  },
  {
    id: 29,
    name: "Content Cluster Plan",
    description: "Pillar and cluster content strategy",
    icon: "fas fa-sitemap",
    category: "seo",
    promptTemplate: "Develop a content cluster plan for the topic of {mainTopic} in electronic music. Create one pillar content idea and 8-10 cluster content ideas that support it. For each, include a proposed title, target keywords, brief description, and how they interlink. Structure this for maximum SEO benefit."
  },
  {
    id: 30,
    name: "FAQ Schema Content",
    description: "FAQ content optimized for schema markup",
    icon: "fas fa-question-circle",
    category: "seo",
    promptTemplate: "Create 10 FAQ questions and answers about {topic} in electronic music for schema markup. Each question should target long-tail keywords or common queries. Answers should be comprehensive yet concise (2-3 sentences each), factually accurate, and optimized for featured snippets."
  },
  
  // CONTENT PLANNING TEMPLATES
  {
    id: 31,
    name: "Monthly Content Calendar",
    description: "Plan a month of electronic music content",
    icon: "fas fa-calendar-alt",
    category: "planning",
    promptTemplate: "Create a 30-day content calendar for an electronic music brand focusing on {contentFocus}. Include a mix of content types (social posts, blog articles, videos, emails) with specific topic ideas for each day, optimal posting times, platform recommendations, and content themes tied to industry events or trends for {month}."
  },
  {
    id: 32,
    name: "Content Strategy Document",
    description: "Comprehensive content strategy",
    icon: "fas fa-chess",
    category: "planning",
    promptTemplate: "Develop a comprehensive content strategy for an electronic music {businessType} focusing on {primaryGoal}. Include target audience personas, content pillars, channel strategy, content types, voice and tone guidelines, resource requirements, KPIs, and a quarterly roadmap."
  },
  {
    id: 33,
    name: "Launch Campaign Plan",
    description: "Content plan for a music or product launch",
    icon: "fas fa-rocket",
    category: "planning",
    promptTemplate: "Create a launch campaign content plan for a new {launchType} in electronic music. Build a timeline with pre-launch, launch day, and post-launch content across all channels. Include content types, messaging strategy, promotional tactics, influencer integration ideas, and key metrics to track success."
  },
  {
    id: 34,
    name: "Seasonal Content Plan",
    description: "Content ideas tied to seasonal events",
    icon: "fas fa-snowflake",
    category: "planning",
    promptTemplate: "Develop a seasonal content plan for {season/holiday} themed electronic music content. Include content ideas across formats (social, blog, email, video), tie-ins with seasonal music events or releases, promotional opportunities, and a timeline for creation and publishing."
  },
  {
    id: 35,
    name: "Audience Growth Strategy",
    description: "Content plan focused on growing audience",
    icon: "fas fa-users",
    category: "planning",
    promptTemplate: "Create a content strategy specifically designed to grow an electronic music {channelType} audience from {currentSize} to {targetSize}. Include content formats that drive discovery, engagement tactics, collaboration ideas, posting frequency, and metrics to track growth progress."
  },
  
  // RESEARCH TEMPLATES
  {
    id: 36,
    name: "Artist Research",
    description: "Gather information about electronic music artists",
    icon: "fas fa-search",
    category: "research",
    promptTemplate: "Research and compile key information about electronic music artist {artistName}. Include their background, discography highlights, signature sound, label affiliations, notable performances, social media presence, collaborations, and recent news. Format this information in a structured, easy-to-reference way."
  },
  {
    id: 37,
    name: "Genre Analysis",
    description: "Research a specific electronic music genre",
    icon: "fas fa-headphones",
    category: "research",
    promptTemplate: "Research and provide a comprehensive analysis of the {genreName} electronic music genre. Include its origins, defining characteristics, pioneering artists, landmark tracks, evolution over time, current state, regional variations, and influence on other genres."
  },
  {
    id: 38,
    name: "Venue Information",
    description: "Research on electronic music venues",
    icon: "fas fa-map-marked",
    category: "research",
    promptTemplate: "Research and compile detailed information about {venueName}, an electronic music venue. Include location details, capacity, sound system specifications, types of events typically hosted, resident DJs or promoters, historical significance in the scene, and recent notable events."
  },
  {
    id: 39,
    name: "Festival Research",
    description: "Comprehensive details on music festivals",
    icon: "fas fa-ticket-alt",
    category: "research",
    promptTemplate: "Research and compile comprehensive information about the {festivalName} electronic music festival. Include its history, location, typical dates, capacity, genre focus, notable past lineups, ticketing tiers, camping/accommodation options, stages, and unique features."
  },
  {
    id: 40,
    name: "Industry Trend Report",
    description: "Research on current electronic music trends",
    icon: "fas fa-chart-line",
    category: "research",
    promptTemplate: "Research and create a report on current trends in the electronic music industry regarding {trendArea}. Include statistical data where available, expert opinions, case studies of successful examples, emerging patterns, and predictions for how this trend will evolve over the next year."
  },
  
  // ADVERTISING TEMPLATES
  {
    id: 41,
    name: "Social Media Ad Copy",
    description: "Copy for paid social media advertisements",
    icon: "fas fa-ad",
    category: "advertising",
    promptTemplate: "Write ad copy for a {platformName} campaign promoting {productOrEvent} to electronic music fans. Include primary headline (max 40 characters), secondary headline (max 40 characters), main text (max 125 characters), and call-to-action. Create 3 variations with different angles but consistent messaging."
  },
  {
    id: 42,
    name: "Google Ads Copy",
    description: "Search ad copy for Google Ads",
    icon: "fab fa-google",
    category: "advertising",
    promptTemplate: "Create Google Ads copy for {productOrService} related to electronic music. Include 3 headline variations (max 30 characters each), 2 description variations (max 90 characters each), and a display URL. Target the keywords: {targetKeywords}. Focus on unique selling points and clear calls to action."
  },
  {
    id: 43,
    name: "Event Promotional Copy",
    description: "Promotional copy for electronic music events",
    icon: "fas fa-calendar-day",
    category: "advertising",
    promptTemplate: "Write promotional ad copy for the electronic music event {eventName} featuring {headliners}. Create compelling headlines, descriptive body copy highlighting the unique experience, practical details (date, venue, ticket info), and urgent call-to-action. Design versions for both print and digital advertising."
  },
  {
    id: 44,
    name: "Audio Ad Script",
    description: "Script for audio advertisements",
    icon: "fas fa-microphone-alt",
    category: "advertising",
    promptTemplate: "Write a 30-second audio ad script promoting {productOrEvent} to electronic music fans. Include attention-grabbing opening, key selling points, clear call-to-action, and website or social handle. The tone should be {adTone} and feature sound effect suggestions if relevant. Word count: approximately 75-85 words."
  },
  {
    id: 45,
    name: "Remarketing Ad Copy",
    description: "Ads targeting previous visitors",
    icon: "fas fa-redo",
    category: "advertising",
    promptTemplate: "Create remarketing ad copy for visitors who viewed {productOrEvent} but didn't convert. Write headlines and descriptions that address potential objections, create urgency, offer new information or incentives, and provide a compelling reason to return. Create versions for both display and social remarketing."
  },
  
  // EVENT MARKETING TEMPLATES
  {
    id: 46,
    name: "Event Press Release",
    description: "Professional press release for music events",
    icon: "fas fa-newspaper",
    category: "event",
    promptTemplate: "Write a press release announcing the electronic music event {eventName} on {eventDate}. Include a compelling headline, strong lead paragraph with the 5 Ws, quotes from organizers, details about performers and special features, practical information, boilerplate about the organizers, and media contact information."
  },
  {
    id: 47,
    name: "Festival Announcement",
    description: "Announcement copy for a music festival",
    icon: "fas fa-bullhorn",
    category: "event",
    promptTemplate: "Create an official announcement for {festivalName}, including dates, location, headliners, ticket information, and unique festival features. The tone should capture the excitement and anticipation while providing all essential details that potential attendees need to know."
  },
  {
    id: 48,
    name: "Event Social Media Campaign",
    description: "Series of posts promoting an event",
    icon: "fas fa-share-alt",
    category: "event",
    promptTemplate: "Develop a series of 5 social media posts to promote {eventName} over the weeks leading up to the event. Each post should focus on a different aspect (announcement, artist spotlight, venue highlight, ticket promotion, final reminder) with appropriate hashtags, engaging hooks, and escalating urgency."
  },
  {
    id: 49,
    name: "Venue Partnership Proposal",
    description: "Proposal for venue collaboration",
    icon: "fas fa-handshake",
    category: "event",
    promptTemplate: "Write a professional partnership proposal from an electronic music promoter to {venueName}. Include the concept for the {eventSeries}, target audience, marketing plan, technical requirements, proposed revenue split, promotional commitments, and reasons why this partnership would benefit the venue."
  },
  {
    id: 50,
    name: "Aftermovie Script",
    description: "Script for event aftermovie",
    icon: "fas fa-film",
    category: "event",
    promptTemplate: "Create a script for a 2-3 minute aftermovie for {eventName} electronic music event. Include sections for intro, event highlights, crowd moments, artist performances, special features, testimonials, and closing with future event information. Suggest music pacing, voiceover content if applicable, and key moments to feature."
  }
];

// Export the enhanced templates
export default enhancedTemplates;
