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

// Custom theme colors based on #5deb99
const customColors = {
  primary: '#5deb99',
  primaryDark: '#4ac980',
  secondary: '#3dd6a3',
  secondaryDark: '#35b98c',
}

const ITEMS_PER_PAGE = 10

const Leads = () => {
  const tableBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const toast = useToast()

  const [leads, setLeads] = useState<Lead[]>([])
  const [totalLeads, setTotalLeads] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters and Pagination
  const [filters, setFilters] = useState<LeadFilters>({})
  const [sort, setSort] = useState<LeadSort>({ column: 'email', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchLeads()
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
      setError('Error loading leads')
      console.error('Error fetching leads:', err)
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
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await deleteLead(id)
        toast({
          title: 'Lead deleted successfully',
          status: 'success',
          duration: 3000,
        })
        fetchLeads()
      } catch (err) {
        toast({
          title: 'Error deleting lead',
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
        text: step,
      },
      contacted: {
        colorScheme: 'orange',
        text: step,
      },
      converted: {
        colorScheme: 'green',
        text: step,
      },
    }[step] || {
      colorScheme: 'gray',
      text: step,
    }

    return (
      <Badge
        colorScheme={props.colorScheme}
        px={2}
        py={1}
        borderRadius="full"
        textTransform="capitalize"
      >
        {props.text}
      </Badge>
    )
  }

  const totalPages = Math.ceil(totalLeads / ITEMS_PER_PAGE)

  return (
    <PageContainer
      title="Leads"
      description="Manage your leads and potential clients"
    >
      <HStack mb={6} spacing={4}>
        <InputGroup maxW="xs">
          <InputLeftElement pointerEvents="none" color="gray.400">
            <FiSearch />
          </InputLeftElement>
          <Input
            placeholder="Search by email..."
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
        <Table>
          <Thead>
            <Tr>
              <Th 
                cursor="pointer" 
                onClick={() => handleSort('email')}
              >
                Email {sort.column === 'email' && (sort.direction === 'asc' ? '↑' : '↓')}
              </Th>
              <Th 
                cursor="pointer" 
                onClick={() => handleSort('step')}
              >
                Step {sort.column === 'step' && (sort.direction === 'asc' ? '↑' : '↓')}
              </Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                <Td colSpan={3} textAlign="center" py={10}>
                  <Spinner color={customColors.primary} />
                </Td>
              </Tr>
            ) : leads.length === 0 ? (
              <Tr>
                <Td colSpan={3} textAlign="center" py={10}>
                  No leads found
                </Td>
              </Tr>
            ) : (
              leads.map((lead) => (
                <Tr key={lead.id}>
                  <Td fontWeight="medium">{lead.email}</Td>
                  <Td>{getStepBadge(lead.step)}</Td>
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
                        <MenuItem color="red.500" onClick={() => handleDeleteLead(lead.id)}>
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
            {totalLeads} leads found
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
    </PageContainer>
  )
}

export default Leads 