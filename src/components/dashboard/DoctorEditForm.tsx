import React from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Grid,
  GridItem,
  Textarea,
  Switch,
  useToast,
  FormErrorMessage,
  Select,
  Checkbox,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Heading,
  Text,
  Flex,
  Stack,
} from '@chakra-ui/react'
import { supabase } from '../../lib/supabaseClient'

type ContactFormType = typeof CONTACT_FORM_OPTIONS[number];

export interface DoctorFormData {
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
  forma_contato?: ContactFormType
  contato?: string
  facebook?: string
  instagram?: string
  tiktok?: string
  linkedin?: string
  twitter?: string
  teleconsulta?: boolean
  convenio_outro?: string
  especialidades: {
    id: string
    nome: string
    instituicao_residencia?: {
      nome: string
    }
    instituicao_residencia_outra?: string
    show_profile: boolean
    aprovado: boolean
    comprovante?: string
  }[]
  subespecialidades: {
    id: string
    subespecialidade_nome: string
    instituicao_residencia?: {
      nome: string
    }
    instituicao_residencia_outra?: string
    aprovado: boolean
    comprovante?: string
  }[]
  formacao_outros: {
    id: string
    nome: string
    show_profile: boolean
    aprovado: boolean
    comprovante?: string
  }[]
  convenios: { nome: string }[]
  localizacoes: {
    nome_endereco: string
    cep: string
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    telefone: string
  }[]
}

interface DoctorEditFormProps {
  doctor: DoctorFormData
  onCancel: () => void
  onSave: () => void
}

interface Convenio {
  id: string
  nome: string
}

const CONTACT_FORM_OPTIONS = ['whatsapp', 'site', 'instagram', 'telefone'] as const;

