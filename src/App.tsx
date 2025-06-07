import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Box, useToast } from '@chakra-ui/react'
import Navbar from './components/Navbar'
import { Auth, Dashboard } from './pages'
import { supabase } from './lib/supabaseClient'

const queryClient = new QueryClient()

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const toast = useToast()

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          return
        }

        // Get user email from session
        const { data: { user } } = await supabase.auth.getUser()
        if (!user?.email) {
          return
        }

        // Check if user is a moderator
        const { data: medicoData, error: medicoError } = await supabase
          .from('medico')
          .select('moderador')
          .eq('email', user.email)
          .single()

        if (medicoError || !medicoData?.moderador) {
          // Sign out if not a moderator
          await supabase.auth.signOut()
          toast({
            title: 'Acesso não autorizado',
            description: 'Apenas moderadores podem acessar o painel.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error('Error checking authorization:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthorization()
  }, [toast])

  if (isLoading) {
    return null // or a loading spinner
  }

  if (!isAuthorized) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Box minH="100vh">
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Dashboard />
                </>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Box>
    </QueryClientProvider>
  )
}

export default App 