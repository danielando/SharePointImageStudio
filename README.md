# SharePoint Image Studio

AI-powered image generator specifically designed for SharePoint site owners. Generate perfectly-sized images for Hero web parts, Quick Links, News thumbnails, and more using Nano Banana Pro.

## Features

✅ **Generation Types** - Pre-configured dimensions for:
- Hero Web Part (2560×720)
- Page Header (1920×460)
- Quick Links Icon (300×300)
- News Thumbnail (1200×675)
- Viva Connections Card (400×200)
- Team Site Banner (1920×256)
- Image Gallery (1920×1080)
- Custom dimensions

✅ **Elements System** - Save brand assets and reference them in prompts using `@elementname`

✅ **Parallel Generation** - Generate multiple images simultaneously

✅ **Image References** - Upload reference images via drag-and-drop

✅ **Keyboard Navigation** - Enter to generate, arrow keys in preview

✅ **Clean Interface** - Dark theme with Microsoft Fluent-inspired design

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Backend**: Supabase (Auth + Database + Storage)
- **AI**: Nano Banana Pro (via Novita AI API)

## Setup Instructions

### 1. Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Supabase account
- Nano Banana Pro API key (from Novita AI)

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase-schema.sql`
3. Get your project URL and anon key from Settings > API

### 4. Get Nano Banana Pro API Key

1. Sign up at [Novita AI](https://novita.ai)
2. Navigate to API Keys section
3. Create a new API key
4. Copy the key for use in environment variables

### 5. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_NANO_BANANA_API_KEY=your_nano_banana_api_key
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

### Getting Started

1. **Sign Up/Sign In** - Create an account or sign in with email/password or magic link
2. **Select Generation Type** - Choose the SharePoint asset type you want to create
3. **Enter Prompt** - Describe the image you want to generate
4. **Add References** (Optional) - Upload reference images via drag & drop
5. **Generate** - Press Enter or click the Generate button

### Using Elements

Elements allow you to save brand assets and quickly reference them in prompts:

1. Click **Elements** button in the header
2. Click **Add New Element**
3. Upload an image and assign a name and color
4. Type `@` in the prompt to insert the element

Example prompt:
```
Modern office workspace with @companylogo in the corner, bright and professional
```

### Keyboard Shortcuts

- `Enter` - Generate image (when in prompt field)
- `@` - Trigger element picker
- `←` / `→` - Navigate between images in preview
- `Esc` - Close preview modal

### Downloading Images

1. Hover over an image in the gallery
2. Click the download icon
3. Image will be saved with SharePoint-optimized naming

## Project Structure

```
sharepoint-image-studio/
├── src/
│   ├── components/
│   │   ├── Auth.tsx                 # Authentication UI
│   │   ├── GenerationTypeSelector.tsx
│   │   ├── PromptInput.tsx
│   │   ├── ElementsModal.tsx
│   │   └── ImageCanvas.tsx
│   ├── lib/
│   │   └── supabase.ts              # Supabase client
│   ├── services/
│   │   └── nanoBanana.ts            # AI generation API
│   ├── store/
│   │   └── useStore.ts              # Zustand state management
│   ├── types/
│   │   └── index.ts                 # TypeScript types
│   ├── App.tsx                      # Main app component
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Global styles
├── supabase-schema.sql              # Database schema
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Database Schema

### Tables

- **users** - User accounts and subscription info
- **elements** - Saved brand assets and references
- **generations** - Generated image history

### Storage

- **elements** bucket - Stores uploaded element images

## API Integration

### Nano Banana Pro

The app uses the Novita AI API for image generation:

- Endpoint: `https://api.novita.ai/v3/async/txt2img`
- Model: `nai-diffusion-furry_v13422`
- Polling interval: 2 seconds
- Timeout: 120 seconds (60 attempts)

## Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` folder.

### Deploy to Vercel

```bash
npm i -g vercel
vercel
```

### Deploy to Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

### Environment Variables

Make sure to add all environment variables to your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_NANO_BANANA_API_KEY`

## Roadmap

### Phase 2 Features
- SharePoint URL import (fetch existing branding)
- Brand Kit (store and apply brand colors/logos)
- Team sharing and collaboration
- Microsoft Graph API integration
- Advanced export options (multiple formats, sizes)
- Usage analytics and limits

## Troubleshooting

### "Failed to generate image"

- Check that your Nano Banana API key is valid
- Ensure you have sufficient API credits
- Check browser console for detailed error messages

### Images not loading

- Verify Supabase storage bucket is public
- Check Row Level Security policies are correctly set
- Ensure storage policies allow public read access

### Authentication not working

- Confirm Supabase URL and anon key are correct
- Check that email confirmation is disabled (or handle confirmation emails)
- Verify RLS policies are in place

## Contributing

This is an MVP. Contributions welcome! Please open an issue or PR.

## License

MIT

---

*Built with [Claude Code](https://claude.com/claude-code) | ShiftF5 Consulting | January 2026*
