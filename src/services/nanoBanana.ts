// Nano Banana (Google Gemini) API Integration
// Documentation: https://ai.google.dev/gemini-api/docs/image-generation

const API_KEY = import.meta.env.VITE_NANO_BANANA_API_KEY
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'
const MODEL = 'gemini-3-pro-image-preview' // Nano Banana - actual model name

type ImageSize = '1K' | '2K' | '4K'

interface GenerateImageRequest {
  prompt: string
  width: number
  height: number
  imageReferences?: string[] // base64 or URLs
  imageSize?: ImageSize // Output resolution: 1K, 2K, or 4K (default: 2K)
}

export async function generateImage(params: GenerateImageRequest): Promise<string> {
  try {
    const imageSize = params.imageSize || '2K' // Default to 2K resolution

    console.log('🚀 Starting Nano Banana (Gemini) image generation...')
    console.log('API Key present:', !!API_KEY)
    console.log('Prompt:', params.prompt)
    console.log('Dimensions:', params.width, 'x', params.height)
    console.log('Resolution:', imageSize)

    if (!API_KEY) {
      throw new Error('VITE_NANO_BANANA_API_KEY environment variable is not set. Please add your Google Gemini API key to your environment variables.')
    }

    // Add dimension information to the prompt to guide the AI
    // Since Gemini doesn't support explicit dimension control, we add it as context
    const aspectRatio = (params.width / params.height).toFixed(2)
    let dimensionHint = ''

    if (params.width === params.height) {
      dimensionHint = 'square format (1:1 aspect ratio)'
    } else if (params.width > params.height) {
      dimensionHint = `wide horizontal format (${aspectRatio}:1 aspect ratio, ${params.width}x${params.height})`
    } else {
      dimensionHint = `tall vertical format (1:${(params.height / params.width).toFixed(2)} aspect ratio, ${params.width}x${params.height})`
    }

    const fullPrompt = `${params.prompt}. Image should be in ${dimensionHint}.`

    // Build parts array with text and optional images
    const parts: any[] = []

    // Add reference images first if provided
    if (params.imageReferences && params.imageReferences.length > 0) {
      console.log(`📸 Including ${params.imageReferences.length} reference image(s)`)
      for (const imageRef of params.imageReferences) {
        // Extract base64 data and mime type from data URL
        const matches = imageRef.match(/^data:([^;]+);base64,(.+)$/)
        if (matches) {
          parts.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2]
            }
          })
        }
      }
    }

    // Add text prompt
    parts.push({
      text: fullPrompt
    })

    // Calculate aspect ratio for imageConfig
    const getAspectRatio = (w: number, h: number): string => {
      const ratio = w / h
      // Map to supported aspect ratios: 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9
      if (Math.abs(ratio - 1) < 0.1) return '1:1'
      if (Math.abs(ratio - 4/3) < 0.1) return '4:3'
      if (Math.abs(ratio - 3/4) < 0.1) return '3:4'
      if (Math.abs(ratio - 3/2) < 0.1) return '3:2'
      if (Math.abs(ratio - 2/3) < 0.1) return '2:3'
      if (Math.abs(ratio - 16/9) < 0.2) return '16:9'
      if (Math.abs(ratio - 9/16) < 0.2) return '9:16'
      // For very wide ratios (2:1, 4:1, etc.), use 21:9 as it's the widest supported
      if (ratio >= 2) return '21:9'
      if (ratio > 1) return '16:9' // Default wide
      return '9:16' // Default tall
    }

    // Build request for Gemini API
    const requestBody = {
      contents: [{
        parts: parts
      }],
      generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: {
          aspectRatio: getAspectRatio(params.width, params.height),
          imageSize: imageSize
        }
      }
    }

    console.log('Request body:', JSON.stringify(requestBody, null, 2))

    const response = await fetch(`${API_BASE_URL}/models/${MODEL}:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    console.log('Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      let error
      try {
        error = JSON.parse(errorText)
      } catch {
        error = { message: errorText }
      }
      throw new Error(error.message || `API Error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Response data:', data)

    // Extract the image from the response
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const parts = data.candidates[0].content.parts
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
          // Convert base64 to data URL
          const imageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
          console.log('✅ Image generated successfully!')
          return imageData
        }
      }
    }

    throw new Error('No image found in response')
  } catch (error) {
    console.error('❌ Image generation error:', error)
    throw error
  }
}

// Gemini API returns images synchronously, no polling needed

export async function uploadImageReference(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
