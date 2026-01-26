// Script to generate example images for the landing page
// Run with: node scripts/generate-examples.mjs

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const API_KEY = 'AIzaSyAOX99PzFQMCn9hW0EvnWTCpdIv1PnayZY'
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'
const MODEL = 'gemini-3-pro-image-preview'

const EXAMPLES = [
  {
    id: 'melbourne-weather',
    label: 'Melbourne Weather',
    prompt: 'Present a clear, 45 top-down isometric miniature 3D cartoon scene of Melbourne, featuring its most iconic landmarks and architectural elements. Use soft, refined textures with realistic PBR materials and gentle, lifelike lighting and shadows. Integrate the current weather conditions directly into the city environment to create an immersive atmospheric mood. Use a clean, minimalistic composition with a soft, solid-colored background. At the top-center, place the title Melbourne in large bold text, a prominent weather icon beneath it, then the date (small text) and temperature (medium text). All text must be centred with consistent spacing and may subtly overlap the tops of the buildings.',
    aspectRatio: '1:1'
  },
  {
    id: 'recipe-infographic',
    label: 'Recipe Infographic',
    prompt: 'Create a step-by-step recipe infographic for bolognese pasta, top-down view, minimal style on white background, ingredient photos labelled: "400g spaghetti", "500g beef mince", "1 onion", "2 cloves garlic", "400g crushed tomatoes", "fresh basil", dotted node lines showing process steps with icons (boiling pot, mixing, simmering), final plated pasta shot at the bottom.',
    aspectRatio: '3:4'
  },
  {
    id: 'action-figure',
    label: 'Action Figure',
    prompt: 'Generate a highly detailed 1/7 scale action figure of a female anime character with long blue hair and futuristic armor in a realistic style. Place the figure on a computer desk with a transparent circular acrylic base. On the computer screen, show the ZBrush modeling process of the figure. Beside the screen, add a toy packaging box inspired by BANDAI, featuring the original character artwork. Ensure the scene has realistic lighting and textures.',
    aspectRatio: '1:1'
  },
  {
    id: 'sharepoint-bananas',
    label: 'SharePoint Bananas',
    prompt: 'A beautiful script font that forms the word SharePoint with actual bananas against a black background. The bananas are arranged to spell out the letters, with realistic lighting and shadows.',
    aspectRatio: '16:9'
  }
]

async function generateImage(prompt, aspectRatio) {
  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: aspectRatio,
        imageSize: '2K'
      }
    }
  }

  const response = await fetch(`${API_BASE_URL}/models/${MODEL}:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API Error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()

  if (data.candidates && data.candidates[0] && data.candidates[0].content) {
    const parts = data.candidates[0].content.parts
    for (const part of parts) {
      if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
        return {
          mimeType: part.inlineData.mimeType,
          data: part.inlineData.data
        }
      }
    }
  }

  throw new Error('No image found in response')
}

async function main() {
  const outputDir = path.join(__dirname, '..', 'public', 'examples')

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  console.log('Generating example images...\n')

  for (const example of EXAMPLES) {
    console.log(`Generating: ${example.label}...`)
    try {
      const result = await generateImage(example.prompt, example.aspectRatio)

      // Determine file extension from mime type
      const ext = result.mimeType === 'image/png' ? 'png' : 'jpg'
      const filename = `${example.id}.${ext}`
      const filepath = path.join(outputDir, filename)

      // Write base64 data to file
      const buffer = Buffer.from(result.data, 'base64')
      fs.writeFileSync(filepath, buffer)

      console.log(`  ✓ Saved: ${filename}`)
    } catch (error) {
      console.error(`  ✗ Failed: ${error.message}`)
    }
  }

  console.log('\nDone!')
}

main()
