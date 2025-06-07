import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  VStack,
  Text,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  Heading,
  List,
  ListItem,
  Badge,
  HStack,
  IconButton,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react'
import { FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi'
import PageContainer from './PageContainer'
import { motion } from 'framer-motion'
import { Especialidade, getEspecialidades } from '../../lib/especialidadeService'

const MotionBox = motion(Box)

// Custom theme colors based on #5deb99
const customColors = {
  primary: '#5deb99',
  primaryDark: '#4ac980',
  secondary: '#3dd6a3',
  secondaryDark: '#35b98c',
}

const ITEMS_PER_PAGE = 5

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems: number
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
}) => (
  <Flex justify="space-between" align="center" mt={4}>
    <Text color="gray.600" fontSize="sm">
      {totalItems} itens
    </Text>
    <HStack spacing={2}>
      <IconButton
        icon={<FiChevronLeft />}
        aria-label="Página anterior"
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
        size="sm"
      />
      <Text fontSize="sm">
        Página {currentPage + 1} de {Math.max(1, totalPages)}
      </Text>
      <IconButton
        icon={<FiChevronRight />}
        aria-label="Próxima página"
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
        size="sm"
      />
    </HStack>
  </Flex>
)

const Especialidades = () => {
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [directPage, setDirectPage] = useState(0)
  const [subspecialtyPage, setSubspecialtyPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    fetchEspecialidades()
  }, [])

  // Reset pagination when search term changes
  useEffect(() => {
    setDirectPage(0)
    setSubspecialtyPage(0)
  }, [searchTerm])

  const fetchEspecialidades = async () => {
    try {
      setIsLoading(true)
      const data = await getEspecialidades()
      setEspecialidades(data)
      setError(null)
    } catch (err) {
      setError('Erro ao carregar especialidades')
      console.error('Error fetching especialidades:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filterSpecialties = (items: Especialidade[]) => {
    if (!searchTerm) return items
    return items.filter(item => 
      item.nome.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const directSpecialties = filterSpecialties(especialidades.filter(esp => esp.tipo === 'D'))
  const subspecialties = filterSpecialties(especialidades.filter(esp => esp.tipo === 'E'))

  const paginateItems = <T extends unknown>(items: T[], page: number, itemsPerPage: number) => {
    const start = page * itemsPerPage
    const end = start + itemsPerPage
    return items.slice(start, end)
  }

  const directSpecialtiesPage = paginateItems(directSpecialties, directPage, ITEMS_PER_PAGE)
  const subspecialtiesPage = paginateItems(subspecialties, subspecialtyPage, ITEMS_PER_PAGE)

  const directTotalPages = Math.ceil(directSpecialties.length / ITEMS_PER_PAGE)
  const subspecialtyTotalPages = Math.ceil(subspecialties.length / ITEMS_PER_PAGE)

  if (isLoading) {
    return (
      <PageContainer
        title="Especialidades"
        description="Visualize todas as especialidades médicas"
      >
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <Spinner color={customColors.primary} size="xl" />
        </Box>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer
        title="Especialidades"
        description="Visualize todas as especialidades médicas"
      >
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Especialidades"
      description="Visualize todas as especialidades médicas"
    >
      {/* Search Bar */}
      <Box mb={6}>
        <InputGroup maxW="md">
          <InputLeftElement pointerEvents="none" color="gray.400">
            <FiSearch />
          </InputLeftElement>
          <Input
            placeholder="Pesquisar especialidades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg={useColorModeValue('white', 'gray.800')}
            borderRadius="lg"
          />
        </InputGroup>
      </Box>

      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={8}>
        {/* Direct Specialties */}
        <MotionBox
          bg={cardBg}
          borderRadius="2xl"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
          p={6}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <VStack align="stretch" spacing={4}>
            <Heading size="md" color={customColors.primary}>
              Especialidade Acesso Direto
              <Badge ml={2} colorScheme="green" fontSize="xs">
                {directSpecialties.length}
              </Badge>
            </Heading>
            <List spacing={3}>
              {directSpecialtiesPage.map(specialty => (
                <ListItem
                  key={specialty.id}
                  p={3}
                  bg={useColorModeValue('gray.50', 'gray.700')}
                  borderRadius="md"
                  transition="all 0.2s"
                  _hover={{
                    bg: useColorModeValue('gray.100', 'gray.600'),
                    transform: 'translateX(4px)',
                  }}
                >
                  <Text>{specialty.nome}</Text>
                </ListItem>
              ))}
              {directSpecialtiesPage.length === 0 && (
                <ListItem p={3} textAlign="center" color="gray.500">
                  Nenhuma especialidade encontrada
                </ListItem>
              )}
            </List>
            <PaginationControls
              currentPage={directPage}
              totalPages={directTotalPages}
              onPageChange={setDirectPage}
              totalItems={directSpecialties.length}
            />
          </VStack>
        </MotionBox>

        {/* Subspecialties */}
        <MotionBox
          bg={cardBg}
          borderRadius="2xl"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
          p={6}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <VStack align="stretch" spacing={4}>
            <Heading size="md" color={customColors.secondary}>
              Especialidades com pré requisito
              <Badge ml={2} colorScheme="purple" fontSize="xs">
                {subspecialties.length}
              </Badge>
            </Heading>
            <List spacing={3}>
              {subspecialtiesPage.map(specialty => (
                <ListItem
                  key={specialty.id}
                  p={3}
                  bg={useColorModeValue('gray.50', 'gray.700')}
                  borderRadius="md"
                  transition="all 0.2s"
                  _hover={{
                    bg: useColorModeValue('gray.100', 'gray.600'),
                    transform: 'translateX(4px)',
                  }}
                >
                  <Text>{specialty.nome}</Text>
                </ListItem>
              ))}
              {subspecialtiesPage.length === 0 && (
                <ListItem p={3} textAlign="center" color="gray.500">
                  Nenhuma subespecialidade encontrada
                </ListItem>
              )}
            </List>
            <PaginationControls
              currentPage={subspecialtyPage}
              totalPages={subspecialtyTotalPages}
              onPageChange={setSubspecialtyPage}
              totalItems={subspecialties.length}
            />
          </VStack>
        </MotionBox>
      </Grid>
    </PageContainer>
  )
}

export default Especialidades 