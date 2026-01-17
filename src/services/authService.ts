import { PublicClientApplication } from '@azure/msal-browser'
import { msalConfig, loginRequest, graphConfig } from '../config/authConfig'
import { supabase } from './supabase'

export const msalInstance = new PublicClientApplication(msalConfig)

// Initialize MSAL
export const initializeMsal = async () => {
  await msalInstance.initialize()
}

// Get user profile from Microsoft Graph
export const getUserProfile = async (accessToken: string) => {
  const response = await fetch(graphConfig.graphMeEndpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch user profile')
  }

  return response.json()
}

// Sign in and create/update user in Supabase
export const signIn = async () => {
  try {
    const loginResponse = await msalInstance.loginPopup(loginRequest)
    const account = loginResponse.account

    if (!account) {
      throw new Error('No account found')
    }

    // Get access token for Microsoft Graph
    const tokenResponse = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account,
    })

    // Get user profile from Microsoft Graph
    const profile = await getUserProfile(tokenResponse.accessToken)

    // Create or update user in Supabase
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('azure_ad_id', account.homeAccountId)
      .single()

    if (!existingUser) {
      // Create new user with Free tier
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          azure_ad_id: account.homeAccountId,
          email: account.username,
          display_name: profile.displayName || account.name,
          subscription_tier: 'free',
          monthly_image_limit: 3,
          monthly_images_used: 0,
          billing_period_start: new Date().toISOString(),
          billing_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user:', error)
        throw error
      }

      return { user: newUser, account, profile }
    }

    // Update existing user's display name if changed
    if (existingUser.display_name !== profile.displayName) {
      await supabase
        .from('users')
        .update({ display_name: profile.displayName })
        .eq('id', existingUser.id)
    }

    return { user: existingUser, account, profile }
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

// Sign out
export const signOut = async () => {
  try {
    await msalInstance.logoutPopup()
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

// Get current account
export const getCurrentAccount = () => {
  const accounts = msalInstance.getAllAccounts()
  return accounts.length > 0 ? accounts[0] : null
}

// Check if user is authenticated
export const isAuthenticated = () => {
  return getCurrentAccount() !== null
}
