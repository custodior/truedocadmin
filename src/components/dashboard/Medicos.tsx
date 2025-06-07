import React, { useEffect, useState } from 'react'
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Center,
  Text,
  ButtonGroup,
  Switch,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'
import { FiMoreVertical, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import PageContainer from './PageContainer'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabaseClient'
import { useDebounce } from 'use-debounce'
import { useNavigate, useLocation } from 'react-router-dom'

const MotionBox = motion(Box)

// Custom theme colors based on #5deb99
const customColors = {
  primary: '#5deb99',
  primaryDark: '#4ac980',
  secondary: '#3dd6a3',
  secondaryDark: '#35b98c',
}

interface Doctor {
  id: string
  nome: string
  crm: string
  aprovado: boolean
  created_at: string
  has_pending_changes?: boolean
}

const ITEMS_PER_PAGE = 8

const Medicos = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [showOnlyUnapproved, setShowOnlyUnapproved] = useState(false)
  const [showOnlyApproved, setShowOnlyApproved] = useState(false)
  const [showPendingChanges, setShowPendingChanges] = useState(false)
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  
  const tableBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // Handle URL parameters only on initial load
  useEffect(() => {
    if (isInitialLoad) {
      const params = new URLSearchParams(location.search)
      const showUnapproved = params.get('showUnapproved') === 'true'
      const showApproved = params.get('showApproved') === 'true'
      const showPending = params.get('showPendingChanges') === 'true'

      if (showUnapproved) {
        setShowOnlyUnapproved(true)
      } else if (showApproved) {
        setShowOnlyApproved(true)
      } else if (showPending) {
        setShowPendingChanges(true)
      }
      
      setIsInitialLoad(false)
    }
  }, [location.search, isInitialLoad])

  // Fetch doctors when filters or pagination changes
  useEffect(() => {
    fetchDoctors()
  }, [currentPage, debouncedSearchTerm, showOnlyUnapproved, showOnlyApproved, showPendingChanges])

  const updateFilters = (
    unapproved: boolean,
    approved: boolean,
    pendingChanges: boolean
  ) => {
    setShowOnlyUnapproved(unapproved)
    setShowOnlyApproved(approved)
    setShowPendingChanges(pendingChanges)
    setCurrentPage(0)

    // Update URL without triggering a re-render
    const params = new URLSearchParams()
    if (unapproved) {
      params.set('showUnapproved', 'true')
    } else if (approved) {
      params.set('showApproved', 'true')
    } else if (pendingChanges) {
      params.set('showPendingChanges', 'true')
    }
    window.history.replaceState({}, '', params.toString() ? `?${params.toString()}` : window.location.pathname)
  }

  const toggleUnapproved = () => {
    updateFilters(!showOnlyUnapproved, false, false)
  }

  const toggleApproved = () => {
    updateFilters(false, !showOnlyApproved, false)
  }

  const togglePendingChanges = () => {
    updateFilters(false, false, !showPendingChanges)
  }

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      
      // First, get all doctors with their relationships for filtering
      let query = supabase
        .from('medico')
        .select(`
          id,
          nome,
          crm,
          aprovado,
          new_rqe,
          created_at,
          medico_especialidade_residencia!left (
            aprovado
          ),
          medico_subespecialidade_residencia!left (
            aprovado
          ),
          formacao_outros!left (
            aprovado
          )
        `)

      // Build count query with the same filters
      let countQuery = supabase
        .from('medico')
        .select('*', { count: 'exact', head: true })

      // Apply search filter if any
      if (debouncedSearchTerm) {
        const searchFilter = `nome.ilike.%${debouncedSearchTerm}%,crm.ilike.%${debouncedSearchTerm}%`
        query = query.or(searchFilter)
        countQuery = countQuery.or(searchFilter)
      }
      
      // Apply approval filters
      if (showOnlyUnapproved) {
        query = query.eq('aprovado', false)
        countQuery = countQuery.eq('aprovado', false)
      } else if (showOnlyApproved) {
        query = query.eq('aprovado', true)
        countQuery = countQuery.eq('aprovado', true)
      }

      // Order by created_at
      query = query.order('created_at', { ascending: false })

      // If not showing pending changes, we can use server-side pagination
      if (!showPendingChanges) {
        const startIndex = currentPage * ITEMS_PER_PAGE
        query = query.range(startIndex, startIndex + ITEMS_PER_PAGE - 1)
      }

      const [{ data }, { count }] = await Promise.all([
        query,
        countQuery
      ])

      if (!data) throw new Error('Failed to fetch doctors')

      // Process the data to check for pending changes
      const processedData = data.map(doctor => ({
        ...doctor,
        has_pending_changes: doctor.aprovado && (
          (doctor.new_rqe != null && doctor.new_rqe !== '') ||
          doctor.medico_especialidade_residencia?.some((esp: any) => !esp.aprovado) ||
          doctor.medico_subespecialidade_residencia?.some((sub: any) => !sub.aprovado) ||
          doctor.formacao_outros?.some((form: any) => !form.aprovado)
        )
      }))

      // Filter for pending changes if the toggle is on
      let finalData = processedData
      if (showPendingChanges) {
        const doctorsWithChanges = processedData.filter(doctor => doctor.has_pending_changes)
        // Update total count for pagination
        setTotalCount(doctorsWithChanges.length)
        // Apply client-side pagination for pending changes
        const startIndex = currentPage * ITEMS_PER_PAGE
        const endIndex = startIndex + ITEMS_PER_PAGE
        finalData = doctorsWithChanges.slice(startIndex, endIndex)
      } else {
        setTotalCount(count || 0)
      }

      setDoctors(finalData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching doctors')
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    setCurrentPage(0) // Reset to first page when searching
  }

  const handleDoctorClick = (doctorId: string) => {
    navigate(`/dashboard/medicos/${doctorId}`)
  }

  const getStatusBadge = (approved: boolean, hasPendingChanges: boolean) => {
    if (!approved) {
      return (
        <Badge
          colorScheme="orange"
          px={2}
          py={1}
          borderRadius="full"
          textTransform="capitalize"
        >
          Pendente
        </Badge>
      )
    }
    
    if (hasPendingChanges) {
      return (
        <Badge
          colorScheme="yellow"
          px={2}
          py={1}
          borderRadius="full"
          textTransform="capitalize"
        >
          Alterações Pendentes
        </Badge>
      )
    }

    return (
      <Badge
        colorScheme="green"
        px={2}
        py={1}
        borderRadius="full"
        textTransform="capitalize"
      >
        Aprovado
      </Badge>
    )
  }

  if (error) {
    return (
      <PageContainer
        title="Médicos"
        description="Gerencie os médicos cadastrados no sistema"
      >
        <Center p={8}>
          <Text color="red.500">{error}</Text>
        </Center>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Médicos"
      description="Gerencie os médicos cadastrados no sistema"
    >
      <HStack spacing={4} mb={6} justify="space-between" align="flex-start">
        <HStack spacing={4} flex={1}>
          <InputGroup maxW="xs">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Buscar médicos..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </InputGroup>
        </HStack>

        <HStack spacing={6}>
          <FormControl display="flex" alignItems="center" maxW="xs">
            <FormLabel htmlFor="show-unapproved" mb="0" mr={3}>
              Não Aprovados
            </FormLabel>
            <Switch
              id="show-unapproved"
              colorScheme="green"
              isChecked={showOnlyUnapproved}
              onChange={toggleUnapproved}
            />
          </FormControl>
          <FormControl display="flex" alignItems="center" maxW="xs">
            <FormLabel htmlFor="show-approved" mb="0" mr={3}>
              Aprovados
            </FormLabel>
            <Switch
              id="show-approved"
              colorScheme="green"
              isChecked={showOnlyApproved}
              onChange={toggleApproved}
            />
          </FormControl>
          <FormControl display="flex" alignItems="center" maxW="xs">
            <FormLabel htmlFor="show-pending-changes" mb="0" mr={3}>
              Alterações Pendentes
            </FormLabel>
            <Switch
              id="show-pending-changes"
              colorScheme="yellow"
              isChecked={showPendingChanges}
              onChange={togglePendingChanges}
            />
          </FormControl>
        </HStack>
      </HStack>

      <MotionBox
        bg={tableBg}
        borderRadius="2xl"
        borderWidth="1px"
        borderColor={borderColor}
        shadow="sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Table>
          <Thead>
            <Tr>
              <Th>Nome</Th>
              <Th>CRM</Th>
              <Th>Status</Th>
              <Th>Data de Cadastro</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr>
                <Td colSpan={5}>
                  <Center p={8}>
                    <Spinner size="md" color={customColors.primary} />
                  </Center>
                </Td>
              </Tr>
            ) : doctors.length === 0 ? (
              <Tr>
                <Td colSpan={5}>
                  <Center p={8}>
                    <Text color="gray.500">Nenhum médico encontrado</Text>
                  </Center>
                </Td>
              </Tr>
            ) : (
              doctors.map((doctor) => (
                <Tr 
                  key={doctor.id}
                  _hover={{ bg: 'gray.50', cursor: 'pointer' }}
                  onClick={() => handleDoctorClick(doctor.id)}
                >
                  <Td fontWeight="medium">{doctor.nome}</Td>
                <Td>{doctor.crm}</Td>
                  <Td>{getStatusBadge(doctor.aprovado, doctor.has_pending_changes || false)}</Td>
                  <Td>{new Date(doctor.created_at).toLocaleDateString('pt-BR')}</Td>
                  <Td onClick={(e) => e.stopPropagation()}>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<FiMoreVertical />}
                      variant="ghost"
                      size="sm"
                      borderRadius="full"
                    />
                    <MenuList>
                        <MenuItem onClick={() => handleDoctorClick(doctor.id)}>Ver detalhes</MenuItem>
                      <MenuItem>Editar</MenuItem>
                      <MenuItem color="red.500">Remover</MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
              ))
            )}
          </Tbody>
        </Table>
        
        {/* Pagination Controls */}
        {!loading && doctors.length > 0 && (
          <HStack justify="center" p={4} spacing={4}>
            <ButtonGroup size="sm" variant="outline" spacing={2}>
              <Button
                leftIcon={<FiChevronLeft />}
                onClick={handlePreviousPage}
                isDisabled={currentPage === 0}
              >
                Anterior
              </Button>
              <Center minW="100px">
                <Text fontSize="sm">
                  Página {currentPage + 1} de {totalPages}
                </Text>
              </Center>
              <Button
                rightIcon={<FiChevronRight />}
                onClick={handleNextPage}
                isDisabled={currentPage >= totalPages - 1}
              >
                Próxima
              </Button>
            </ButtonGroup>
          </HStack>
        )}
      </MotionBox>
    </PageContainer>
  )
}

export default Medicos 