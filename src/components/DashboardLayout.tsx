import { ReactNode, useState } from 'react'
import {
  Box,
  Flex,
  VStack,
  Icon,
  Text,
  useColorModeValue,
  BoxProps,
  FlexProps,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  useDisclosure,
  IconButton,
  useBreakpointValue,
} from '@chakra-ui/react'
import { Link, useLocation } from 'react-router-dom'
import { IconType } from 'react-icons'
import {
  FaUserMd,
  FaGraduationCap,
  FaHospital,
  FaHandshake,
  FaStethoscope,
} from 'react-icons/fa'
import { BsFillPersonLinesFill } from 'react-icons/bs'
import { MdDashboard } from 'react-icons/md'
import { FiMenu } from 'react-icons/fi'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

// Custom theme colors based on #5deb99
const customColors = {
  primary: '#5deb99',
  primaryDark: '#4ac980',
  secondary: '#3dd6a3',
  secondaryDark: '#35b98c',
}

interface NavItemProps extends BoxProps {
  icon: IconType
  children: ReactNode
  path: string
  onClose?: () => void
}

interface MenuItem {
  name: string
  icon: IconType
  path: string
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', icon: MdDashboard, path: '/dashboard' },
  { name: 'Medicos', icon: FaUserMd, path: '/dashboard/medicos' },
  { name: 'Leads', icon: BsFillPersonLinesFill, path: '/dashboard/leads' },
  { name: 'Faculdades', icon: FaGraduationCap, path: '/dashboard/faculdades' },
  { name: 'Instituições', icon: FaHospital, path: '/dashboard/instituicoes' },
  { name: 'Convenios', icon: FaHandshake, path: '/dashboard/convenios' },
  { name: 'Especialidades', icon: FaStethoscope, path: '/dashboard/especialidades' },
]

const NavItem = ({ icon, children, path, onClose, ...rest }: NavItemProps) => {
  const location = useLocation()
  const isActive = location.pathname === path
  const activeBg = useColorModeValue('white', 'gray.700')
  const hoverBg = useColorModeValue('white', 'gray.700')

  const handleClick = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <Box
      as={Link}
      to={path}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
      w="full"
      onClick={handleClick}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : 'transparent'}
        boxShadow={isActive ? 'md' : 'none'}
        color={isActive ? customColors.primary : 'gray.500'}
        _hover={{
          bg: hoverBg,
          color: customColors.primary,
          boxShadow: 'md',
          transform: 'translateX(4px)',
        }}
        transition="all 0.2s"
        {...rest}
      >
        <Icon
          mr="4"
          fontSize="18"
          as={icon}
          _groupHover={{
            color: customColors.primary,
          }}
        />
        <Text fontWeight={isActive ? 'medium' : 'normal'}>
          {children}
        </Text>
      </Flex>
    </Box>
  )
}

interface SidebarContentProps {
  onClose?: () => void
}

const SidebarContent = ({ onClose }: SidebarContentProps) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const sidebarBg = useColorModeValue('gray.50', 'gray.900')

  return (
    <Box
      bg={sidebarBg}
      borderRight="1px"
      borderRightColor={borderColor}
      w={{ base: 'full', md: '64' }}
      pos="fixed"
      h="full"
    >
      <Flex
        h="16"
        align="center"
        mx="8"
        mb="4"
        borderBottomWidth="1px"
        borderColor={borderColor}
      >
        <Text
          fontSize="2xl"
          fontWeight="bold"
          bgGradient={`linear(to-r, ${customColors.primary}, ${customColors.secondary})`}
          bgClip="text"
        >
          TrueDoc
        </Text>
      </Flex>
      <VStack spacing={1} align="stretch">
        {menuItems.map((item) => (
          <NavItem key={item.path} icon={item.icon} path={item.path} onClose={onClose}>
            {item.name}
          </NavItem>
        ))}
      </VStack>
    </Box>
  )
}

interface MobileNavProps {
  onOpen: () => void
}

const MobileNav = ({ onOpen }: MobileNavProps) => {
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Flex
      ml={{ base: 0, md: '64' }}
      px={{ base: 4, md: 4 }}
      height="16"
      alignItems="center"
      bg={bg}
      borderBottomWidth="1px"
      borderBottomColor={borderColor}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
    >
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Text
        display={{ base: 'flex', md: 'none' }}
        fontSize="2xl"
        fontWeight="bold"
        bgGradient={`linear(to-r, ${customColors.primary}, ${customColors.secondary})`}
        bgClip="text"
      >
        TrueDoc
      </Text>
    </Flex>
  )
}

interface DashboardLayoutProps {
  children: ReactNode
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const bg = useColorModeValue('white', 'gray.800')
  const isMobile = useBreakpointValue({ base: true, md: false })

  return (
    <Box minH="calc(100vh - 4rem)" bg={useColorModeValue('gray.50', 'gray.800')}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <MotionBox
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <SidebarContent />
        </MotionBox>
      )}

      {/* Mobile Drawer */}
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerOverlay />
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>

      {/* Mobile nav */}
      <MobileNav onOpen={onOpen} />

      {/* Main Content */}
      <MotionBox
        flex="1"
        bg={bg}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        borderRadius={{ base: 'none', md: '2xl' }}
        shadow={{ base: 'none', md: 'sm' }}
        minH="calc(100vh - 5rem)"
        ml={{ base: 0, md: '72' }}
        mr={{ base: 0, md: '6' }}
        my={{ base: 0, md: '6' }}
        p={{ base: 4, md: 8 }}
      >
        {children}
      </MotionBox>
    </Box>
  )
}

export default DashboardLayout 