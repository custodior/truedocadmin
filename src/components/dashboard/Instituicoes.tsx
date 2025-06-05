import React from 'react'
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
  Image,
  Text,
  Stack,
} from '@chakra-ui/react'
import { FiMoreVertical, FiSearch, FiPlusCircle } from 'react-icons/fi'
import PageContainer from './PageContainer'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

// Custom theme colors based on #5deb99
const customColors = {
  primary: '#5deb99',
  primaryDark: '#4ac980',
  secondary: '#3dd6a3',
  secondaryDark: '#35b98c',
}

const mockData = [
  {
    id: 1,
    name: 'Hospital Albert Einstein',
    logo: 'https://placehold.co/40x40',
    location: 'São Paulo, SP',
    type: 'Hospital',
    specialties: ['Cardiologia', 'Oncologia', 'Neurologia'],
    status: 'active',
  },
  {
    id: 2,
    name: 'Clínica São Lucas',
    logo: 'https://placehold.co/40x40',
    location: 'Rio de Janeiro, RJ',
    type: 'Clínica',
    specialties: ['Pediatria', 'Ortopedia'],
    status: 'active',
  },
  {
    id: 3,
    name: 'Centro Médico Santa Maria',
    logo: 'https://placehold.co/40x40',
    location: 'Belo Horizonte, MG',
    type: 'Centro Médico',
    specialties: ['Dermatologia', 'Oftalmologia'],
    status: 'pending',
  },
]

const Instituicoes = () => {
  const tableBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const tagBg = useColorModeValue('gray.100', 'gray.700')

  const getStatusBadge = (status: string) => {
    const props = {
      active: {
        colorScheme: 'green',
        text: 'Ativa',
      },
      pending: {
        colorScheme: 'orange',
        text: 'Pendente',
      },
      inactive: {
        colorScheme: 'red',
        text: 'Inativa',
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

  return (
    <PageContainer
      title="Instituições"
      description="Gerencie as instituições médicas parceiras"
    >
      <HStack mb={6} spacing={4}>
        <InputGroup maxW="xs">
          <InputLeftElement pointerEvents="none" color="gray.400">
            <FiSearch />
          </InputLeftElement>
          <Input
            placeholder="Buscar instituições..."
            bg={useColorModeValue('white', 'gray.800')}
            borderRadius="lg"
          />
        </InputGroup>
        <Button
          leftIcon={<FiPlusCircle />}
          bgGradient={`linear(to-r, ${customColors.primary}, ${customColors.secondary})`}
          color="white"
          _hover={{
            bgGradient: `linear(to-r, ${customColors.primaryDark}, ${customColors.secondaryDark})`,
          }}
          borderRadius="lg"
          px={6}
        >
          Nova Instituição
        </Button>
      </HStack>

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
              <Th>Instituição</Th>
              <Th>Localização</Th>
              <Th>Tipo</Th>
              <Th>Especialidades</Th>
              <Th>Status</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {mockData.map((instituicao) => (
              <Tr key={instituicao.id}>
                <Td>
                  <HStack spacing={3}>
                    <Image
                      src={instituicao.logo}
                      alt={instituicao.name}
                      boxSize="40px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                    <Text fontWeight="medium">{instituicao.name}</Text>
                  </HStack>
                </Td>
                <Td>{instituicao.location}</Td>
                <Td>{instituicao.type}</Td>
                <Td>
                  <Stack direction="row" spacing={2}>
                    {instituicao.specialties.map((specialty, index) => (
                      <Badge
                        key={index}
                        px={2}
                        py={1}
                        borderRadius="full"
                        bg={tagBg}
                        fontSize="xs"
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </Stack>
                </Td>
                <Td>{getStatusBadge(instituicao.status)}</Td>
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
                      <MenuItem>Ver detalhes</MenuItem>
                      <MenuItem>Editar</MenuItem>
                      <MenuItem>Gerenciar médicos</MenuItem>
                      <MenuItem color="red.500">Desativar</MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </MotionBox>
    </PageContainer>
  )
}

export default Instituicoes 