import React from 'react'
import { Box, Heading, Text } from '@chakra-ui/react'

const UserManager = () => {
  return (
    <Box>
      <Heading size="lg" mb={6}>User Manager</Heading>
      <Text color="gray.600">
        Manage your application users here.
      </Text>
    </Box>
  )
}

export default UserManager 