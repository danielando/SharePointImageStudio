# SharePoint Image Studio - Product Requirements Document

## Overview

A SaaS application for Intranet and SharePoint site owners to generate AI-powered images and icons specifically sized for SharePoint web parts. Built on Nano Banana Pro for image generation, with a clean interface inspired by Krea.ai but tailored entirely for the Microsoft 365 ecosystem.

**Target Users:** SharePoint site owners, intranet managers, Microsoft 365 admins, internal comms teams

**Core Value Proposition:** Generate perfectly-sized, on-brand images for SharePoint in seconds without needing design skills or expensive tools.

---

## Generation Types

Replace Krea's generic options (Image, Video, Nano Banana, Realtime, Motion Transfer, 3D Objects, Nodes) with SharePoint-specific asset types:

| Generation Type | Description | Default Dimensions |
|-----------------|-------------|-------------------|
| **Hero Web Part** | Full-width banner images for Hero sections | 2560 x 720px (16:3.2) |
| **Page Header** | Title/header background images | 1920 x 460px |
| **Quick Links Icon** | Square icons for Quick Links web part | 300 x 300px (1:1) |
| **News Thumbnail** | Images for news posts and cards | 1200 x 675px (16:9) |
| **Viva Connections Card** | Dashboard card images | 400 x 200px (2:1) |
| **Team Site Banner** | Site header/banner images | 1920 x 256px |
| **Image Gallery** | Standard gallery images | 1920 x 1080px (16:9) |
| **Custom** | User-defined dimensions | User specified |

Each type should display a visual preview indicator showing the aspect ratio shape.

---

## Core Features

### 1. Clean Generation Interface

**Main Input Area:**
- Large text input field for prompts
- Generation type selector (pill buttons for each SharePoint asset type)
- Aspect ratio automatically set based on generation type (with override option)
- Generate button (prominent, accessible via Enter key)
- Image reference upload area (drag-and-drop or click to upload)

