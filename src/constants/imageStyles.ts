export interface ImageStyle {
  id: string
  name: string
  prompt: string
  description: string
}

export const IMAGE_STYLES: ImageStyle[] = [
  {
    id: 'none',
    name: 'No Style',
    prompt: '',
    description: 'Use your prompt as-is'
  },
  {
    id: 'photorealistic',
    name: 'Photorealistic',
    prompt: 'photorealistic, high quality photography, professional',
    description: 'Realistic photography style'
  },
  {
    id: 'illustration',
    name: 'Illustration',
    prompt: 'modern illustration style, vector art, clean lines',
    description: 'Flat, modern illustrations'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    prompt: 'minimalist design, simple, clean, white space',
    description: 'Simple and clean design'
  },
  {
    id: '3d',
    name: '3D Render',
    prompt: '3D render, octane render, high quality 3D graphics',
    description: '3D rendered graphics'
  },
  {
    id: 'abstract',
    name: 'Abstract',
    prompt: 'abstract art style, geometric shapes, modern',
    description: 'Abstract and geometric'
  },
  {
    id: 'gradient',
    name: 'Gradient',
    prompt: 'colorful gradients, smooth blend, vibrant colors',
    description: 'Vibrant gradient backgrounds'
  },
  {
    id: 'corporate',
    name: 'Corporate',
    prompt: 'professional corporate style, business imagery, clean',
    description: 'Professional business look'
  }
]
