import { PublicClientApplication } from '@azure/msal-browser'
import { msalConfig, loginRequest, graphConfig } from '../config/authConfig'
import { supabase } from './supabase'
import { addSubscriberToConvertKit } from './convertkit'

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

// Attempt silent SSO sign-in (if user is already logged into M365 in browser)
export const attemptSilentSignIn = async () => {
  try {
    // Try to get account from cache
    const accounts = msalInstance.getAllAccounts()

    if (accounts.length === 0) {
      // No cached account, try SSO silent
      const ssoRequest = {
        ...loginRequest,
        prompt: 'none', // Don't show UI - fail silently if not logged in
      }

      try {
        const ssoResponse = await msalInstance.ssoSilent(ssoRequest)
        if (ssoResponse?.account) {
          // Successfully got SSO login, now create/update user in Supabase
          return await createOrUpdateUser(ssoResponse.account, ssoResponse.accessToken)
        }
      } catch (ssoError: any) {
        // SSO silent failed - user not logged into M365, that's OK
        console.log('SSO silent sign-in not available:', ssoError.errorCode)
        return null
      }
    } else {
      // Account exists in cache, get fresh token and user data
      const account = accounts[0]
      try {
        const tokenResponse = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account,
        })
        return await createOrUpdateUser(account, tokenResponse.accessToken)
      } catch (error) {
        console.error('Error acquiring token silently:', error)
        return null
      }
    }

    return null
  } catch (error) {
    console.error('Silent sign-in error:', error)
    return null
  }
}

// Helper function to create or update user in Supabase
const createOrUpdateUser = async (account: any, accessToken: string) => {
  try {
    // Get user profile from Microsoft Graph
    const profile = await getUserProfile(accessToken)

    // Create or update user in Supabase
    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', account.homeAccountId)

    if (fetchError) {
      console.error('Error fetching user:', fetchError)
      throw fetchError
    }

    const existingUser = existingUsers && existingUsers.length > 0 ? existingUsers[0] : null

    if (!existingUser) {
      // Create new user with Free tier (2 one-time images, no monthly allocation)
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          id: account.homeAccountId,
          email: account.username,
          name: profile.displayName || account.name,
          subscription_tier: 'free',
          images_generated: 0,
          image_balance: 2,  // Free tier gets 2 one-time images
          monthly_allocation: 0,  // No monthly allocation for free tier
          bonus_images: 0,
        })
        .select()
        .single()

      if (error) {
        // If the error is duplicate key, try to fetch the user again
        if (error.code === '23505') {
          const { data: retryUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', account.homeAccountId)
            .single()

          if (retryUser) {
            return { user: retryUser, account, profile }
          }
        }

        console.error('Error creating user:', error)
        throw error
      }

      // Add new user to ConvertKit with tag (non-blocking)
      addSubscriberToConvertKit({
        email: account.username,
        firstName: profile.displayName?.split(' ')[0] || undefined,
      }).catch(err => console.error('ConvertKit subscription failed:', err))

      return { user: newUser, account, profile }
    }

    // Update existing user's name if changed
    if (existingUser.name !== profile.displayName) {
      await supabase
        .from('users')
        .update({ name: profile.displayName })
        .eq('id', existingUser.id)
    }

    return { user: existingUser, account, profile }
  } catch (error) {
    console.error('Error creating/updating user:', error)
    throw error
  }
}

// Sign in with redirect (when user explicitly clicks login or SSO fails)
export const signIn = async () => {
  try {
    const loginResponse = await msalInstance.loginRedirect(loginRequest)
    return loginResponse
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

// Handle redirect after login
export const handleRedirectPromise = async () => {
  try {
    const loginResponse = await msalInstance.handleRedirectPromise()

    if (!loginResponse || !loginResponse.account) {
      return null
    }

    // Get access token and create/update user in Supabase
    const tokenResponse = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: loginResponse.account,
    })

    return await createOrUpdateUser(loginResponse.account, tokenResponse.accessToken)
  } catch (error) {
    console.error('Handle redirect error:', error)
    throw error
  }
}

// Sign out (app-only - doesn't sign out of Microsoft 365)
export const signOut = async () => {
  try {
    const account = msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0]

    if (account) {
      // Clear the account from MSAL cache without redirecting to Microsoft logout
      // This keeps the user logged into other Microsoft services
      await msalInstance.clearCache()
    }

    // Reload the page to reset app state
    window.location.href = '/'
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
