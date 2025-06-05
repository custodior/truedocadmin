import React, { ReactNode } from 'react'
import {
  Box,
  Flex,
  VStack,
  Icon,
  Text,
  useColorModeValue,
  BoxProps,
  Heading,
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

const NavItem = ({ icon, children, path, ...rest }: NavItemProps) => {
  const location = useLocation()
  const isActive = location.pathname === path
  const activeBg = useColorModeValue('white', 'gray.700')
  const hoverBg = useColorModeValue('white', 'gray.700')

  return (
    <Box
      as={Link}
      to={path}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
      w="full"
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

interface DashboardLayoutProps {
  children: ReactNode
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const sidebarBg = useColorModeValue('gray.50', 'gray.900')

  return (
    <Flex minH="calc(100vh - 4rem)" bg={useColorModeValue('gray.50', 'gray.800')}>
      {/* Sidebar */}
      <MotionBox
        w="64"
        bg={sidebarBg}
        borderRight="1px"
        borderRightColor={borderColor}
        position="fixed"
        h="calc(100vh - 4rem)"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
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
            <NavItem key={item.path} icon={item.icon} path={item.path}>
              {item.name}
            </NavItem>
          ))}
        </VStack>
      </MotionBox>

      {/* Main Content */}
      <MotionBox
        flex="1"
        bg={bg}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        borderRadius="2xl"
        shadow="sm"
        minH="calc(100vh - 5rem)"
        ml="72"
        mr="6"
        my="6"
        p="8"
      >
        {children}
      </MotionBox>
    </Flex>
  )
}

export default DashboardLayout 