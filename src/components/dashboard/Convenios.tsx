import { useState, useEffect } from 'react'
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  VStack,
  useToast,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  Text,
  HStack,
} from '@chakra-ui/react'
import { FiMoreVertical, FiSearch, FiPlus, FiChevronLeft, FiChevronRight, FiEdit } from 'react-icons/fi'
import PageContainer from './PageContainer'
import { motion } from 'framer-motion'
import {
  Convenio,
  ConvenioFilters,
  ConvenioSort,
  PaginationParams,
  getConvenios,
  createConvenio,
  updateConvenio,
  deleteConvenio,
} from '../../lib/convenioService'

const MotionBox = motion(Box)

// Custom theme colors based on #5deb99
const customColors = {
  primary: '#5deb99',
  primaryDark: '#4ac980',
  secondary: '#3dd6a3',
  secondaryDark: '#35b98c',
}

const ITEMS_PER_PAGE = 10

interface ConvenioFormData {
  nome: string
}

const initialFormData: ConvenioFormData = {
  nome: '',
}

const Convenios = () => {
  const tableBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [convenios, setConvenios] = useState<Convenio[]>([])
  const [totalConvenios, setTotalConvenios] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ConvenioFormData>(initialFormData)
  const [selectedConvenio, setSelectedConvenio] = useState<Convenio | null>(null)

  // Filters and Pagination
  const [filters, setFilters] = useState<ConvenioFilters>({})
  const [sort, setSort] = useState<ConvenioSort>({ column: 'nome', direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchConvenios()
  }, [filters, sort, currentPage])

  // Add debounce to search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== (filters.search || '')) {
        setFilters({ ...filters, search: searchTerm })
        setCurrentPage(0)
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const fetchConvenios = async () => {
    try {
      setIsLoading(true)
      const pagination: PaginationParams = {
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
      }
      const { convenios: fetchedConvenios, total } = await getConvenios(filters, sort, pagination)
      setConvenios(fetchedConvenios)
      setTotalConvenios(total)
      setError(null)
    } catch (err) {
      setError('Erro ao carregar convênios')
      console.error('Error fetching convenios:', err)
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

  const handleCreateOrUpdate = async () => {
    try {
      if (selectedConvenio) {
        await updateConvenio(selectedConvenio.id, formData)
        toast({
          title: 'Convênio atualizado com sucesso',
          status: 'success',
          duration: 3000,
        })
      } else {
        await createConvenio(formData)
        toast({
          title: 'Convênio criado com sucesso',
          status: 'success',
          duration: 3000,
        })
      }
      onClose()
      setFormData(initialFormData)
      setSelectedConvenio(null)
      fetchConvenios()
    } catch (err) {
      toast({
        title: `Erro ao ${selectedConvenio ? 'atualizar' : 'criar'} convênio`,
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleEdit = (convenio: Convenio) => {
    setSelectedConvenio(convenio)
    setFormData({ nome: convenio.nome })
    onOpen()
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este convênio?')) {
      try {
        await deleteConvenio(id)
        toast({
          title: 'Convênio excluído com sucesso',
          status: 'success',
          duration: 3000,
        })
        fetchConvenios()
      } catch (err) {
        toast({
          title: 'Erro ao excluir convênio',
          status: 'error',
          duration: 3000,
        })
      }
    }
  }

  const handleOpenModal = () => {
    setSelectedConvenio(null)
    setFormData(initialFormData)
    onOpen()
  }

  const totalPages = Math.ceil(totalConvenios / ITEMS_PER_PAGE)

  return (
    <PageContainer
      title="Convênios"
      description="Gerencie planos de saúde e convênios"
    >
      <HStack mb={6} spacing={4}>
        <InputGroup maxW="xs">
          <InputLeftElement pointerEvents="none" color="gray.400">
            <FiSearch />
          </InputLeftElement>
          <Input
            placeholder="Pesquisar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg={useColorModeValue('white', 'gray.800')}
            borderRadius="lg"
          />
        </InputGroup>
        <Button
          leftIcon={<FiPlus />}
          bgGradient={`linear(to-r, ${customColors.primary}, ${customColors.secondary})`}
          color="white"
          onClick={handleOpenModal}
          _hover={{
            bgGradient: `linear(to-r, ${customColors.primaryDark}, ${customColors.secondaryDark})`,
          }}
          borderRadius="lg"
          px={6}
        >
          Novo Convênio
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
        <Box overflowX="auto">
          <Table size={{ base: "sm", md: "md" }}>
            <Thead>
              <Tr>
                <Th 
                  cursor="pointer" 
                  onClick={() => handleSort('nome')}
                  fontSize={{ base: "xs", md: "sm" }}
                  p={{ base: 2, md: 4 }}
                >
                  Nome {sort.column === 'nome' && (sort.direction === 'asc' ? '↑' : '↓')}
                </Th>
                <Th w={{ base: "60px", md: "80px" }} p={{ base: 2, md: 4 }}></Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading ? (
                <Tr>
                  <Td colSpan={2} textAlign="center" py={10}>
                    <Spinner color={customColors.primary} />
                  </Td>
                </Tr>
              ) : convenios.length === 0 ? (
                <Tr>
                  <Td colSpan={2} textAlign="center" py={10}>
                    Nenhum convênio encontrado
                  </Td>
                </Tr>
              ) : (
                convenios.map((convenio) => (
                  <Tr key={convenio.id}>
                    <Td 
                      fontWeight="medium" 
                      fontSize={{ base: "xs", md: "sm" }} 
                      p={{ base: 2, md: 4 }}
                      maxW={{ base: "200px", md: "300px" }}
                      whiteSpace="nowrap"
                      overflow="hidden"
                      textOverflow="ellipsis"
                    >
                      {convenio.nome}
                    </Td>
                    <Td textAlign="right" p={{ base: 1, md: 4 }}>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          variant="ghost"
                          size={{ base: "xs", md: "sm" }}
                          borderRadius="full"
                        />
                        <MenuList>
                          <MenuItem 
                            icon={<FiEdit />}
                            onClick={() => handleEdit(convenio)}
                          >
                            Editar
                          </MenuItem>
                          <MenuItem 
                            color="red.500" 
                            onClick={() => handleDelete(convenio.id)}
                          >
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
        </Box>

        {/* Pagination */}
        <Flex justify="space-between" align="center" px={{ base: 4, md: 6 }} py={4} flexWrap="wrap" gap={2}>
          <Text color="gray.600" fontSize={{ base: "xs", md: "sm" }}>
            {totalConvenios} convênios encontrados
          </Text>
          <HStack spacing={2}>
            <IconButton
              icon={<FiChevronLeft />}
              aria-label="Página anterior"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(currentPage - 1)}
              size={{ base: "xs", md: "sm" }}
            />
            <Text fontSize={{ base: "xs", md: "sm" }}>
              Página {currentPage + 1} de {totalPages}
            </Text>
            <IconButton
              icon={<FiChevronRight />}
              aria-label="Próxima página"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage(currentPage + 1)}
              size={{ base: "xs", md: "sm" }}
            />
          </HStack>
        </Flex>
      </MotionBox>

      {/* Create/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedConvenio ? 'Editar Convênio' : 'Novo Convênio'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Nome</FormLabel>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome do convênio"
                />
              </FormControl>

              <Button
                width="full"
                bgGradient={`linear(to-r, ${customColors.primary}, ${customColors.secondary})`}
                color="white"
                onClick={handleCreateOrUpdate}
                _hover={{
                  bgGradient: `linear(to-r, ${customColors.primaryDark}, ${customColors.secondaryDark})`,
                }}
              >
                {selectedConvenio ? 'Atualizar' : 'Criar'}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </PageContainer>
  )
}

export default Convenios 