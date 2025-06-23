import { useState, useEffect } from 'react'
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
  Input,
  InputGroup,
  InputLeftElement,
  useToast,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  Text,
  HStack,
} from '@chakra-ui/react'
import { FiMoreVertical, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import PageContainer from './PageContainer'
import { motion } from 'framer-motion'
import {
  Lead,
  LeadFilters,
  LeadSort,
  PaginationParams,
  getLeads,
  deleteLead,
} from '../../lib/leadService'

const MotionBox = motion(Box)

// Cores personalizadas baseadas em #5deb99
const customColors = {
  primary: '#5deb99',
  primaryDark: '#4ac980',
  secondary: '#3dd6a3',
  secondaryDark: '#35b98c',
}

const ITENS_POR_PAGINA = 10

const Leads = () => {
  const tableBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const toast = useToast()

  const [leads, setLeads] = useState<Lead[]>([])
  const [totalLeads, setTotalLeads] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtros e Paginação
  const [filters, setFilters] = useState<LeadFilters>({})
  const [sort, setSort] = useState<LeadSort>({ column: 'data_inserido', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchLeads()
  }, [filters, sort, currentPage])

  // Adiciona debounce à pesquisa
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== (filters.search || '')) {
        setFilters({ ...filters, search: searchTerm })
        setCurrentPage(0)
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const fetchLeads = async () => {
    try {
      setIsLoading(true)
      const pagination: PaginationParams = {
        page: currentPage,
        pageSize: ITENS_POR_PAGINA,
      }
      const { leads: fetchedLeads, total } = await getLeads(filters, sort, pagination)
      setLeads(fetchedLeads)
      setTotalLeads(total)
      setError(null)
    } catch (err) {
      setError('Erro ao carregar leads')
      console.error('Erro ao buscar leads:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (column: string) => {
    setSort({
      column,
      direction: sort.column === column && sort.direction === 'asc' ? 'desc' : 'asc',
    })
  }

  const handleDeleteLead = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lead?')) {
      try {
        await deleteLead(id)
        toast({
          title: 'Lead excluído com sucesso',
          status: 'success',
          duration: 3000,
        })
        fetchLeads()
      } catch (err) {
        toast({
          title: 'Erro ao excluir lead',
          status: 'error',
          duration: 3000,
        })
      }
    }
  }

  const getStepBadge = (step: string) => {
    const props = {
      new: {
        colorScheme: 'blue',
        text: 'Novo',
      },
      contacted: {
        colorScheme: 'orange',
        text: 'Contatado',
      },
      converted: {
        colorScheme: 'green',
        text: 'Convertido',
      },
    }[step] || {
      colorScheme: 'gray',
      text: step,
    }

    return (
      <Badge
        colorScheme={props.colorScheme}
        px={{ base: 1, md: 2 }}
        py={1}
        borderRadius="full"
        textTransform="capitalize"
        fontSize={{ base: "2xs", md: "xs" }}
      >
        {props.text}
      </Badge>
    )
  }

  const totalPages = Math.ceil(totalLeads / ITENS_POR_PAGINA)

  return (
    <PageContainer
      title="Leads"
      description="Gerencie seus leads e potenciais clientes"
    >
      <HStack mb={6} spacing={4}>
        <InputGroup maxW="xs">
          <InputLeftElement pointerEvents="none" color="gray.400">
            <FiSearch />
          </InputLeftElement>
          <Input
            placeholder="Pesquisar por email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg={useColorModeValue('white', 'gray.800')}
            borderRadius="lg"
          />
        </InputGroup>
      </HStack>

      {error && (
        <Alert status="error" mb={6} borderRadius="lg">
          <AlertIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
        <Box overflowX="auto">
          <Table variant="simple" w="100%" size={{ base: "sm", md: "md" }}>
          <Thead>
            <Tr>
              <Th 
                cursor="pointer" 
                onClick={() => handleSort('email')}
                _hover={{ color: customColors.primary }}
                fontSize={{ base: "xs", md: "sm" }}
                p={{ base: 2, md: 4 }}
              >
                Email {sort.column === 'email' && (sort.direction === 'asc' ? '↑' : '↓')}
              </Th>
              <Th 
                cursor="pointer" 
                onClick={() => handleSort('step')}
                _hover={{ color: customColors.primary }}
                fontSize={{ base: "xs", md: "sm" }}
                p={{ base: 2, md: 4 }}
              >
                Step {sort.column === 'step' && (sort.direction === 'asc' ? '↑' : '↓')}
              </Th>
              <Th fontSize={{ base: "xs", md: "sm" }} p={{ base: 2, md: 4 }} w={{ base: "60px", md: "80px" }}>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                  <Td colSpan={3}>
                    <Flex justify="center" align="center" py={4}>
                      <Spinner size="lg" color={customColors.primary} />
                    </Flex>
                </Td>
              </Tr>
            ) : leads.length === 0 ? (
              <Tr>
                  <Td colSpan={3}>
                    <Text textAlign="center" py={4} color="gray.500">
                      Nenhum lead encontrado
                    </Text>
                </Td>
              </Tr>
            ) : (
              leads.map((lead) => (
                <Tr key={lead.id}>
                  <Td 
                    fontSize={{ base: "xs", md: "sm" }} 
                    p={{ base: 2, md: 4 }}
                    maxW={{ base: "150px", md: "250px" }}
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  >
                    {lead.email}
                  </Td>
                  <Td fontSize={{ base: "xs", md: "sm" }} p={{ base: 2, md: 4 }}>
                    {getStepBadge(lead.step)}
                  </Td>
                  <Td p={{ base: 1, md: 4 }}>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FiMoreVertical />}
                        variant="ghost"
                        size={{ base: "xs", md: "sm" }}
                      />
                      <MenuList>
                        <MenuItem onClick={() => handleDeleteLead(lead.id)}>
                          Excluir
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
        </Box>

        {/* Paginação */}
        {!isLoading && leads.length > 0 && (
          <Flex justify="center" align="center" p={4} borderTopWidth="1px">
            <IconButton
              icon={<FiChevronLeft />}
              onClick={() => setCurrentPage(currentPage - 1)}
              isDisabled={currentPage === 0}
              mr={2}
              aria-label="Página anterior"
            />
            <Text mx={4}>
              Página {currentPage + 1} de {totalPages}
            </Text>
            <IconButton
              icon={<FiChevronRight />}
              onClick={() => setCurrentPage(currentPage + 1)}
              isDisabled={currentPage + 1 >= totalPages}
              ml={2}
              aria-label="Próxima página"
            />
        </Flex>
        )}
      </MotionBox>
    </PageContainer>
  )
}

export default Leads 