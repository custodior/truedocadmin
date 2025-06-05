import React from 'react'
import {
  Box,
  Flex,
  Button,
  Heading,
  useColorModeValue,
  Spacer,
} from '@chakra-ui/react'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const { signOut } = useAuth()
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box bg={bg} px={4} borderBottom="1px" borderColor={borderColor}>
      <Flex h={16} alignItems="center">
        <Heading size="md">TrueDoc Admin</Heading>
        <Spacer />
        <Button
          variant="ghost"
          onClick={signOut}
        >
          Sair
        </Button>
      </Flex>
    </Box>
  )
}

export default Navbar 