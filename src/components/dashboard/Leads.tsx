import React, { useState, useEffect } from 'react'
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
  Tag,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  VStack,
  Textarea,
  useToast,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react'
import { FiMoreVertical, FiSearch, FiUserPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import PageContainer from './PageContainer'
import { motion } from 'framer-motion'
import {
  Lead,
  LeadFilters,
  LeadSort,
  PaginationParams,
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  getLeadSources,
} from '../../lib/leadService'

const MotionBox = motion(Box)

// Custom theme colors based on #5deb99
const customColors = {
  primary: '#5deb99',
  primaryDark: '#4ac980',
  secondary: '#3dd6a3',
  secondaryDark: '#35b98c',
}

const ITEMS_PER_PAGE = 10

interface LeadFormData {
  name: string
  email: string
  phone: string
  source: string
  status: 'new' | 'contacted' | 'converted'
  notes?: string
}

const initialFormData: LeadFormData = {
  name: '',
  email: '',
  phone: '',
  source: '',
  status: 'new',
  notes: '',
}

const Leads = () => {
  const tableBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [leads, setLeads] = useState<Lead[]>([])
  const [totalLeads, setTotalLeads] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<LeadFormData>(initialFormData)
  const [sources, setSources] = useState<string[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  // Filters and Pagination
  const [filters, setFilters] = useState<LeadFilters>({})
  const [sort, setSort] = useState<LeadSort>({ column: 'created_at', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchLeads()
    fetchSources()
  }, [filters, sort, currentPage])

  const fetchLeads = async () => {
    try {
      setIsLoading(true)
      const pagination: PaginationParams = {
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
      }
      const { leads: fetchedLeads, total } = await getLeads(filters, sort, pagination)
      setLeads(fetchedLeads)
      setTotalLeads(total)
      setError(null)
    } catch (err) {
      setError('Erro ao carregar leads')
      console.error('Error fetching leads:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSources = async () => {
    try {
      const fetchedSources = await getLeadSources()
      setSources(fetchedSources)
    } catch (err) {
      console.error('Error fetching sources:', err)
    }
  }

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm })
    setCurrentPage(0)
  }

  const handleSort = (column: string) => {
    setSort({
      column,
      direction: sort.column === column && sort.direction === 'asc' ? 'desc' : 'asc',
    })
  }

  const handleCreateLead = async () => {
    try {
      await createLead(formData)
      toast({
        title: 'Lead criado com sucesso',
        status: 'success',
        duration: 3000,
      })
      onClose()
      setFormData(initialFormData)
      fetchLeads()
    } catch (err) {
      toast({
        title: 'Erro ao criar lead',
        description: 'Por favor, tente novamente',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleUpdateStatus = async (id: number, newStatus: Lead['status']) => {
    try {
      await updateLead(id, { status: newStatus })
      toast({
        title: 'Status atualizado com sucesso',
        status: 'success',
        duration: 3000,
      })
      fetchLeads()
    } catch (err) {
      toast({
        title: 'Erro ao atualizar status',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleDeleteLead = async (id: number) => {
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

  const getStatusBadge = (status: string) => {
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
    }[status]

    return (
      <Badge
        colorScheme={props?.colorScheme}
        px={2}
        py={1}
        borderRadius="full"
        textTransform="capitalize"
      >
        {props?.text}
      </Badge>
    )
  }

  const totalPages = Math.ceil(totalLeads / ITEMS_PER_PAGE)

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
            placeholder="Buscar leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            bg={useColorModeValue('white', 'gray.800')}
            borderRadius="lg"
          />
        </InputGroup>
        <Button
          leftIcon={<FiUserPlus />}
          bgGradient={`linear(to-r, ${customColors.primary}, ${customColors.secondary})`}
          color="white"
          onClick={onOpen}
          _hover={{
            bgGradient: `linear(to-r, ${customColors.primaryDark}, ${customColors.secondaryDark})`,
          }}
          borderRadius="lg"
          px={6}
        >
          Novo Lead
        </Button>
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
        <Table>
          <Thead>
            <Tr>
              <Th 
                cursor="pointer" 
                onClick={() => handleSort('name')}
              >
                Nome {sort.column === 'name' && (sort.direction === 'asc' ? '↑' : '↓')}
              </Th>
              <Th>Contato</Th>
              <Th 
                cursor="pointer" 
                onClick={() => handleSort('source')}
              >
                Origem {sort.column === 'source' && (sort.direction === 'asc' ? '↑' : '↓')}
              </Th>
              <Th 
                cursor="pointer" 
                onClick={() => handleSort('status')}
              >
                Status {sort.column === 'status' && (sort.direction === 'asc' ? '↑' : '↓')}
              </Th>
              <Th 
                cursor="pointer" 
                onClick={() => handleSort('created_at')}
              >
                Data de Cadastro {sort.column === 'created_at' && (sort.direction === 'asc' ? '↑' : '↓')}
              </Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                <Td colSpan={6} textAlign="center" py={10}>
                  <Spinner color={customColors.primary} />
                </Td>
              </Tr>
            ) : leads.length === 0 ? (
              <Tr>
                <Td colSpan={6} textAlign="center" py={10}>
                  Nenhum lead encontrado
                </Td>
              </Tr>
            ) : (
              leads.map((lead) => (
                <Tr key={lead.id}>
                  <Td fontWeight="medium">{lead.name}</Td>
                  <Td>
                    <Box>
                      <Text fontSize="sm">{lead.email}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {lead.phone}
                      </Text>
                    </Box>
                  </Td>
                  <Td>
                    <Tag size="sm" borderRadius="full">
                      {lead.source}
                    </Tag>
                  </Td>
                  <Td>{getStatusBadge(lead.status)}</Td>
                  <Td>{new Date(lead.created_at).toLocaleDateString('pt-BR')}</Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FiMoreVertical />}
                        variant="ghost"
                        size="sm"
                        borderRadius="full"
                      />
                      <MenuList>
                        <MenuItem onClick={() => setSelectedLead(lead)}>Ver detalhes</MenuItem>
                        <MenuItem onClick={() => handleUpdateStatus(lead.id, 'contacted')}>
                          Marcar como contatado
                        </MenuItem>
                        <MenuItem onClick={() => handleUpdateStatus(lead.id, 'converted')}>
                          Marcar como convertido
                        </MenuItem>
                        <MenuItem color="red.500" onClick={() => handleDeleteLead(lead.id)}>
                          Remover
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>

        {/* Pagination */}
        <Flex justify="space-between" align="center" px={6} py={4}>
          <Text color="gray.600">
            {totalLeads} leads encontrados
          </Text>
          <HStack spacing={2}>
            <IconButton
              icon={<FiChevronLeft />}
              aria-label="Previous page"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(currentPage - 1)}
            />
            <Text>
              Página {currentPage + 1} de {totalPages}
            </Text>
            <IconButton
              icon={<FiChevronRight />}
              aria-label="Next page"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage(currentPage + 1)}
            />
          </HStack>
        </Flex>
      </MotionBox>

      {/* Create/Edit Lead Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedLead ? 'Editar Lead' : 'Novo Lead'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Nome</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome completo"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  type="email"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Telefone</FormLabel>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Origem</FormLabel>
                <Select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="Selecione a origem"
                >
                  {sources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Observações</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Adicione observações sobre o lead"
                />
              </FormControl>

              <Button
                width="full"
                bgGradient={`linear(to-r, ${customColors.primary}, ${customColors.secondary})`}
                color="white"
                onClick={handleCreateLead}
                _hover={{
                  bgGradient: `linear(to-r, ${customColors.primaryDark}, ${customColors.secondaryDark})`,
                }}
              >
                {selectedLead ? 'Salvar Alterações' : 'Criar Lead'}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </PageContainer>
  )
}

export default Leads 