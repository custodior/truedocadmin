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
  Input,
  ModalFooter,
  Select,
  FormErrorMessage,
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
  faculdade_id?: string
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
    id: string
    nome_endereco: string
    cep: string
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    telefone: string
    latitude?: number
    longitude?: number
  }>
}

interface Especialidade {
  id: string;
  nome: string;
  instituicao_residencia?: {
    nome: string;
  };
  instituicao_residencia_outra?: string;
  aprovado: boolean;
  show_profile: boolean;
}

interface Subespecialidade {
  id: string;
  subespecialidade_nome: string;
  instituicao_residencia?: {
    nome: string;
  };
  instituicao_residencia_outra?: string;
  aprovado: boolean;
}

interface FormacaoOutros {
  id: string;
  nome: string;
  instituicao?: string;
  aprovado: boolean;
  show_profile: boolean;
}

interface DoctorFormData {
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
  faculdade_id?: string
  faculdade?: {
    nome: string
  }
  faculdade_outro?: string
  forma_contato?: ContactFormType
  contato?: string
  facebook?: string
  instagram?: string
  tiktok?: string
  linkedin?: string
  twitter?: string
  teleconsulta?: boolean
  convenio_outro?: string
  especialidades: Especialidade[]
  subespecialidades: Subespecialidade[]
  formacao_outros: FormacaoOutros[]
  convenios: Array<{ nome: string }>
  localizacoes: Array<{
    id: string
    nome_endereco: string
    cep: string
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    telefone: string
    latitude?: number
    longitude?: number
  }>
}

interface InstituicaoResidencia {
  id: string;
  nome: string;
}

interface EditEspecialidadeFormData {
  instituicao_residencia_id?: string;
  instituicao_residencia_outra?: string;
}

