import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Badge,
  Text,
  Divider,
  Spinner,
  Center,
  Button,
  useColorModeValue,
  Avatar,
  Flex,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
} from '@chakra-ui/react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import PageContainer from '../components/dashboard/PageContainer'

interface DoctorDetails {
  id: string
  nome: string
  crm: string
  aprovado: boolean
  created_at: string
  email: string
  telefone: string
  website?: string
  descricao?: string
  foto?: string
  diploma?: string
  especialidades: { nome: string }[]
  convenios: { nome: string }[]
  localizacoes: {
    nome_endereco: string
    cidade: string
    estado: string
  }[]
}

interface SupabaseDoctor {
  id: string
  nome: string
  crm: string
  aprovado: boolean
  created_at: string
  email: string
  telefone: string
  website?: string
  descricao?: string
  foto?: string
  diploma?: string
  medico_especialidade_residencia: {
    especialidade: {
      nome: string
    } | null
  }[]
  medico_convenios: {
    convenio: {
      nome: string
    } | null
  }[]
  localizacao: {
    nome_endereco: string
    cidade: string
    estado: string
  }[]
}

const DoctorDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [doctor, setDoctor] = React.useState<DoctorDetails | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = React.useState<string | null>(null)
  const [diplomaUrl, setDiplomaUrl] = React.useState<string | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  React.useEffect(() => {
    if (id) {
      fetchDoctorDetails()
    }
  }, [id])

  React.useEffect(() => {
    if (doctor?.foto) {
      setPhotoUrl(doctor.foto)
    }
    if (doctor?.diploma) {
      setDiplomaUrl(doctor.diploma)
    }
  }, [doctor?.foto, doctor?.diploma])

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('medico')
        .select(`
          id,
          nome,
          crm,
          aprovado,
          created_at,
          email,
          telefone,
          website,
          descricao,
          foto,
          diploma,
          medico_especialidade_residencia (
            especialidade:especialidade_id (nome)
          ),
          medico_convenios (
            convenio:convenio_id (nome)
          ),
          localizacao (
            nome_endereco,
            cidade,
            estado
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      if (data) {
        const supabaseData = data as unknown as SupabaseDoctor
        // Transform the data to match our interface
        const transformedData: DoctorDetails = {
          ...supabaseData,
          especialidades: supabaseData.medico_especialidade_residencia
            .map(e => e.especialidade)
            .filter((esp): esp is { nome: string } => esp !== null) || [],
          convenios: supabaseData.medico_convenios
            .map(c => c.convenio)
            .filter((conv): conv is { nome: string } => conv !== null) || [],
          localizacoes: supabaseData.localizacao || []
        }
        setDoctor(transformedData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching doctor details')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const handleBack = () => {
    navigate('/dashboard/medicos')
  }

  if (error) {
    return (
      <PageContainer title="Detalhes do Médico">
        <Center p={8}>
          <Text color="red.500">{error}</Text>
        </Center>
      </PageContainer>
    )
  }

  return (
    <PageContainer title="Detalhes do Médico">
      <Button
        leftIcon={<FiArrowLeft />}
        onClick={handleBack}
        mb={6}
        variant="ghost"
      >
        Voltar para lista
      </Button>

      {loading ? (
        <Center py={8}>
          <Spinner />
        </Center>
      ) : doctor ? (
        <Box
          bg={bgColor}
          borderRadius="2xl"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
          p={6}
        >
          <VStack align="stretch" spacing={4}>
            <Flex direction={{ base: 'column', md: 'row' }} gap={6} align="center">
              {doctor.foto ? (
                <Box
                  width="150px"
                  height="150px"
                  borderRadius="full"
                  overflow="hidden"
                >
                  <Image
                    src={photoUrl || undefined}
                    alt={doctor.nome}
                    width="100%"
                    height="100%"
                    objectFit="cover"
                    fallback={
                      <Avatar
                        size="2xl"
                        name={doctor.nome}
                        bg="green.500"
                      />
                    }
                  />
                </Box>
              ) : (
                <Avatar
                  size="2xl"
                  name={doctor.nome}
                  bg="green.500"
                />
              )}
              <Box flex="1">
                <HStack justify="space-between" align="flex-start" w="full">
                  <Box>
                    <Text fontSize="2xl" fontWeight="bold">{doctor.nome}</Text>
                    <Text color="gray.600">CRM: {doctor.crm}</Text>
                  </Box>
                  <Badge
                    colorScheme={doctor.aprovado ? 'green' : 'orange'}
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="md"
                  >
                    {doctor.aprovado ? 'Aprovado' : 'Pendente'}
                  </Badge>
                </HStack>
              </Box>
            </Flex>

            <Divider />

            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={3}>Informações de Contato</Text>
              <VStack align="start" spacing={2}>
                <Text>Email: {doctor.email || 'Não informado'}</Text>
                <Text>Telefone: {doctor.telefone || 'Não informado'}</Text>
                {doctor.website && <Text>Website: {doctor.website}</Text>}
              </VStack>
            </Box>

            {doctor.descricao && (
              <>
                <Divider />
                <Box>
                  <Text fontSize="lg" fontWeight="semibold" mb={3}>Sobre</Text>
                  <Text>{doctor.descricao}</Text>
                </Box>
              </>
            )}

            {doctor.diploma && (
              <>
                <Divider />
                <Box>
                  <Text fontSize="lg" fontWeight="semibold" mb={3}>Diploma</Text>
                  <Box
                    borderRadius="lg"
                    overflow="hidden"
                    maxW="300px"
                    cursor="pointer"
                    onClick={onOpen}
                    transition="transform 0.2s"
                    _hover={{ transform: 'scale(1.02)' }}
                  >
                    <Image
                      src={diplomaUrl || undefined}
                      alt="Diploma do médico"
                      width="100%"
                      fallback={
                        <Center p={8} bg="gray.100" borderRadius="lg">
                          <Text color="gray.500">Erro ao carregar diploma</Text>
                        </Center>
                      }
                    />
                  </Box>
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    Clique na imagem para ampliar
                  </Text>
                </Box>

                <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>Diploma de {doctor.nome}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                      <Image
                        src={diplomaUrl || undefined}
                        alt="Diploma do médico"
                        width="100%"
                        fallback={
                          <Center p={8} bg="gray.100" borderRadius="lg">
                            <Text color="gray.500">Erro ao carregar diploma</Text>
                          </Center>
                        }
                      />
                    </ModalBody>
                  </ModalContent>
                </Modal>
              </>
            )}

            <Divider />

            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={3}>Especialidades</Text>
              <HStack spacing={2} flexWrap="wrap">
                {doctor.especialidades.length > 0 ? (
                  doctor.especialidades.map((esp, index) => (
                    <Badge key={index} colorScheme="blue" px={3} py={1} fontSize="md">
                      {esp.nome}
                    </Badge>
                  ))
                ) : (
                  <Text color="gray.500">Nenhuma especialidade cadastrada</Text>
                )}
              </HStack>
            </Box>

            <Divider />

            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={3}>Convênios</Text>
              <HStack spacing={2} flexWrap="wrap">
                {doctor.convenios.length > 0 ? (
                  doctor.convenios.map((conv, index) => (
                    <Badge key={index} colorScheme="purple" px={3} py={1} fontSize="md">
                      {conv.nome}
                    </Badge>
                  ))
                ) : (
                  <Text color="gray.500">Nenhum convênio cadastrado</Text>
                )}
              </HStack>
            </Box>

            <Divider />

            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={3}>Localizações</Text>
              <VStack align="stretch" spacing={3}>
                {doctor.localizacoes.length > 0 ? (
                  doctor.localizacoes.map((loc, index) => (
                    <Box key={index} p={4} bg="gray.50" borderRadius="lg">
                      <Text fontWeight="medium">{loc.nome_endereco}</Text>
                      <Text fontSize="md" color="gray.600">
                        {loc.cidade}, {loc.estado}
                      </Text>
                    </Box>
                  ))
                ) : (
                  <Text color="gray.500">Nenhuma localização cadastrada</Text>
                )}
              </VStack>
            </Box>

            <Divider />

            <Text fontSize="sm" color="gray.500">
              Data de cadastro: {formatDate(doctor.created_at)}
            </Text>
          </VStack>
        </Box>
      ) : (
        <Center py={8}>
          <Text>Médico não encontrado</Text>
        </Center>
      )}
    </PageContainer>
  )
}

export default DoctorDetails 