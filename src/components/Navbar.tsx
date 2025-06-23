import {
  Box,
  Flex,
  Button,
  Heading,
  useColorModeValue,
  Spacer,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
} from '@chakra-ui/react'
import { FiUser, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const { signOut } = useAuth()
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box bg={bg} px={4} borderBottom="1px" borderColor={borderColor}>
      <Flex h={16} alignItems="center">
        <Heading size="md" display={{ base: "none", md: "block" }}>TrueDoc Admin</Heading>
        <Spacer />
        
        {/* Desktop Menu */}
        <Button
          variant="ghost"
          onClick={signOut}
          leftIcon={<FiLogOut />}
          display={{ base: "none", md: "flex" }}
        >
          Sair
        </Button>

        {/* Mobile Menu */}
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Account options"
            icon={<FiUser />}
            variant="ghost"
            display={{ base: "flex", md: "none" }}
          />
          <MenuList>
            <MenuItem icon={<FiLogOut />} onClick={signOut}>
              Sair
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  )
}

export default Navbar 