**Prompt Behavior:**
- Enter key triggers generation
- Prompt text and image references persist after generation (don't clear)
- Multiple generations can run in parallel
- Most recent image appears top-left in the canvas grid

### 2. Elements System

Elements are saved image references that can be quickly inserted by typing `@elementname`.

**Element Management:**
- Add Element modal with:
  - Name field
  - Image upload (drag-and-drop or file picker)
  - Color picker (for visual identification in prompts)
  - URL field for fetching images from SharePoint or external URLs
- Edit Element functionality (change name, image, color)
- Delete Element with confirmation
- Elements stored in database with: id, name, image_url, color, created_at

**Element Insertion:**
- Typing `@` triggers element picker dropdown
- Dropdown shows element thumbnail, name, and color indicator
- Selected element appears in prompt with its assigned color
- Multiple elements can be used in a single prompt

**Suggested Default Elements to Pre-populate:**
- @companylogo (placeholder for user's logo)
- @brandcolors (placeholder reference)
- @iconpack (for consistent icon styling)

### 3. SharePoint URL Import (Premium Feature)

Allow users to paste a SharePoint site URL or image library URL to:
- Fetch existing site branding/logo
- Import images from a document library as elements
- Pull site theme colors for prompt context

**API Integration:** Use Microsoft Graph API (requires user auth) or allow manual image URL entry.

### 4. Brand Kit (Future/Premium)

Store brand assets for consistent generation:
- Primary and secondary colors (hex values)
- Logo variations
- Font preferences (for text-on-image generation)
- Brand tone keywords (e.g., "professional", "modern", "approachable")

When generating, user can toggle "Apply Brand Kit" to automatically append brand context to prompts.

### 5. Canvas/Gallery View

**Grid Display:**
- Responsive grid of generated images
- Most recent at top-left
- Hover state shows:
  - Download button
  - Insert into prompt button
  - Copy to clipboard button
  - Delete button
- Click opens full preview modal

**Preview Modal:**
- Full-size image view
- Left/right arrows for navigation (keyboard arrows also work)
- Generation details (prompt used, dimensions, timestamp)
- Action buttons: Download, Insert into Prompt, Copy, Delete
- "Regenerate with same prompt" button

**Drag-and-Drop:**
- Images from the canvas can be dragged into the prompt area as references
- Visual indicator when dragging shows drop zone

### 6. Image Editing/Refinement

After generating an image:
- Keep the reference image and prompt active
- User can type refinements: "make the background darker", "add more contrast", "remove the text"
- Refinements use the previous image as input reference automatically

### 7. Export Options

**Download Formats:**
- PNG (default, best quality)
- JPEG (smaller file size option)
- WebP (modern format)

**SharePoint-Optimized Export:**
- "Copy for SharePoint" button that:
  - Copies image to clipboard in optimal format
  - Shows reminder of recommended upload location
  - Optionally generates multiple sizes for responsive use

---

## Technical Architecture

### Frontend
- React (Next.js or Vite)
- Tailwind CSS for styling
- Framer Motion for animations
- Zustand or React Context for state management

### Backend/API
- Nano Banana Pro API for image generation
- Supabase or Firebase for:
  - User authentication
  - Element storage
  - Generated image storage (or use blob URLs)
  - Usage tracking

### Database Schema

**users**
```
id: uuid (primary key)
email: string
created_at: timestamp
subscription_tier: string (free/pro/team)
monthly_generations: integer
```

**elements**
```
id: uuid (primary key)
user_id: uuid (foreign key)
name: string
image_url: string
color: string (hex)
created_at: timestamp
updated_at: timestamp
```

**generations**
```
id: uuid (primary key)
user_id: uuid (foreign key)
prompt: string
generation_type: string
dimensions: string
image_url: string
element_ids: array (elements used)
created_at: timestamp
```

**brand_kits** (future)
```
id: uuid (primary key)
user_id: uuid (foreign key)
name: string
primary_color: string
secondary_color: string
logo_url: string
tone_keywords: array
created_at: timestamp
```

---

## User Interface Specifications

### Design Direction
- Dark theme (charcoal gray, not pure black)
- Subtle texture/grid pattern on background
- Clean, minimal interface with Microsoft Fluent Design influences
- Purple/blue accent colors (aligns with Microsoft branding)
- Generous whitespace
- Smooth animations on generation and transitions

### Layout Structure

```
+--------------------------------------------------+
|  [Logo] SharePoint Image Studio    [Elements] [?] |
+--------------------------------------------------+
|                                                    |
|  [Hero] [Page Header] [Quick Links] [News] [...]  |  <- Generation type pills
|                                                    |
|  +----------------------------------------------+  |
|  |                                              |  |
|  |  [Prompt input field with @ element support] |  |
|  |                                              |  |
|  |  [Image reference thumbnails]    [Generate]  |  |
|  +----------------------------------------------+  |
|                                                    |
|  +----------------------------------------------+  |
|  |                                              |  |
|  |              Generated Images                |  |
|  |                                              |  |
|  |   [img] [img] [img] [img]                   |  |
|  |   [img] [img] [img] [img]                   |  |
|  |                                              |  |
|  +----------------------------------------------+  |
|                                                    |
+--------------------------------------------------+
```

### Responsive Behavior
- Desktop: Full layout as above
- Tablet: Collapsible elements panel, stacked layout
- Mobile: Single column, generation type as dropdown

---

## API Integration

### Nano Banana Pro

**Endpoint:** Use the Nano Banana Pro API via the recommended integration method.

**Request Structure:**
```javascript
{
  prompt: string,
  aspect_ratio: string, // "16:9", "1:1", etc.
  image_references: array, // base64 or URLs
  model: "nano-banana-pro"
}
```

**Rate Limiting:**
- Free tier: 20 generations/day
- Pro tier: 500 generations/month
- Team tier: Unlimited (fair use)

### Microsoft Graph API (Optional Premium Feature)

For SharePoint integration:
- Authenticate with Microsoft 365 account
- Fetch site branding and themes
- Access document libraries for image import

---

## Pricing Model (Suggested)

| Tier | Price | Inclusions |
|------|-------|------------|
| Free | $0 | 20 generations/day, 5 elements, watermark |
| Pro | $19/month | 500 generations/month, unlimited elements, no watermark, brand kit |
| Team | $49/month | Unlimited generations, team sharing, brand kit, priority support |

---

## MVP Scope (Phase 1)

Build these features first:

1. ✅ Generation interface with prompt input
2. ✅ SharePoint asset type selector (Hero, Quick Links, News, Page Header, Custom)
3. ✅ Nano Banana Pro integration
4. ✅ Canvas/gallery view with download
5. ✅ Elements system (add, edit, delete, @ mention)
6. ✅ Image reference upload (drag-and-drop)
7. ✅ Drag from canvas into prompt
8. ✅ Parallel generation (multiple at once)
9. ✅ Keyboard navigation (Enter to generate, arrows in preview)
10. ✅ Basic auth (email/password or magic link)

**Defer to Phase 2:**
- SharePoint URL import
- Brand Kit
- Team sharing
- Microsoft Graph integration
- Advanced export options

---

## Success Metrics

- Time to first generation < 2 minutes from signup
- Average generations per user per session > 5
- User retention at 30 days > 40%
- Net Promoter Score > 50

---

## Prompts for Claude Code

### Initial Build Prompt

```
Build a web application called "SharePoint Image Studio" - an AI image generator specifically for SharePoint site owners.

**Tech Stack:**
- React (Vite) with TypeScript
- Tailwind CSS for styling
- Supabase for auth and database
- Nano Banana Pro API for image generation

**Core Features to Implement:**

1. **Generation Types** - Pill/tab selector for:
   - Hero Web Part (2560x720)
   - Page Header (1920x460)  
   - Quick Links Icon (300x300)
   - News Thumbnail (1200x675)
   - Viva Connections Card (400x200)
   - Team Site Banner (1920x256)
   - Image Gallery (1920x1080)
   - Custom (user inputs dimensions)

2. **Prompt Interface:**
   - Large text input field
   - Image reference upload area (drag-and-drop)
   - Generate button (also triggered by Enter key)
   - Prompt and references persist after generation (don't clear)

3. **Elements System:**
   - Add Element modal: name, image upload, color picker
   - Elements stored in database
   - Type @ in prompt to trigger element dropdown
   - Element names appear in their assigned color in the prompt
   - Edit and delete elements

4. **Canvas/Gallery:**
   - Responsive grid of generated images
   - Most recent at top-left
   - Hover shows: Download, Insert to Prompt, Delete buttons
   - Click opens full preview with left/right navigation
   - Keyboard arrows work in preview
   - Drag images from canvas into prompt as references

5. **Parallel Generation:**
   - Multiple generations can run simultaneously
   - Each shows loading state independently
   - Results appear in grid as they complete

**Design:**
- Dark charcoal theme (not pure black)
- Subtle grid/texture background
- Microsoft Fluent-inspired with purple/blue accents
- Clean, minimal, professional
- Smooth animations

**Database Tables (Supabase):**
- users: id, email, created_at
- elements: id, user_id, name, image_url, color, created_at
- generations: id, user_id, prompt, generation_type, dimensions, image_url, created_at

Look up Nano Banana Pro documentation and implement the API integration properly.
```

---

## Reference Screenshots

The PRD references the Krea.ai interface patterns:
- Clean prompt input with aspect ratio selector
- Generation type tabs/pills
- Elements popup triggered by @ symbol
- Grid canvas for generated images
- Modal preview with navigation

Adapt these patterns for the SharePoint use case with appropriate asset types and dimensions.

---

## Notes for Development

1. **Start Simple:** Get generation working first with one asset type, then expand
2. **Test Dimensions:** Verify generated images actually work well in SharePoint web parts
3. **Performance:** Lazy load images in the canvas, implement virtual scrolling for large collections
4. **Error Handling:** Graceful failures when API is slow or unavailable
5. **Onboarding:** First-time users should see example generations and suggested prompts

---

*PRD Version 1.0 | January 2026 | ShiftF5 Consulting*
