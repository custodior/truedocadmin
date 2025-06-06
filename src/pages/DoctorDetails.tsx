import React from 'react'
import {
  Box,
  Button,
  Center,
  Text,
  Image,
  Avatar,
  Spinner,
  VStack,
  HStack,
  Stack,
  Badge,
  Link,
  Icon,
  Tooltip,
  ButtonGroup,
  FormControl,
  FormLabel,
  Switch,
  Heading,
  useToast,
  useColorModeValue,
  Flex,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  IconButton,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft, FiFileText, FiEdit } from 'react-icons/fi'
import {
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaLinkedin,
  FaTwitter,
} from 'react-icons/fa'
import PageContainer from '../components/dashboard/PageContainer'
import DoctorEditForm from '../components/dashboard/DoctorEditForm'
import { DoctorFormData } from '../components/dashboard/DoctorEditForm'

type ContactFormType = 'whatsapp' | 'site' | 'instagram' | 'telefone'

interface Comprovante {
  arquivo: string
  medico_id: string
}

// Update interface to match actual table structure
interface ComprovanteEspecialidade {
  id: string
  medico_id: string
  arquivo: string
}

// Add type definitions for the Supabase response
interface SupabaseDoctor {
  id: string
  nome: string
  crm: string
  aprovado: boolean
  created_at: string
  email: string
  website?: string
  descricao?: string
  foto?: string
  diploma?: string
  rqe?: string
  new_rqe?: string
  faculdade?: {
    nome: string
  }
  faculdade_outro?: string
  forma_contato?: string
  contato?: string
  facebook?: string
  instagram?: string
  tiktok?: string
  linkedin?: string
  twitter?: string
  teleconsulta?: boolean
  convenio_outro?: string
  medico_especialidade_residencia: Array<{
    id: string
    especialidade?: {
      nome: string
    }
    instituicao_residencia?: {
      nome: string
    }
    instituicao_residencia_outra?: string
    show_profile: boolean
    aprovado: boolean
  }>
  medico_subespecialidade_residencia: Array<{
    id: string
    subespecialidade_nome: string
    instituicao_residencia?: {
      nome: string
    }
    instituicao_residencia_outra?: string
    aprovado: boolean
  }>
  formacao_outros: Array<{
    id: string
    nome: string
    show_profile: boolean
    aprovado: boolean
  }>
  medico_convenios: Array<{
    convenio?: {
      nome: string
    }
  }>
  localizacao: Array<{
    nome_endereco: string
    cep: string
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    telefone: string
  }>
}

const DoctorDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [doctor, setDoctor] = React.useState<DoctorFormData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = React.useState<string | null>(null)
  const [diplomaUrl, setDiplomaUrl] = React.useState<string | null>(null)
  const [isPdfDiploma, setIsPdfDiploma] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [comprovantes, setComprovantes] = React.useState<ComprovanteEspecialidade[]>([])
  const [comprovanteUrls, setComprovanteUrls] = React.useState<{ [key: string]: string }>({})
  const { isOpen: isDiplomaOpen, onOpen: onDiplomaOpen, onClose: onDiplomaClose } = useDisclosure()
  const { isOpen: isComprovanteOpen, onOpen: onComprovanteOpen, onClose: onComprovanteClose } = useDisclosure()
  const [selectedComprovante, setSelectedComprovante] = React.useState<{url: string, isPdf: boolean, filename: string} | null>(null)

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  React.useEffect(() => {
    if (id) {
      fetchDoctorDetails()
      fetchComprovantes()
    }
  }, [id])

  React.useEffect(() => {
    if (doctor?.foto) {
      setPhotoUrl(doctor.foto)
    }
    if (doctor?.diploma) {
      setDiplomaUrl(doctor.diploma)
      setIsPdfDiploma(doctor.diploma.toLowerCase().endsWith('.pdf'))
    }
  }, [doctor?.foto, doctor?.diploma])

  // Add useEffect to get comprovante URLs
  React.useEffect(() => {
    // Since comprovantes are in a public bucket, we can use the URLs directly
    const urls: { [key: string]: string } = {}
    for (const comprovante of comprovantes) {
      urls[comprovante.id] = comprovante.arquivo
    }
    setComprovanteUrls(urls)
  }, [comprovantes])

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true)
      
      const { data: supabaseData, error } = await supabase
        .from('medico')
        .select(`
          id,
          nome,
          crm,
          aprovado,
          created_at,
          email,
          website,
          descricao,
          foto,
          diploma,
          rqe,
          new_rqe,
          faculdade:faculdade_id (nome),
          faculdade_outro,
          forma_contato,
          contato,
          facebook,
          instagram,
          tiktok,
          linkedin,
          twitter,
          teleconsulta,
          convenio_outro,
          medico_especialidade_residencia (
            id,
            especialidade:especialidade_id (nome),
            instituicao_residencia:instituicao_residencia_id (nome),
            instituicao_residencia_outra,
            show_profile,
            aprovado
          ),
          medico_subespecialidade_residencia (
            id,
            subespecialidade_nome,
            instituicao_residencia:instituicao_residencia_id (nome),
            instituicao_residencia_outra,
            aprovado
          ),
          formacao_outros (
            id,
            nome,
            show_profile,
            aprovado
          ),
          medico_convenios (
            convenio:convenio_id (nome)
          ),
          localizacao (
            nome_endereco,
            cep,
            logradouro,
            numero,
            complemento,
            bairro,
            cidade,
            estado,
            telefone
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      if (supabaseData) {
        const data = supabaseData as unknown as SupabaseDoctor
        // Transform the data to match our interface
        const transformedData: DoctorFormData = {
          id: data.id,
          nome: data.nome,
          crm: data.crm,
          aprovado: data.aprovado,
          created_at: data.created_at,
          email: data.email,
          website: data.website,
          descricao: data.descricao,
          foto: data.foto,
          diploma: data.diploma,
          rqe: data.rqe,
          new_rqe: data.new_rqe,
          faculdade: data.faculdade,
          faculdade_outro: data.faculdade_outro,
          forma_contato: data.forma_contato as ContactFormType,
          contato: data.contato,
          facebook: data.facebook,
          instagram: data.instagram,
          tiktok: data.tiktok,
          linkedin: data.linkedin,
          twitter: data.twitter,
          teleconsulta: data.teleconsulta,
          convenio_outro: data.convenio_outro,
          especialidades: data.medico_especialidade_residencia.map(e => ({
            id: e.id,
            nome: e.especialidade?.nome || '',
            instituicao_residencia: e.instituicao_residencia ? {
              nome: e.instituicao_residencia.nome
            } : undefined,
            instituicao_residencia_outra: e.instituicao_residencia_outra,
            show_profile: Boolean(e.show_profile),
            aprovado: Boolean(e.aprovado)
          })),
          subespecialidades: data.medico_subespecialidade_residencia.map(s => ({
            id: s.id,
            subespecialidade_nome: s.subespecialidade_nome,
            instituicao_residencia: s.instituicao_residencia ? {
              nome: s.instituicao_residencia.nome
            } : undefined,
            instituicao_residencia_outra: s.instituicao_residencia_outra,
            aprovado: Boolean(s.aprovado)
          })),
          formacao_outros: data.formacao_outros.map(f => ({
            id: f.id,
            nome: f.nome,
            show_profile: Boolean(f.show_profile),
            aprovado: Boolean(f.aprovado)
          })),
          convenios: data.medico_convenios
            .map(c => c.convenio)
            .filter((conv): conv is { nome: string } => conv !== null),
          localizacoes: data.localizacao.map(loc => ({
            nome_endereco: loc.nome_endereco,
            cep: loc.cep,
            logradouro: loc.logradouro,
            numero: loc.numero,
            complemento: loc.complemento,
            bairro: loc.bairro,
            cidade: loc.cidade,
            estado: loc.estado,
            telefone: loc.telefone
          }))
        }
        setDoctor(transformedData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching doctor details')
    } finally {
      setLoading(false)
    }
  }

  const fetchComprovantes = async () => {
    try {
      console.log('Fetching comprovantes for doctor:', id)
      const { data, error } = await supabase
        .from('comprovante_especialidade')
        .select('id, medico_id, arquivo')
        .eq('medico_id', id)

      if (error) {
        console.error('Error fetching comprovantes:', error)
        throw error
      }

      console.log('Fetched comprovantes:', data)
      setComprovantes(data || [])
    } catch (err) {
      console.error('Error in fetchComprovantes:', err)
      setError(err instanceof Error ? err.message : 'Error fetching comprovantes')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const handleBack = () => {
    navigate('/dashboard/medicos')
  }

  const handleViewDiploma = () => {
    onDiplomaOpen()
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSaveEdit = () => {
    setIsEditing(false)
    fetchDoctorDetails() // Refresh the data
  }

  const handleViewComprovante = (url: string, arquivo: string) => {
    const isPdf = url.toLowerCase().endsWith('.pdf')
    const filename = url.split('/').pop() || ''
    setSelectedComprovante({ url, isPdf, filename })
    onComprovanteOpen()
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
      <HStack justify="space-between" mb={6}>
        <Button
          leftIcon={<FiArrowLeft />}
          onClick={handleBack}
          variant="ghost"
        >
          Voltar para lista
        </Button>
        {!isEditing && (
          <Button
            leftIcon={<FiEdit />}
            onClick={handleEdit}
            colorScheme="blue"
          >
            Editar
          </Button>
        )}
      </HStack>

      {loading ? (
        <Center py={8}>
          <Spinner />
        </Center>
      ) : error ? (
        <Center p={8}>
          <Text color="red.500">{error}</Text>
        </Center>
      ) : doctor ? (
        isEditing ? (
          <DoctorEditForm
            doctor={doctor}
            onCancel={handleCancelEdit}
            onSave={handleSaveEdit}
          />
        ) : (
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
                <Box mb={4}>
                  <Button
                    leftIcon={<FiFileText />}
                    onClick={handleViewDiploma}
                    colorScheme="blue"
                    variant="outline"
                    size="md"
                  >
                    Visualizar Diploma
                  </Button>
                </Box>
              )}

              <Divider />

              {/* Professional Information */}
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={3}>Informações Profissionais</Text>
                <VStack align="start" spacing={2}>
                  <Text><strong>RQE:</strong> {doctor.rqe || 'Não informado'}</Text>
                  {doctor.new_rqe && <Text><strong>Novo RQE:</strong> {doctor.new_rqe}</Text>}
                  <Text>
                    <strong>Faculdade:</strong>{' '}
                    {doctor.faculdade?.nome || doctor.faculdade_outro || 'Não informada'}
                  </Text>
                </VStack>
              </Box>

              <Divider />

              {/* Especialidades */}
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={3}>Especialidades</Text>
                {doctor.especialidades.length > 0 ? (
                  <VStack align="start" spacing={4}>
                    {doctor.especialidades.map((esp, index) => (
                      <Box key={esp.id} w="100%">
                        <HStack spacing={2} mb={2}>
                          <Text fontWeight="medium">{esp.nome}</Text>
                          <Badge colorScheme={esp.aprovado ? 'green' : 'orange'}>
                            {esp.aprovado ? 'Aprovada' : 'Pendente'}
                          </Badge>
                          {esp.show_profile && (
                            <Badge colorScheme="blue">Exibir no Perfil</Badge>
                          )}
                        </HStack>
                        {esp.instituicao_residencia && (
                          <Text color="gray.600" fontSize="sm">
                            Instituição: {esp.instituicao_residencia.nome}
                          </Text>
                        )}
                        {esp.instituicao_residencia_outra && (
                          <Text color="gray.600" fontSize="sm">
                            Instituição: {esp.instituicao_residencia_outra}
                          </Text>
                        )}
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <Text color="gray.500">Nenhuma especialidade cadastrada</Text>
                )}
              </Box>

              <Divider />

              {/* Subespecialidades */}
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={3}>Subespecialidades</Text>
                {doctor.subespecialidades.length > 0 ? (
                  <VStack align="start" spacing={4}>
                    {doctor.subespecialidades.map((sub) => (
                      <Box key={sub.id} w="100%">
                        <HStack spacing={2} mb={2}>
                          <Text fontWeight="medium">{sub.subespecialidade_nome}</Text>
                          <Badge colorScheme={sub.aprovado ? 'green' : 'orange'}>
                            {sub.aprovado ? 'Aprovada' : 'Pendente'}
                          </Badge>
                        </HStack>
                        {sub.instituicao_residencia && (
                          <Text color="gray.600" fontSize="sm">
                            Instituição: {sub.instituicao_residencia.nome}
                          </Text>
                        )}
                        {sub.instituicao_residencia_outra && (
                          <Text color="gray.600" fontSize="sm">
                            Instituição: {sub.instituicao_residencia_outra}
                          </Text>
                        )}
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <Text color="gray.500">Nenhuma subespecialidade cadastrada</Text>
                )}
              </Box>

              <Divider />

              {/* Comprovantes Section */}
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={3}>
                  Comprovantes Especialidade e Subespecialidades
                </Text>
                {comprovantes.length > 0 ? (
                  <Wrap spacing={4}>
                    {comprovantes.map((comprovante, index) => (
                      comprovanteUrls[comprovante.id] && (
                        <WrapItem key={comprovante.id}>
                          <Button
                            leftIcon={<FiFileText />}
                            onClick={() => handleViewComprovante(comprovanteUrls[comprovante.id], comprovante.arquivo)}
                            colorScheme="blue"
                            variant="outline"
                            size="md"
                          >
                            Ver Comprovante {index + 1}
                          </Button>
                        </WrapItem>
                      )
                    ))}
                  </Wrap>
                ) : (
                  <Text color="gray.500">Nenhum comprovante cadastrado</Text>
                )}
              </Box>

              <Divider />

              {/* Outras Formações */}
              {doctor.formacao_outros.length > 0 && (
                <>
                  <Box>
                    <Text fontSize="lg" fontWeight="semibold" mb={3}>Outras Formações</Text>
                    <VStack align="start" spacing={4}>
                      {doctor.formacao_outros.map((formacao) => (
                        <Box key={formacao.id} w="100%">
                          <HStack spacing={2}>
                            <Text fontWeight="medium">{formacao.nome}</Text>
                            <Badge colorScheme={formacao.aprovado ? 'green' : 'orange'}>
                              {formacao.aprovado ? 'Aprovada' : 'Pendente'}
                            </Badge>
                            {formacao.show_profile && (
                              <Badge colorScheme="blue">Exibir no Perfil</Badge>
                            )}
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                  <Divider />
                </>
              )}

              {/* Convênios */}
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={3}>Convênios</Text>
                {doctor.convenios.length > 0 || doctor.convenio_outro ? (
                  <VStack align="start" spacing={2}>
                    <Wrap spacing={2}>
                      {doctor.convenios.map((conv, index) => (
                        <WrapItem key={index}>
                          <Badge colorScheme="purple" px={3} py={1} fontSize="md">
                            {conv.nome}
                          </Badge>
                        </WrapItem>
                      ))}
                    </Wrap>
                    {doctor.convenio_outro && (
                      <Text mt={2}>
                        <strong>Outros convênios:</strong> {doctor.convenio_outro}
                      </Text>
                    )}
                  </VStack>
                ) : (
                  <Text color="gray.500">Nenhum convênio cadastrado</Text>
                )}
              </Box>

              <Divider />

              {/* Redes Sociais e Contato */}
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={3}>Redes Sociais e Contato</Text>
                <VStack align="start" spacing={2}>
                  {doctor.forma_contato && (
                    <Text>
                      <strong>Forma de Contato Preferida:</strong>{' '}
                      {doctor.forma_contato.charAt(0).toUpperCase() + doctor.forma_contato.slice(1)}
                    </Text>
                  )}
                  {doctor.contato && (
                    <Text><strong>Contato:</strong> {doctor.contato}</Text>
                  )}
                  {doctor.facebook && (
                    <HStack>
                      <Icon as={FaFacebook} color="blue.500" />
                      <Link href={doctor.facebook} isExternal color="blue.500">
                        Facebook
                      </Link>
                    </HStack>
                  )}
                  {doctor.instagram && (
                    <HStack>
                      <Icon as={FaInstagram} color="pink.500" />
                      <Link href={doctor.instagram} isExternal color="pink.500">
                        Instagram
                      </Link>
                    </HStack>
                  )}
                  {doctor.tiktok && (
                    <HStack>
                      <Icon as={FaTiktok} />
                      <Link href={doctor.tiktok} isExternal>
                        TikTok
                      </Link>
                    </HStack>
                  )}
                  {doctor.linkedin && (
                    <HStack>
                      <Icon as={FaLinkedin} color="blue.600" />
                      <Link href={doctor.linkedin} isExternal color="blue.600">
                        LinkedIn
                      </Link>
                    </HStack>
                  )}
                  {doctor.twitter && (
                    <HStack>
                      <Icon as={FaTwitter} color="blue.400" />
                      <Link href={doctor.twitter} isExternal color="blue.400">
                        Twitter
                      </Link>
                    </HStack>
                  )}
                </VStack>
              </Box>

              {/* Teleconsulta */}
              {doctor.teleconsulta && (
                <>
                  <Divider />
                  <Box>
                    <HStack>
                      <Badge colorScheme="green" px={3} py={1} fontSize="md">
                        Oferece Teleconsulta
                      </Badge>
                    </HStack>
                  </Box>
                </>
              )}

              {/* Endereços */}
              {doctor.localizacoes.length > 0 && (
                <>
                  <Divider />
                  <Box>
                    <Text fontSize="lg" fontWeight="semibold" mb={3}>Endereços</Text>
                    <VStack align="start" spacing={4}>
                      {doctor.localizacoes.map((loc, index) => (
                        <Box key={index} p={4} bg="gray.50" borderRadius="md" w="100%">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium">{loc.nome_endereco}</Text>
                            <Text>
                              {loc.logradouro}, {loc.numero}
                              {loc.complemento && `, ${loc.complemento}`}
                            </Text>
                            <Text>{loc.bairro}</Text>
                            <Text>
                              {loc.cidade} - {loc.estado}
                            </Text>
                            <Text>CEP: {loc.cep}</Text>
                            {loc.telefone && <Text>Telefone: {loc.telefone}</Text>}
                          </VStack>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                </>
              )}

              <Divider />

              <Text fontSize="sm" color="gray.500">
                Data de cadastro: {formatDate(doctor.created_at)}
              </Text>
            </VStack>
          </Box>
        )
      ) : (
        <Center py={8}>
          <Text>Médico não encontrado</Text>
        </Center>
      )}

      {/* Diploma Modal */}
      <Modal isOpen={isDiplomaOpen} onClose={onDiplomaClose} size="6xl" isCentered>
        <ModalOverlay />
        <ModalContent maxW="90vw" maxH="90vh">
          <ModalHeader>Diploma de {doctor?.nome}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {isPdfDiploma ? (
              <iframe
                src={diplomaUrl || ''}
                style={{
                  width: '100%',
                  height: '80vh',
                  border: 'none'
                }}
                title="Diploma PDF"
              />
            ) : (
              <Image
                src={diplomaUrl || undefined}
                alt="Diploma do médico"
                width="100%"
                objectFit="contain"
                maxH="80vh"
                fallback={
                  <Center p={8} bg="gray.100" borderRadius="lg">
                    <Text color="gray.500">Erro ao carregar diploma</Text>
                  </Center>
                }
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Comprovante Modal */}
      <Modal isOpen={isComprovanteOpen} onClose={onComprovanteClose} size="6xl" isCentered>
        <ModalOverlay />
        <ModalContent maxW="90vw" maxH="90vh">
          <ModalHeader>{selectedComprovante?.filename}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedComprovante?.isPdf ? (
              <iframe
                src={selectedComprovante.url}
                style={{
                  width: '100%',
                  height: '80vh',
                  border: 'none'
                }}
                title="Comprovante PDF"
              />
            ) : (
              <Image
                src={selectedComprovante?.url}
                alt="Comprovante"
                width="100%"
                objectFit="contain"
                maxH="80vh"
                fallback={
                  <Center p={8} bg="gray.100" borderRadius="lg">
                    <Text color="gray.500">Erro ao carregar comprovante</Text>
                  </Center>
                }
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </PageContainer>
  )
}

export default DoctorDetails 