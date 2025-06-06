import React, { useState, useEffect } from 'react'
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
  Instituicao,
  InstituicaoFilters,
  InstituicaoSort,
  PaginationParams,
  getInstituicoes,
  createInstituicao,
  updateInstituicao,
  deleteInstituicao,
} from '../../lib/instituicaoService'

const MotionBox = motion(Box)

// Custom theme colors based on #5deb99
const customColors = {
  primary: '#5deb99',
  primaryDark: '#4ac980',
  secondary: '#3dd6a3',
  secondaryDark: '#35b98c',
}

const ITEMS_PER_PAGE = 10

interface InstituicaoFormData {
  nome: string
}

const initialFormData: InstituicaoFormData = {
  nome: '',
}

const Instituicoes = () => {
  const tableBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([])
  const [totalInstituicoes, setTotalInstituicoes] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<InstituicaoFormData>(initialFormData)
  const [selectedInstituicao, setSelectedInstituicao] = useState<Instituicao | null>(null)

  // Filters and Pagination
  const [filters, setFilters] = useState<InstituicaoFilters>({})
  const [sort, setSort] = useState<InstituicaoSort>({ column: 'nome', direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchInstituicoes()
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

  const fetchInstituicoes = async () => {
    try {
      setIsLoading(true)
      const pagination: PaginationParams = {
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
      }
      const { instituicoes: fetchedInstituicoes, total } = await getInstituicoes(filters, sort, pagination)
      setInstituicoes(fetchedInstituicoes)
      setTotalInstituicoes(total)
      setError(null)
    } catch (err) {
      setError('Error loading residency institutions')
      console.error('Error fetching instituicoes:', err)
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
      if (selectedInstituicao) {
        await updateInstituicao(selectedInstituicao.id, formData)
        toast({
          title: 'Residency institution updated successfully',
          status: 'success',
          duration: 3000,
        })
      } else {
        await createInstituicao(formData)
        toast({
          title: 'Residency institution created successfully',
          status: 'success',
          duration: 3000,
        })
      }
      onClose()
      setFormData(initialFormData)
      setSelectedInstituicao(null)
      fetchInstituicoes()
    } catch (err) {
      toast({
        title: `Error ${selectedInstituicao ? 'updating' : 'creating'} residency institution`,
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleEdit = (instituicao: Instituicao) => {
    setSelectedInstituicao(instituicao)
    setFormData({ nome: instituicao.nome })
    onOpen()
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this residency institution?')) {
      try {
        await deleteInstituicao(id)
        toast({
          title: 'Residency institution deleted successfully',
          status: 'success',
          duration: 3000,
        })
        fetchInstituicoes()
      } catch (err) {
        toast({
          title: 'Error deleting residency institution',
          status: 'error',
          duration: 3000,
        })
      }
    }
  }

  const handleOpenModal = () => {
    setSelectedInstituicao(null)
    setFormData(initialFormData)
    onOpen()
  }

  const totalPages = Math.ceil(totalInstituicoes / ITEMS_PER_PAGE)

  return (
    <PageContainer
      title="Residency Institutions"
      description="Manage medical residency institutions"
    >
      <HStack mb={6} spacing={4}>
        <InputGroup maxW="xs">
          <InputLeftElement pointerEvents="none" color="gray.400">
            <FiSearch />
          </InputLeftElement>
          <Input
            placeholder="Search by name..."
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
          New Institution
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
                onClick={() => handleSort('nome')}
              >
                Name {sort.column === 'nome' && (sort.direction === 'asc' ? '↑' : '↓')}
              </Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                <Td colSpan={2} textAlign="center" py={10}>
                  <Spinner color={customColors.primary} />
                </Td>
              </Tr>
            ) : instituicoes.length === 0 ? (
              <Tr>
                <Td colSpan={2} textAlign="center" py={10}>
                  No residency institutions found
                </Td>
              </Tr>
            ) : (
              instituicoes.map((instituicao) => (
                <Tr key={instituicao.id}>
                  <Td fontWeight="medium">{instituicao.nome}</Td>
                  <Td textAlign="right">
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FiMoreVertical />}
                        variant="ghost"
                        size="sm"
                        borderRadius="full"
                      />
                      <MenuList>
                        <MenuItem 
                          icon={<FiEdit />}
                          onClick={() => handleEdit(instituicao)}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem 
                          color="red.500" 
                          onClick={() => handleDelete(instituicao.id)}
                        >
                          Remove
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
            {totalInstituicoes} residency institutions found
          </Text>
          <HStack spacing={2}>
            <IconButton
              icon={<FiChevronLeft />}
              aria-label="Previous page"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(currentPage - 1)}
            />
            <Text>
              Page {currentPage + 1} of {totalPages}
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

      {/* Create/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedInstituicao ? 'Edit Institution' : 'New Institution'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Institution name"
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
                {selectedInstituicao ? 'Update' : 'Create'}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </PageContainer>
  )
}

export default Instituicoes 