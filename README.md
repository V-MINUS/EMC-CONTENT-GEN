# EMC AI Content Generator

![EMC AI Content Generator Logo](https://img.shields.io/badge/EMC-AI%20Generator-9146FF?style=for-the-badge)

An AI-powered content creation platform built specifically for the Electronic Music Council (EMC). This tool leverages the latest AI technologies to generate high-quality content for social media, video scripts, SEO optimization, and research - all tailored to electronic music culture, events, and artists.

## Features

### 🎵 Electronic Music Focused Content

- **Artist Spotlights:** Feature electronic music artists with their bio, music style, and latest releases
- **Event Announcements:** Promote upcoming EDM events with engaging copy
- **Beat Battle Promotions:** Create compelling posts for music competitions
- **Release Announcements:** Announce new electronic music releases
- **Production Tips:** Share electronic music production techniques

### 🎬 Video Content

- **YouTube Tutorial Scripts:** Create scripts for music production tutorials
- **Event Aftermovie Voiceovers:** Write compelling voiceover text for event recaps
- **Artist Interview Questions:** Generate thoughtful questions for producer interviews

### 🔍 SEO & Research

- **SEO Optimization:** Generate search-friendly content with relevant electronic music keywords
- **Artist Research:** Gather comprehensive info about electronic music artists
- **Trend Analysis:** Research current trends in electronic music
- **Cork Music Scene Research:** Specialized local scene research

### 📆 Content Planning

- **Content Calendar Generator:** Create scheduled content plans
- **Event Marketing Plans:** Develop comprehensive marketing strategies

## Getting Started

### Prerequisites

You'll need:
- Node.js 18.0.0 or later
- API keys for OpenAI and/or Hugging Face (optional)

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
# OpenAI API Key - Get yours at https://platform.openai.com/
OPENAI_API_KEY=your_openai_api_key_here

# Hugging Face API Key - Get yours at https://huggingface.co/settings/tokens
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# AI Provider Preferences
# Options: "openai" or "huggingface"
NEXT_PUBLIC_TEXT_PROVIDER=openai
NEXT_PUBLIC_IMAGE_PROVIDER=huggingface

# Application Settings
NEXT_PUBLIC_APP_NAME="EMC AI Content Generator"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/emc-content-generator.git
cd emc-content-generator

# Install dependencies
npm install
cp .env.example .env.local
```

Edit `.env.local` to add your API keys:

```
OPENAI_API_KEY=your_openai_key_here
HUGGINGFACE_API_KEY=your_huggingface_key_here
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## AI Integration

This project uses:

- **OpenAI API** (GPT-3.5 Turbo & DALL-E) for text and image generation
- **Hugging Face** models as more affordable alternatives

The application is designed to automatically fall back to alternative providers if one fails, ensuring you always get results.

## Deployment

This application can be easily deployed using [Vercel](https://vercel.com), the platform from the creators of Next.js.

```bash
npm install -g vercel
vercel login
vercel
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Electronic Music Council (EMC) for inspiration and use cases
- OpenAI for their powerful language and image generation models
- Hugging Face for their open-source AI models
- Next.js team for the excellent framework
