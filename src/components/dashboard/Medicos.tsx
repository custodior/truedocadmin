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
import { useNavigate } from 'react-router-dom'

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
}

const ITEMS_PER_PAGE = 8

const Medicos = () => {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [showOnlyUnapproved, setShowOnlyUnapproved] = useState(false)
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300)
  
  const tableBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    fetchDoctors()
  }, [currentPage, debouncedSearchTerm, showOnlyUnapproved])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('medico')
        .select('*', { count: 'exact', head: true })

      // Apply filters
      if (debouncedSearchTerm) {
        query = query.or(`nome.ilike.%${debouncedSearchTerm}%,crm.ilike.%${debouncedSearchTerm}%`)
      }
      
      if (showOnlyUnapproved) {
        query = query.eq('aprovado', false)
      }

      // Get count with filters
      const { count, error: countError } = await query

      if (countError) throw countError
      
      // Then fetch the paginated data with same filters
      let dataQuery = supabase
        .from('medico')
        .select('id, nome, crm, aprovado, created_at')

      // Apply same filters to data query
      if (debouncedSearchTerm) {
        dataQuery = dataQuery.or(`nome.ilike.%${debouncedSearchTerm}%,crm.ilike.%${debouncedSearchTerm}%`)
      }
      
      if (showOnlyUnapproved) {
        dataQuery = dataQuery.eq('aprovado', false)
      }

      const { data, error } = await dataQuery
        .order('created_at', { ascending: false })
        .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1)

      if (error) throw error

      setDoctors(data || [])
      setTotalCount(count || 0)
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

  const toggleUnapproved = () => {
    setShowOnlyUnapproved(!showOnlyUnapproved)
    setCurrentPage(0) // Reset to first page when toggling filter
  }

  const handleDoctorClick = (doctorId: string) => {
    navigate(`/dashboard/medicos/${doctorId}`)
  }

  const getStatusBadge = (approved: boolean) => {
    return (
      <Badge
        colorScheme={approved ? 'green' : 'orange'}
        px={2}
        py={1}
        borderRadius="full"
        textTransform="capitalize"
      >
        {approved ? 'Aprovado' : 'Pendente'}
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
      <HStack mb={6} spacing={4} justify="space-between">
        <HStack spacing={4} flex={1}>
          <InputGroup maxW="xs">
            <InputLeftElement pointerEvents="none" color="gray.400">
              <FiSearch />
            </InputLeftElement>
            <Input
              placeholder="Buscar por nome ou CRM..."
              bg={useColorModeValue('white', 'gray.800')}
              borderRadius="lg"
              value={searchTerm}
              onChange={handleSearch}
            />
          </InputGroup>
        </HStack>
        <FormControl display="flex" alignItems="center" maxW="xs">
          <FormLabel htmlFor="show-unapproved" mb="0" mr={3}>
            Mostrar Não Aprovados
          </FormLabel>
          <Switch
            id="show-unapproved"
            colorScheme="green"
            isChecked={showOnlyUnapproved}
            onChange={toggleUnapproved}
          />
        </FormControl>
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
                  <Td>{getStatusBadge(doctor.aprovado)}</Td>
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