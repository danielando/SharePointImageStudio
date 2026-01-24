import { useEffect } from 'react'
import { MsalProvider } from '@azure/msal-react'
import { msalInstance, initializeMsal, handleRedirectPromise, attemptSilentSignIn } from '../services/authService'
import { useStore } from '../store/useStore'

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setAuthenticated } = useStore()

  useEffect(() => {
    const initialize = async () => {
      await initializeMsal()

      // First, handle any redirect from Microsoft login (explicit login flow)
      const redirectResult = await handleRedirectPromise()

      if (redirectResult) {
        console.log('✅ User signed in via redirect')
        setUser(redirectResult.user)
        setAuthenticated(true)
        return
      }

      // If no redirect, attempt silent SSO (seamless sign-in if user is logged into M365)
      const ssoResult = await attemptSilentSignIn()

      if (ssoResult) {
        console.log('✅ User signed in silently via SSO')
        setUser(ssoResult.user)
        setAuthenticated(true)
      } else {
        console.log('ℹ️ No active M365 session - user will need to login')
      }
    }

    initialize()
  }, [setUser, setAuthenticated])

  return (
    <MsalProvider instance={msalInstance}>
      {children}
    </MsalProvider>
  )
}
