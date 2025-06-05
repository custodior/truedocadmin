import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Box } from '@chakra-ui/react'
import Navbar from './components/Navbar'
import { Auth, Dashboard } from './pages'
import { supabase } from './lib/supabaseClient'

const queryClient = new QueryClient()

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const session = supabase.auth.getSession()

  if (!session) {
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