const DoctorEditForm: React.FC<DoctorEditFormProps> = ({
  doctor,
  onCancel,
  onSave,
}) => {
  const [formData, setFormData] = React.useState<DoctorFormData>(doctor)
  const [isLoading, setIsLoading] = React.useState(false)
  const [availableConvenios, setAvailableConvenios] = React.useState<Convenio[]>([])
  const [selectedConvenios, setSelectedConvenios] = React.useState<string[]>(
    doctor.convenios.map(c => c.nome)
  )
  const toast = useToast()

  React.useEffect(() => {
    fetchConvenios()
  }, [])

  const fetchConvenios = async () => {
    try {
      const { data, error } = await supabase
        .from('convenio')
        .select('id, nome')
        .order('nome')

      if (error) throw error

      setAvailableConvenios(data || [])
    } catch (err) {
      console.error('Error fetching convenios:', err)
      toast({
        title: 'Erro ao carregar convênios',
        description: 'Não foi possível carregar a lista de convênios.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSwitchChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [name]: e.target.checked,
    }))
  }

  const handleConvenioSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedConvenio = availableConvenios.find(c => c.id === e.target.value)
    if (selectedConvenio && !selectedConvenios.includes(selectedConvenio.nome)) {
      setSelectedConvenios([...selectedConvenios, selectedConvenio.nome])
    }
  }

  const handleRemoveConvenio = (convenioNome: string) => {
    setSelectedConvenios(selectedConvenios.filter(nome => nome !== convenioNome))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Update the medico table
      const { error: medicoError } = await supabase
        .from('medico')
        .update({
          nome: formData.nome,
          crm: formData.crm,
          email: formData.email,
          website: formData.website,
          descricao: formData.descricao,
          rqe: formData.rqe,
          new_rqe: formData.new_rqe,
          faculdade_outro: formData.faculdade_outro,
          forma_contato: formData.forma_contato,
          contato: formData.contato,
          facebook: formData.facebook,
          instagram: formData.instagram,
          tiktok: formData.tiktok,
          linkedin: formData.linkedin,
          twitter: formData.twitter,
          teleconsulta: formData.teleconsulta,
          convenio_outro: formData.convenio_outro,
          aprovado: formData.aprovado,
        })
        .eq('id', doctor.id)

      if (medicoError) throw medicoError

      // Update convenios
      const { error: deleteError } = await supabase
        .from('medico_convenios')
        .delete()
        .eq('medico_id', doctor.id)

      if (deleteError) throw deleteError

      if (selectedConvenios.length > 0) {
        const conveniosToInsert = selectedConvenios.map(nome => {
          const convenio = availableConvenios.find(c => c.nome === nome)
          return {
            medico_id: doctor.id,
            convenio_id: convenio?.id,
          }
        }).filter(c => c.convenio_id)

        const { error: insertError } = await supabase
          .from('medico_convenios')
          .insert(conveniosToInsert)

        if (insertError) throw insertError
      }

      toast({
        title: 'Médico atualizado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      onSave()
    } catch (err) {
      console.error('Error updating doctor:', err)
      toast({
        title: 'Erro ao atualizar médico',
        description: 'Não foi possível salvar as alterações.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box bg="white" p={6} borderRadius="lg" shadow="sm">
      <form onSubmit={handleSubmit}>
        <VStack spacing={6} align="stretch">
          {/* Basic Information */}
          <Box>
            <Heading size="md" mb={4}>Informações Básicas</Heading>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Nome</FormLabel>
                  <Input
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>CRM</FormLabel>
                  <Input
                    name="crm"
                    value={formData.crm}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Website</FormLabel>
                  <Input
                    name="website"
                    value={formData.website || ''}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </GridItem>
            </Grid>
          </Box>

          {/* Professional Information */}
          <Box>
            <Heading size="md" mb={4}>Informações Profissionais</Heading>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <GridItem>
                <FormControl>
                  <FormLabel>RQE</FormLabel>
                  <Input
                    name="rqe"
                    value={formData.rqe || ''}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Novo RQE</FormLabel>
                  <Input
                    name="new_rqe"
                    value={formData.new_rqe || ''}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Faculdade (Outro)</FormLabel>
                  <Input
                    name="faculdade_outro"
                    value={formData.faculdade_outro || ''}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </GridItem>
            </Grid>
          </Box>

          {/* Contact Information */}
          <Box>
            <Heading size="md" mb={4}>Informações de Contato</Heading>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <GridItem>
                <FormControl>
                  <FormLabel>Forma de Contato</FormLabel>
                  <Select
                    name="forma_contato"
                    value={formData.forma_contato || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecione uma opção</option>
                    {CONTACT_FORM_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Contato</FormLabel>
                  <Input
                    name="contato"
                    value={formData.contato || ''}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </GridItem>
            </Grid>
          </Box>

          {/* Social Media */}
          <Box>
            <Heading size="md" mb={4}>Redes Sociais</Heading>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <GridItem>
                <FormControl>
                  <FormLabel>Facebook</FormLabel>
                  <Input
                    name="facebook"
                    value={formData.facebook || ''}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Instagram</FormLabel>
                  <Input
                    name="instagram"
                    value={formData.instagram || ''}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>TikTok</FormLabel>
                  <Input
                    name="tiktok"
                    value={formData.tiktok || ''}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>LinkedIn</FormLabel>
                  <Input
                    name="linkedin"
                    value={formData.linkedin || ''}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Twitter</FormLabel>
                  <Input
                    name="twitter"
                    value={formData.twitter || ''}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </GridItem>
            </Grid>
          </Box>

          {/* Insurance Plans */}
          <Box>
            <Heading size="md" mb={4}>Convênios</Heading>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <GridItem>
                <FormControl>
                  <FormLabel>Convênios</FormLabel>
                  <Select onChange={handleConvenioSelect} placeholder="Selecione um convênio">
                    {availableConvenios.map(convenio => (
                      <option key={convenio.id} value={convenio.id}>
                        {convenio.nome}
                      </option>
                    ))}
                  </Select>
                  <Wrap mt={2} spacing={2}>
                    {selectedConvenios.map(convenio => (
                      <WrapItem key={convenio}>
                        <Tag size="md" borderRadius="full" variant="solid" colorScheme="blue">
                          <TagLabel>{convenio}</TagLabel>
                          <TagCloseButton onClick={() => handleRemoveConvenio(convenio)} />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Outros Convênios</FormLabel>
                  <Input
                    name="convenio_outro"
                    value={formData.convenio_outro || ''}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </GridItem>
            </Grid>
          </Box>

          {/* Description */}
          <Box>
            <Heading size="md" mb={4}>Descrição</Heading>
            <FormControl>
              <FormLabel>Descrição</FormLabel>
              <Textarea
                name="descricao"
                value={formData.descricao || ''}
                onChange={handleInputChange}
                rows={4}
              />
            </FormControl>
          </Box>

          {/* Settings */}
          <Box>
            <Heading size="md" mb={4}>Configurações</Heading>
            <Stack spacing={4}>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="teleconsulta" mb="0">
                  Oferece Teleconsulta
                </FormLabel>
                <Switch
                  id="teleconsulta"
                  isChecked={formData.teleconsulta}
                  onChange={handleSwitchChange('teleconsulta')}
                />
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="aprovado" mb="0">
                  Aprovado
                </FormLabel>
                <Switch
                  id="aprovado"
                  isChecked={formData.aprovado}
                  onChange={handleSwitchChange('aprovado')}
                />
              </FormControl>
            </Stack>
          </Box>

          {/* Form Actions */}
          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            <Button onClick={onCancel} isDisabled={isLoading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isLoading}
            >
              Salvar
            </Button>
          </Grid>
        </VStack>
      </form>
    </Box>
  )
}

export default DoctorEditForm 