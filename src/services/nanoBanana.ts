// Nano Banana (Google Gemini) API Integration
// Documentation: https://ai.google.dev/gemini-api/docs/image-generation

const API_KEY = import.meta.env.VITE_NANO_BANANA_API_KEY
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'
const MODEL = 'gemini-3-pro-image-preview' // Nano Banana - actual model name

interface GenerateImageRequest {
  prompt: string
  width: number
  height: number
  imageReferences?: string[] // base64 or URLs
}

export async function generateImage(params: GenerateImageRequest): Promise<string> {
  try {
    console.log('🚀 Starting Nano Banana (Gemini) image generation...')
    console.log('API Key present:', !!API_KEY)
    console.log('Prompt:', params.prompt)
    console.log('Dimensions:', params.width, 'x', params.height)

    if (!API_KEY) {
      throw new Error('VITE_NANO_BANANA_API_KEY environment variable is not set. Please add your Google Gemini API key to your environment variables.')
    }

    // Use the exact prompt without modifications for better results
    const fullPrompt = params.prompt

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

    // Build request for Gemini API
    const requestBody = {
      contents: [{
        parts: parts
      }],
      generationConfig: {
        responseModalities: ["image"]
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
