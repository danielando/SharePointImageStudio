import { useEffect } from 'react'
import { MsalProvider } from '@azure/msal-react'
import { msalInstance, initializeMsal } from '../services/authService'

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    initializeMsal()
  }, [])

  return (
    <MsalProvider instance={msalInstance}>
      {children}
    </MsalProvider>
  )
}
