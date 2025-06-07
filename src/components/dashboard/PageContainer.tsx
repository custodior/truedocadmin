import { ReactNode } from 'react'
import {
  Box,
  Heading,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

// Custom theme colors based on #5deb99
const customColors = {
  primary: '#5deb99',
  primaryDark: '#4ac980',
  secondary: '#3dd6a3',
  secondaryDark: '#35b98c',
}

interface PageContainerProps {
  title: string
  description?: string
  children: ReactNode
}

const PageContainer = ({ title, description, children }: PageContainerProps) => {
  return (
    <Box>
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        mb={8}
      >
        <Heading
          size="lg"
          mb={2}
          bgGradient={`linear(to-r, ${customColors.primary}, ${customColors.secondary})`}
          bgClip="text"
        >
          {title}
        </Heading>
        {description && (
          <Text color={useColorModeValue('gray.600', 'gray.400')}>
            {description}
          </Text>
        )}
      </MotionBox>

      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {children}
      </MotionBox>
    </Box>
  )
}

export default PageContainer 