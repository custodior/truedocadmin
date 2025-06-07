import React, { useEffect, useState } from 'react'
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Icon,
  Flex,
  Heading,
  Text,
  Spinner,
} from '@chakra-ui/react'
import { FaUserMd, FaUserCheck, FaUserClock, FaUserEdit } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { 
  getPendingDoctorsCount, 
  getApprovedDoctorsCount, 
  getTotalLeadsCount,
  getDoctorsWithPendingChangesCount
} from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

const MotionBox = motion(Box)

// Custom theme colors based on #5deb99
const customColors = {
  primary: '#5deb99',
  primaryDark: '#4ac980',
  secondary: '#3dd6a3',
  secondaryDark: '#35b98c',
}

interface StatCardProps {
  title: string
  stat: string | number
  helpText: string
  icon: React.ElementType
  index: number
  isLoading?: boolean
  onClick?: () => void
}

function StatCard({ title, stat, helpText, icon, index, isLoading = false, onClick }: StatCardProps) {
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const iconBg = useColorModeValue('gray.100', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.400')

  // Get the color scheme based on the index
  const getColorScheme = (idx: number) => {
    switch (idx) {
      case 0: // Médicos Pendentes
        return 'orange'
      case 1: // Médicos Aprovados
        return 'green'
      case 2: // Alterações Pendentes
        return 'yellow'
      case 3: // Total de Leads
        return 'blue'
      default:
        return 'gray'
    }
  }

  const colorScheme = getColorScheme(index)

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      _hover={onClick ? {
        transform: 'translateY(-2px)',
        shadow: 'lg',
        transition: 'all 0.2s',
      } : {}}
    >
      <Stat
        px={4}
        py={3}
        bg={bg}
        shadow="sm"
        rounded="xl"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Flex alignItems="flex-start" mb={2}>
          <Box
            p={2.5}
            bg={iconBg}
            borderRadius="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon
              as={icon}
              w={5}
              h={5}
              color={`${colorScheme}.500`}
            />
          </Box>
          <Box flex="1" ml={3}>
            <StatLabel
              fontSize="sm"
              fontWeight="medium"
              color={textColor}
              mb={1}
              noOfLines={1}
            >
              {title}
            </StatLabel>
            <StatNumber
              fontSize="2xl"
              fontWeight="bold"
              color={`${colorScheme}.500`}
              lineHeight="1.2"
            >
              {isLoading ? <Spinner size="sm" color={`${colorScheme}.500`} /> : stat}
            </StatNumber>
          </Box>
        </Flex>
        <StatHelpText
          color={textColor}
          mb={0}
          fontSize="xs"
          fontWeight="medium"
          noOfLines={1}
        >
          {helpText}
        </StatHelpText>
      </Stat>
    </MotionBox>
  )
}

const DashboardOverview = () => {
  const navigate = useNavigate()
  const [pendingCount, setPendingCount] = useState<number | null>(null)
  const [approvedCount, setApprovedCount] = useState<number | null>(null)
  const [leadsCount, setLeadsCount] = useState<number | null>(null)
  const [pendingChangesCount, setPendingChangesCount] = useState<number | null>(null)
  const [isLoadingPending, setIsLoadingPending] = useState(true)
  const [isLoadingApproved, setIsLoadingApproved] = useState(true)
  const [isLoadingLeads, setIsLoadingLeads] = useState(true)
  const [isLoadingPendingChanges, setIsLoadingPendingChanges] = useState(true)

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [pending, approved, leads, pendingChanges] = await Promise.all([
          getPendingDoctorsCount(),
          getApprovedDoctorsCount(),
          getTotalLeadsCount(),
          getDoctorsWithPendingChangesCount()
        ])
        setPendingCount(pending)
        setApprovedCount(approved)
        setLeadsCount(leads)
        setPendingChangesCount(pendingChanges)
      } catch (error) {
        console.error('Error fetching counts:', error)
      } finally {
        setIsLoadingPending(false)
        setIsLoadingApproved(false)
        setIsLoadingLeads(false)
        setIsLoadingPendingChanges(false)
      }
    }

    fetchCounts()
  }, [])

  const handleNavigateToMedicos = (filter: 'pending' | 'approved' | 'pendingChanges') => {
    const searchParams = new URLSearchParams()
    switch (filter) {
      case 'pending':
        searchParams.set('showUnapproved', 'true')
        break
      case 'approved':
        searchParams.set('showApproved', 'true')
        break
      case 'pendingChanges':
        searchParams.set('showPendingChanges', 'true')
        break
    }
    navigate(`/dashboard/medicos?${searchParams.toString()}`)
  }

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
          Visão Geral
        </Heading>
        <Text color={useColorModeValue('gray.600', 'gray.400')}>
          Acompanhe os principais indicadores do sistema
        </Text>
      </MotionBox>

      <SimpleGrid 
        columns={{ base: 1, md: 2, lg: 4 }} 
        spacing={{ base: 6, lg: 8 }}
        mx="-3"
      >
        <StatCard
          title="Médicos Pendentes"
          stat={pendingCount ?? 0}
          helpText="Aguardando Aprovação"
          icon={FaUserClock}
          index={0}
          isLoading={isLoadingPending}
          onClick={() => handleNavigateToMedicos('pending')}
        />
        <StatCard
          title="Médicos Aprovados"
          stat={approvedCount ?? 0}
          helpText="Ativos no Sistema"
          icon={FaUserCheck}
          index={1}
          isLoading={isLoadingApproved}
          onClick={() => handleNavigateToMedicos('approved')}
        />
        <StatCard
          title="Alterações Pendentes"
          stat={pendingChangesCount ?? 0}
          helpText="Médicos com Mudanças para Aprovar"
          icon={FaUserEdit}
          index={2}
          isLoading={isLoadingPendingChanges}
          onClick={() => handleNavigateToMedicos('pendingChanges')}
        />
        <StatCard
          title="Total de Leads"
          stat={leadsCount ?? 0}
          helpText="Leads Cadastrados"
          icon={FaUserMd}
          index={3}
          isLoading={isLoadingLeads}
        />
      </SimpleGrid>
    </Box>
  )
}

export default DashboardOverview 