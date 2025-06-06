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
      setError('Error loading health insurance plans')
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
          title: 'Health insurance plan updated successfully',
          status: 'success',
          duration: 3000,
        })
      } else {
        await createConvenio(formData)
        toast({
          title: 'Health insurance plan created successfully',
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
        title: `Error ${selectedConvenio ? 'updating' : 'creating'} health insurance plan`,
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
    if (window.confirm('Are you sure you want to delete this health insurance plan?')) {
      try {
        await deleteConvenio(id)
        toast({
          title: 'Health insurance plan deleted successfully',
          status: 'success',
          duration: 3000,
        })
        fetchConvenios()
      } catch (err) {
        toast({
          title: 'Error deleting health insurance plan',
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
      title="Health Insurance Plans"
      description="Manage health insurance plans"
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
          New Insurance Plan
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
            ) : convenios.length === 0 ? (
              <Tr>
                <Td colSpan={2} textAlign="center" py={10}>
                  No health insurance plans found
                </Td>
              </Tr>
            ) : (
              convenios.map((convenio) => (
                <Tr key={convenio.id}>
                  <Td fontWeight="medium">{convenio.nome}</Td>
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
                          onClick={() => handleEdit(convenio)}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem 
                          color="red.500" 
                          onClick={() => handleDelete(convenio.id)}
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
            {totalConvenios} health insurance plans found
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
            {selectedConvenio ? 'Edit Insurance Plan' : 'New Insurance Plan'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Insurance plan name"
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
                {selectedConvenio ? 'Update' : 'Create'}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </PageContainer>
  )
}

export default Convenios 