interface ComprovanteFormacaoOutros {
  id: string
  medico_id: string
  arquivo: string
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
  const [comprovanteFormacaoOutros, setComprovanteFormacaoOutros] = React.useState<ComprovanteFormacaoOutros[]>([])
  const [comprovanteUrls, setComprovanteUrls] = React.useState<{ [key: string]: string }>({})
  const [comprovanteFormacaoOutrosUrls, setComprovanteFormacaoOutrosUrls] = React.useState<{ [key: string]: string }>({})
  const { isOpen: isDiplomaOpen, onOpen: onDiplomaOpen, onClose: onDiplomaClose } = useDisclosure()
  const { isOpen: isComprovanteOpen, onOpen: onComprovanteOpen, onClose: onComprovanteClose } = useDisclosure()
  const { isOpen: isComprovanteFormacaoOpen, onOpen: onComprovanteFormacaoOpen, onClose: onComprovanteFormacaoClose } = useDisclosure()
  const { isOpen: isAddressEditOpen, onOpen: onAddressEditOpen, onClose: onAddressEditClose } = useDisclosure()
  const [selectedComprovante, setSelectedComprovante] = React.useState<{url: string, isPdf: boolean, filename: string} | null>(null)
  const [selectedComprovanteFormacao, setSelectedComprovanteFormacao] = React.useState<{url: string, isPdf: boolean, filename: string} | null>(null)
  const [selectedAddress, setSelectedAddress] = React.useState<DoctorFormData['localizacoes'][0] | null>(null)
  const toast = useToast()
  const [selectedEspecialidade, setSelectedEspecialidade] = React.useState<Especialidade | null>(null)
  const [instituicoes, setInstituicoes] = React.useState<InstituicaoResidencia[]>([])
  const [isLoadingInstituicoes, setIsLoadingInstituicoes] = React.useState(false)
  const { isOpen: isEditEspecialidadeOpen, onOpen: onEditEspecialidadeOpen, onClose: onEditEspecialidadeClose } = useDisclosure()

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  React.useEffect(() => {
    if (id) {
      fetchDoctorDetails()
      fetchComprovantes()
      fetchComprovantesFormacaoOutros()
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

  // Add useEffect to get comprovante formacao outros URLs
  React.useEffect(() => {
    const urls: { [key: string]: string } = {}
    for (const comprovante of comprovanteFormacaoOutros) {
      urls[comprovante.id] = comprovante.arquivo
    }
    setComprovanteFormacaoOutrosUrls(urls)
  }, [comprovanteFormacaoOutros])

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
          faculdade_id,
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
            id,
            nome_endereco,
            cep,
            logradouro,
            numero,
            complemento,
            bairro,
            cidade,
            estado,
            telefone,
            latitude,
            longitude
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
          faculdade_id: data.faculdade_id,
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
            id: loc.id,
            nome_endereco: loc.nome_endereco,
            cep: loc.cep,
            logradouro: loc.logradouro,
            numero: loc.numero,
            complemento: loc.complemento,
            bairro: loc.bairro,
            cidade: loc.cidade,
            estado: loc.estado,
            telefone: loc.telefone,
            latitude: loc.latitude,
            longitude: loc.longitude
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

  const fetchComprovantesFormacaoOutros = async () => {
    try {
      console.log('Fetching comprovantes formacao outros for doctor:', id)
      const { data, error } = await supabase
        .from('comprovante_formacao_outros')
        .select('id, medico_id, arquivo')
        .eq('medico_id', id)

      if (error) {
        console.error('Error fetching comprovantes formacao outros:', error)
        throw error
      }

      console.log('Fetched comprovantes formacao outros:', data)
      setComprovanteFormacaoOutros(data || [])
    } catch (err) {
      console.error('Error in fetchComprovantesFormacaoOutros:', err)
      setError(err instanceof Error ? err.message : 'Error fetching comprovantes formacao outros')
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

  const handleViewComprovanteFormacao = (url: string, arquivo: string) => {
    const isPdf = url.toLowerCase().endsWith('.pdf')
    const filename = url.split('/').pop() || ''
    setSelectedComprovanteFormacao({ url, isPdf, filename })
    onComprovanteFormacaoOpen()
  }

  const handleApproveEspecialidade = async (especialidadeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('medico_especialidade_residencia')
        .update({ aprovado: !currentStatus })
        .eq('id', especialidadeId)

      if (error) throw error

      // Update local state
      if (doctor) {
        setDoctor({
          ...doctor,
          especialidades: doctor.especialidades.map(esp => 
            esp.id === especialidadeId 
              ? { ...esp, aprovado: !currentStatus }
              : esp
          )
        })
      }

      toast({
        title: `Especialidade ${!currentStatus ? 'aprovada' : 'desaprovada'} com sucesso`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (err) {
      console.error('Error updating especialidade:', err)
      toast({
        title: 'Erro ao atualizar especialidade',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleApproveSubespecialidade = async (subespecialidadeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('medico_subespecialidade_residencia')
        .update({ aprovado: !currentStatus })
        .eq('id', subespecialidadeId)

      if (error) throw error

      // Update local state
      if (doctor) {
        setDoctor({
          ...doctor,
          subespecialidades: doctor.subespecialidades.map(sub => 
            sub.id === subespecialidadeId 
              ? { ...sub, aprovado: !currentStatus }
              : sub
          )
        })
      }

      toast({
        title: `Subespecialidade ${!currentStatus ? 'aprovada' : 'desaprovada'} com sucesso`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (err) {
      console.error('Error updating subespecialidade:', err)
      toast({
        title: 'Erro ao atualizar subespecialidade',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleApproveFormacao = async (formacaoId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('formacao_outros')
        .update({ aprovado: !currentStatus })
        .eq('id', formacaoId)

      if (error) throw error

      // Update local state
      if (doctor) {
        setDoctor({
          ...doctor,
          formacao_outros: doctor.formacao_outros.map(form => 
            form.id === formacaoId 
              ? { ...form, aprovado: !currentStatus }
              : form
          )
        })
      }

      toast({
        title: `Formação ${!currentStatus ? 'aprovada' : 'desaprovada'} com sucesso`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (err) {
      console.error('Error updating formação:', err)
      toast({
        title: 'Erro ao atualizar formação',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleEditAddress = (address: DoctorFormData['localizacoes'][0]) => {
    setSelectedAddress(address)
    onAddressEditOpen()
  }

  const handleSaveAddress = async (updatedAddress: typeof selectedAddress) => {
    if (!doctor || !selectedAddress || !updatedAddress) return

    try {
      const { error } = await supabase
        .from('localizacao')
        .update({
          nome_endereco: updatedAddress.nome_endereco,
          cep: updatedAddress.cep,
          logradouro: updatedAddress.logradouro,
          numero: updatedAddress.numero,
          complemento: updatedAddress.complemento,
          bairro: updatedAddress.bairro,
          cidade: updatedAddress.cidade,
          estado: updatedAddress.estado,
          telefone: updatedAddress.telefone,
          latitude: updatedAddress.latitude,
          longitude: updatedAddress.longitude
        })
        .eq('id', selectedAddress.id)

      if (error) throw error

      // Update local state
      setDoctor({
        ...doctor,
        localizacoes: doctor.localizacoes.map(loc =>
          loc.id === selectedAddress.id ? updatedAddress : loc
        )
      })

      toast({
        title: 'Endereço atualizado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      onAddressEditClose()
    } catch (err) {
      console.error('Error updating address:', err)
      toast({
        title: 'Erro ao atualizar endereço',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleToggleShowProfile = async (type: 'especialidade' | 'formacao', id: string, currentStatus: boolean) => {
    try {
      let table: string;
      switch (type) {
        case 'especialidade':
          table = 'medico_especialidade_residencia';
          break;
        case 'formacao':
          table = 'formacao_outros';
          break;
      }

      const { error } = await supabase
        .from(table)
        .update({ show_profile: !currentStatus })
        .eq('id', id)

      if (error) throw error

      // Update local state
      if (doctor) {
        setDoctor({
          ...doctor,
          especialidades: type === 'especialidade' 
            ? doctor.especialidades.map(esp => 
                esp.id === id 
                  ? { ...esp, show_profile: !currentStatus }
                  : esp
              )
            : doctor.especialidades,
          formacao_outros: type === 'formacao'
            ? doctor.formacao_outros.map(form =>
                form.id === id
                  ? { ...form, show_profile: !currentStatus }
                  : form
              )
            : doctor.formacao_outros
        })
      }

      toast({
        title: `${!currentStatus ? 'Exibindo' : 'Ocultando'} no perfil`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (err) {
      console.error('Error updating show_profile:', err)
      toast({
        title: 'Erro ao atualizar exibição no perfil',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const fetchInstituicoes = async () => {
    try {
      setIsLoadingInstituicoes(true);
      const { data, error } = await supabase
        .from('instituicao_residencia')
        .select('id, nome')
        .order('nome');

      if (error) throw error;

      setInstituicoes(data || []);
    } catch (err) {
      console.error('Error fetching instituicoes:', err);
      toast({
        title: 'Erro ao carregar instituições',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingInstituicoes(false);
    }
  };

  const handleUpdateEspecialidade = async (formData: EditEspecialidadeFormData) => {
    if (!selectedEspecialidade) return;

    try {
      const { error } = await supabase
        .from('medico_especialidade_residencia')
        .update({
          instituicao_residencia_id: formData.instituicao_residencia_id || null,
          instituicao_residencia_outra: formData.instituicao_residencia_outra || null,
        })
        .eq('id', selectedEspecialidade.id);

      if (error) throw error;

      // Update local state
      if (doctor) {
        setDoctor({
          ...doctor,
          especialidades: doctor.especialidades.map(esp =>
            esp.id === selectedEspecialidade.id
              ? {
                  ...esp,
                  instituicao_residencia: formData.instituicao_residencia_id
                    ? instituicoes.find(i => i.id === formData.instituicao_residencia_id)
                    : undefined,
                  instituicao_residencia_outra: formData.instituicao_residencia_outra || undefined,
                }
              : esp
          ),
        });
      }

      toast({
        title: 'Especialidade atualizada com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onEditEspecialidadeClose();
    } catch (err) {
      console.error('Error updating especialidade:', err);
      toast({
        title: 'Erro ao atualizar especialidade',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Add this function to handle adding new institution
  const handleAddNewInstitution = async (institutionName: string) => {
    try {
      // First check if institution already exists
      const { data: existingInst, error: checkError } = await supabase
        .from('instituicao_residencia')
        .select('id')
        .ilike('nome', institutionName)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      
      if (existingInst) {
        toast({
          title: 'Instituição já existe',
          description: 'Esta instituição já está cadastrada no sistema.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Add new institution
      const { data, error } = await supabase
        .from('instituicao_residencia')
        .insert([{ nome: institutionName }])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setInstituicoes(prev => [...prev, data]);

      toast({
        title: 'Instituição adicionada com sucesso',
        description: 'A instituição foi adicionada à lista de instituições.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Return the new institution id
      return data.id;
    } catch (err) {
      console.error('Error adding new institution:', err);
      toast({
        title: 'Erro ao adicionar instituição',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return null;
    }
  };

  React.useEffect(() => {
    if (isEditEspecialidadeOpen) {
      fetchInstituicoes();
    }
  }, [isEditEspecialidadeOpen]);

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
              {doctor.especialidades.length > 0 && (
                <>
                  <Divider />
                  <Box>
                    <Text fontSize="lg" fontWeight="semibold" mb={3}>Especialidades</Text>
                    <VStack align="start" spacing={4}>
                      {doctor.especialidades.map((especialidade) => (
                        <Box key={especialidade.id} w="100%">
                          <VStack align="start" spacing={2} w="100%">
                            <HStack spacing={2} justify="space-between" w="100%">
                              <HStack spacing={2}>
                                <Text fontWeight="medium">{especialidade.nome}</Text>
                                <Badge colorScheme={especialidade.aprovado ? 'green' : 'orange'}>
                                  {especialidade.aprovado ? 'Aprovada' : 'Pendente'}
                                </Badge>
                                {especialidade.show_profile && (
                                  <Badge colorScheme="blue">Exibir no Perfil</Badge>
                                )}
                              </HStack>
                              <HStack spacing={4} align="center">
                                <IconButton
                                  aria-label="Editar especialidade"
                                  icon={<FiEdit />}
                                  size="sm"
                                  onClick={() => {
                                    setSelectedEspecialidade(especialidade);
                                    onEditEspecialidadeOpen();
                                  }}
                                />
                                <HStack spacing={2} align="center">
                                  <Text fontSize="sm" color="gray.600">Exibir no Perfil</Text>
                                  <Switch
                                    isChecked={especialidade.show_profile}
                                    onChange={() => handleToggleShowProfile('especialidade', especialidade.id, especialidade.show_profile)}
                                    colorScheme="blue"
                                    size="lg"
                                  />
                                </HStack>
                                <HStack spacing={2} align="center">
                                  <Text fontSize="sm" color="gray.600">Aprovar</Text>
                                  <Switch
                                    isChecked={especialidade.aprovado}
                                    onChange={() => handleApproveEspecialidade(especialidade.id, especialidade.aprovado)}
                                    colorScheme="green"
                                    size="lg"
                                  />
                                </HStack>
                              </HStack>
                            </HStack>
                            {especialidade.instituicao_residencia_outra && (
                              <HStack spacing={2}>
                                <Text color="gray.600" fontSize="sm">
                                  Instituição: {especialidade.instituicao_residencia_outra}
                                </Text>
                                <Badge colorScheme="yellow">Instituição não listada</Badge>
                              </HStack>
                            )}
                            {especialidade.instituicao_residencia && (
                              <Text color="gray.600" fontSize="sm">
                                Instituição: {especialidade.instituicao_residencia.nome}
                              </Text>
                            )}
                          </VStack>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                </>
              )}

              {/* Subespecialidades */}
              {doctor.subespecialidades.length > 0 && (
                <>
                  <Divider />
                  <Box>
                    <Text fontSize="lg" fontWeight="semibold" mb={3}>Subespecialidades</Text>
                    <VStack align="start" spacing={4}>
                      {doctor.subespecialidades.map((subespecialidade) => (
                        <Box key={subespecialidade.id} w="100%">
                          <VStack align="start" spacing={2} w="100%">
                            <HStack spacing={2} justify="space-between" w="100%">
                              <HStack spacing={2}>
                                <Text fontWeight="medium">{subespecialidade.subespecialidade_nome}</Text>
                                <Badge colorScheme={subespecialidade.aprovado ? 'green' : 'orange'}>
                                  {subespecialidade.aprovado ? 'Aprovada' : 'Pendente'}
                                </Badge>
                              </HStack>
                              <HStack spacing={2} align="center">
                                <Text fontSize="sm" color="gray.600">Aprovar</Text>
                                <Switch
                                  isChecked={subespecialidade.aprovado}
                                  onChange={() => handleApproveSubespecialidade(subespecialidade.id, subespecialidade.aprovado)}
                                  colorScheme="green"
                                  size="lg"
                                />
                              </HStack>
                            </HStack>
                            {subespecialidade.instituicao_residencia && (
                              <Text color="gray.600">
                                Instituição: {subespecialidade.instituicao_residencia.nome}
                              </Text>
                            )}
                            {subespecialidade.instituicao_residencia_outra && (
                              <Text color="gray.600">
                                Instituição: {subespecialidade.instituicao_residencia_outra}
                              </Text>
                            )}
                          </VStack>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                </>
              )}

              {/* Comprovantes */}
              {comprovantes.length > 0 && (
                <>
                  <Divider />
                  <Box>
                    <Text fontSize="lg" fontWeight="semibold" mb={3}>Comprovantes</Text>
                    <VStack align="start" spacing={4}>
                      {comprovantes.map((comprovante, index) => (
                        <Box key={comprovante.id} w="100%">
                          <Button
                            leftIcon={<FiFileText />}
                            onClick={() => handleViewComprovante(comprovante.arquivo, comprovante.arquivo.split('/').pop() || '')}
                            colorScheme="blue"
                            variant="outline"
                            size="md"
                          >
                            Ver comprovante {index + 1}
                          </Button>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                </>
              )}

              {/* Outras Formações */}
              {doctor.formacao_outros.length > 0 && (
                <>
                  <Divider />
                  <Box>
                    <Text fontSize="lg" fontWeight="semibold" mb={3}>Outras Formações</Text>
                    <VStack align="start" spacing={4}>
                      {doctor.formacao_outros.map((formacao) => (
                        <Box key={formacao.id} w="100%">
                          <VStack align="start" spacing={2} w="100%">
                            <HStack spacing={2} justify="space-between" w="100%">
                              <HStack spacing={2}>
                                <Text fontWeight="medium">{formacao.nome}</Text>
                                <Badge colorScheme={formacao.aprovado ? 'green' : 'orange'}>
                                  {formacao.aprovado ? 'Aprovada' : 'Pendente'}
                                </Badge>
                                {formacao.show_profile && (
                                  <Badge colorScheme="blue">Exibir no Perfil</Badge>
                                )}
                              </HStack>
                              <HStack spacing={4} align="center">
                                <HStack spacing={2} align="center">
                                  <Text fontSize="sm" color="gray.600">Exibir no Perfil</Text>
                                  <Switch
                                    isChecked={formacao.show_profile}
                                    onChange={() => handleToggleShowProfile('formacao', formacao.id, formacao.show_profile)}
                                    colorScheme="blue"
                                    size="lg"
                                  />
                                </HStack>
                                <HStack spacing={2} align="center">
                                  <Text fontSize="sm" color="gray.600">Aprovar</Text>
                                  <Switch
                                    isChecked={formacao.aprovado}
                                    onChange={() => handleApproveFormacao(formacao.id, formacao.aprovado)}
                                    colorScheme="green"
                                    size="lg"
                                  />
                                </HStack>
                              </HStack>
                            </HStack>
                            {formacao.instituicao && (
                              <HStack spacing={2}>
                                <Text color="gray.600" fontSize="sm">
                                  Instituição: {formacao.instituicao}
                                </Text>
                                <Badge colorScheme="yellow">Instituição não listada</Badge>
                              </HStack>
                            )}
                          </VStack>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                </>
              )}

              {/* Comprovantes Formação Outros */}
              {comprovanteFormacaoOutros.length > 0 && (
                <>
                  <Divider />
                  <Box>
                    <Text fontSize="lg" fontWeight="semibold" mb={3}>Comprovantes de Outras Formações</Text>
                    <VStack align="start" spacing={4}>
                      {comprovanteFormacaoOutros.map((comprovante, index) => (
                        <Box key={comprovante.id} w="100%">
                          <Button
                            leftIcon={<FiFileText />}
                            onClick={() => handleViewComprovanteFormacao(comprovante.arquivo, comprovante.arquivo.split('/').pop() || '')}
                            colorScheme="blue"
                            variant="outline"
                            size="md"
                          >
                            Ver comprovante {index + 1}
                          </Button>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
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
                      {doctor.localizacoes.map((loc) => (
                        <Box key={loc.id} p={4} bg="gray.50" borderRadius="md" w="100%">
                          <HStack justify="space-between" w="100%" mb={2}>
                            <Text fontWeight="medium">{loc.nome_endereco}</Text>
                            <Button
                              size="sm"
                              leftIcon={<FiEdit />}
                              onClick={() => handleEditAddress(loc)}
                              colorScheme="blue"
                              variant="ghost"
                            >
                              Editar
                            </Button>
                          </HStack>
                          <VStack align="start" spacing={1}>
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

      {/* Modal for viewing comprovante */}
      <Modal isOpen={isComprovanteOpen} onClose={onComprovanteClose} size="full">
        <ModalOverlay />
        <ModalContent maxW="98vw" h="98vh" mx="auto" my="1vh">
          <ModalHeader 
            borderBottomWidth="1px" 
            bg={useColorModeValue('gray.50', 'gray.800')}
            borderTopRadius="md"
            py={2}
          >
            Comprovante
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody 
            p={0} 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            bg={useColorModeValue('gray.100', 'gray.700')}
            h="calc(98vh - 57px)" // 57px is the header height (48px) + border (1px)
          >
            <Box w="100%" h="100%" overflow="hidden">
              {selectedComprovante?.isPdf ? (
                <iframe 
                  src={selectedComprovante.url} 
                  width="100%" 
                  height="100%" 
                  style={{ border: 'none' }}
                />
              ) : (
                <Image 
                  src={selectedComprovante?.url} 
                  height="100%"
                  width="100%"
                  objectFit="contain" 
                />
              )}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal for viewing diploma */}
      <Modal isOpen={isDiplomaOpen} onClose={onDiplomaClose} size="full">
        <ModalOverlay />
        <ModalContent maxW="98vw" h="98vh" mx="auto" my="1vh">
          <ModalHeader 
            borderBottomWidth="1px" 
            bg={useColorModeValue('gray.50', 'gray.800')}
            borderTopRadius="md"
            py={2}
          >
            Diploma
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody 
            p={0} 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            bg={useColorModeValue('gray.100', 'gray.700')}
            h="calc(98vh - 57px)" // 57px is the header height (48px) + border (1px)
          >
            <Box w="100%" h="100%" overflow="hidden">
              {isPdfDiploma ? (
                <iframe 
                  src={diplomaUrl || ''} 
                  width="100%" 
                  height="100%" 
                  style={{ border: 'none' }}
                />
              ) : (
                <Image 
                  src={diplomaUrl || ''} 
                  height="100%"
                  width="100%"
                  objectFit="contain" 
                />
              )}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Address Edit Modal */}
      <Modal isOpen={isAddressEditOpen} onClose={onAddressEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Endereço</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedAddress && (
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Nome do Endereço</FormLabel>
                  <Input
                    value={selectedAddress.nome_endereco}
                    onChange={(e) => setSelectedAddress({
                      ...selectedAddress,
                      nome_endereco: e.target.value
                    })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>CEP</FormLabel>
                  <Input
                    value={selectedAddress.cep}
                    onChange={(e) => setSelectedAddress({
                      ...selectedAddress,
                      cep: e.target.value
                    })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Logradouro</FormLabel>
                  <Input
                    value={selectedAddress.logradouro}
                    onChange={(e) => setSelectedAddress({
                      ...selectedAddress,
                      logradouro: e.target.value
                    })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Número</FormLabel>
                  <Input
                    value={selectedAddress.numero}
                    onChange={(e) => setSelectedAddress({
                      ...selectedAddress,
                      numero: e.target.value
                    })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Complemento</FormLabel>
                  <Input
                    value={selectedAddress.complemento || ''}
                    onChange={(e) => setSelectedAddress({
                      ...selectedAddress,
                      complemento: e.target.value
                    })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Bairro</FormLabel>
                  <Input
                    value={selectedAddress.bairro}
                    onChange={(e) => setSelectedAddress({
                      ...selectedAddress,
                      bairro: e.target.value
                    })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Cidade</FormLabel>
                  <Input
                    value={selectedAddress.cidade}
                    onChange={(e) => setSelectedAddress({
                      ...selectedAddress,
                      cidade: e.target.value
                    })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Estado</FormLabel>
                  <Input
                    value={selectedAddress.estado}
                    onChange={(e) => setSelectedAddress({
                      ...selectedAddress,
                      estado: e.target.value
                    })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Telefone</FormLabel>
                  <Input
                    value={selectedAddress.telefone}
                    onChange={(e) => setSelectedAddress({
                      ...selectedAddress,
                      telefone: e.target.value
                    })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Latitude</FormLabel>
                  <Input
                    type="number"
                    step="0.000001"
                    value={selectedAddress.latitude || ''}
                    onChange={(e) => setSelectedAddress({
                      ...selectedAddress,
                      latitude: e.target.value ? Number(e.target.value) : undefined
                    })}
                    placeholder="Ex: -23.550520"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Longitude</FormLabel>
                  <Input
                    type="number"
                    step="0.000001"
                    value={selectedAddress.longitude || ''}
                    onChange={(e) => setSelectedAddress({
                      ...selectedAddress,
                      longitude: e.target.value ? Number(e.target.value) : undefined
                    })}
                    placeholder="Ex: -46.633308"
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => handleSaveAddress(selectedAddress)}
            >
              Salvar
            </Button>
            <Button onClick={onAddressEditClose}>Cancelar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Especialidade Modal */}
      <Modal isOpen={isEditEspecialidadeOpen} onClose={onEditEspecialidadeClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Especialidade</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedEspecialidade && (
              <Box
                as="form"
                onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleUpdateEspecialidade({
                    instituicao_residencia_id: formData.get('instituicao_residencia_id') as string || undefined,
                    instituicao_residencia_outra: formData.get('instituicao_residencia_outra') as string || undefined,
                  });
                }}
              >
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel>Nome da Especialidade</FormLabel>
                    <Text>{selectedEspecialidade.nome}</Text>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Instituição</FormLabel>
                    <Select
                      name="instituicao_residencia_id"
                      placeholder="Selecione uma instituição"
                      defaultValue={selectedEspecialidade.instituicao_residencia?.nome}
                      isDisabled={isLoadingInstituicoes}
                    >
                      {instituicoes.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.nome}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Outra Instituição</FormLabel>
                    <Input
                      name="instituicao_residencia_outra"
                      placeholder="Digite o nome da instituição"
                      defaultValue={selectedEspecialidade.instituicao_residencia_outra || ''}
                    />
                    <Button
                      mt={2}
                      size="sm"
                      colorScheme="green"
                      onClick={async () => {
                        const input = document.querySelector('input[name="instituicao_residencia_outra"]') as HTMLInputElement;
                        const institutionName = input.value.trim();
                        
                        if (!institutionName) {
                          toast({
                            title: 'Campo vazio',
                            description: 'Por favor, digite o nome da instituição.',
                            status: 'warning',
                            duration: 3000,
                            isClosable: true,
                          });
                          return;
                        }

                        const newInstitutionId = await handleAddNewInstitution(institutionName);
                        if (newInstitutionId) {
                          // Clear the "Outra Instituição" field
                          input.value = '';
                          
                          // Select the new institution in the dropdown
                          const select = document.querySelector('select[name="instituicao_residencia_id"]') as HTMLSelectElement;
                          if (select) {
                            select.value = newInstitutionId;
                          }
                        }
                      }}
                    >
                      Adicionar à Lista de Instituições
                    </Button>
                  </FormControl>

                  <Button type="submit" colorScheme="blue" w="100%">
                    Salvar Alterações
                  </Button>
                </VStack>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal for viewing comprovante formacao */}
      <Modal isOpen={isComprovanteFormacaoOpen} onClose={onComprovanteFormacaoClose} size="full">
        <ModalOverlay />
        <ModalContent maxW="98vw" h="98vh" mx="auto" my="1vh">
          <ModalHeader 
            borderBottomWidth="1px" 
            bg={useColorModeValue('gray.50', 'gray.800')}
            borderTopRadius="md"
            py={2}
          >
            Comprovante de Formação
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody 
            p={0} 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            bg={useColorModeValue('gray.100', 'gray.700')}
            h="calc(98vh - 57px)" // 57px is the header height (48px) + border (1px)
          >
            <Box w="100%" h="100%" overflow="hidden">
              {selectedComprovanteFormacao?.isPdf ? (
                <iframe 
                  src={selectedComprovanteFormacao.url} 
                  width="100%" 
                  height="100%" 
                  style={{ border: 'none' }}
                />
              ) : (
                <Image 
                  src={selectedComprovanteFormacao?.url} 
                  height="100%"
                  width="100%"
                  objectFit="contain" 
                />
              )}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </PageContainer>
  )
}

export default DoctorDetails 