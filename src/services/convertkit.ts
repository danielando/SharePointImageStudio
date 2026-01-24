// ConvertKit API Integration
// Adds new users to ConvertKit and tags them

const CONVERTKIT_API_KEY = import.meta.env.VITE_CONVERTKIT_API_KEY
const CONVERTKIT_API_SECRET = import.meta.env.VITE_CONVERTKIT_API_SECRET
const CONVERTKIT_TAG_ID = import.meta.env.VITE_CONVERTKIT_TAG_ID || '14871194'

interface SubscriberData {
  email: string
  firstName?: string
}

/**
 * Add a subscriber to ConvertKit and apply the SharePoint Image Studio tag
 */
export async function addSubscriberToConvertKit(data: SubscriberData): Promise<boolean> {
  if (!CONVERTKIT_API_KEY) {
    console.warn('ConvertKit API key not configured, skipping subscriber addition')
    return false
  }

  try {
    // Use the tag subscription endpoint to add subscriber with tag in one call
    const response = await fetch(`https://api.convertkit.com/v3/tags/${CONVERTKIT_TAG_ID}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: CONVERTKIT_API_KEY,
        email: data.email,
        first_name: data.firstName || '',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('ConvertKit API error:', response.status, errorData)
      return false
    }

    const result = await response.json()
    console.log('✅ Successfully added subscriber to ConvertKit:', data.email)
    return true
  } catch (error) {
    console.error('Error adding subscriber to ConvertKit:', error)
    return false
  }
}
