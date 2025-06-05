import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Box, Text, VStack, Code } from '@chakra-ui/react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box p={4}>
          <VStack spacing={4} align="start">
            <Text fontSize="xl" color="red.500">Something went wrong!</Text>
            {this.state.error && (
              <Code p={4} borderRadius="md" width="100%">
                {this.state.error.toString()}
              </Code>
            )}
          </VStack>
        </Box>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 