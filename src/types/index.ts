export interface GenerationType {
  id: string
  name: string
  dimensions: {
    width: number
    height: number
  }
  aspectRatio: string
  description: string
}

export const GENERATION_TYPES: GenerationType[] = [
  {
    id: 'hero',
    name: 'Hero Web Part (Layers)',
    dimensions: { width: 1920, height: 1080 },
    aspectRatio: '16:9',
    description: 'Full-width banner images for Hero Layers layout'
  },
  {
    id: 'hero-tiles',
    name: 'Hero Web Part (Tiles)',
    dimensions: { width: 1600, height: 1200 },
    aspectRatio: '4:3',
    description: 'Images for Hero Tiles layout'
  },
  {
    id: 'page-header',
    name: 'Page Header',
    dimensions: { width: 1920, height: 460 },
    aspectRatio: '16:3.8',
    description: 'Title/header background images'
  },
  {
    id: 'quick-links',
    name: 'Quick Links Icon',
    dimensions: { width: 300, height: 300 },
    aspectRatio: '1:1',
    description: 'Square icons for Quick Links web part'
  },
  {
    id: 'news',
    name: 'News Thumbnail',
    dimensions: { width: 1200, height: 675 },
    aspectRatio: '16:9',
    description: 'Images for news posts and cards'
  },
  {
    id: 'viva',
    name: 'Viva Connections Card',
    dimensions: { width: 400, height: 200 },
    aspectRatio: '2:1',
    description: 'Dashboard card images'
  },
  {
    id: 'team-banner',
    name: 'Team Site Banner',
    dimensions: { width: 2560, height: 164 },
    aspectRatio: '15.6:1',
    description: 'Site header background images'
  },
  {
    id: 'gallery',
    name: 'Image Gallery',
    dimensions: { width: 1920, height: 1080 },
    aspectRatio: '16:9',
    description: 'Standard gallery images'
  },
  {
    id: 'custom',
    name: 'Custom',
    dimensions: { width: 1920, height: 1080 },
    aspectRatio: 'custom',
    description: 'User-defined dimensions'
  }
]

export interface Element {
  id: string
  user_id: string
  name: string
  image_url: string
  color: string
  created_at: string
  updated_at: string
}

export interface Generation {
  id: string
  user_id: string
  prompt: string
  generation_type: string
  dimensions: string
  image_url: string
  element_ids: string[]
  created_at: string
  status?: 'pending' | 'generating' | 'completed' | 'failed'
}

export interface ImageReference {
  id: string
  url: string
  file?: File
}
