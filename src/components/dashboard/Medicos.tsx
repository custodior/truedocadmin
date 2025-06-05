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
} from '@chakra-ui/react'
import { FiMoreVertical, FiSearch, FiUserPlus } from 'react-icons/fi'
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
    name: 'Dr. João Silva',
    specialty: 'Cardiologia',
    crm: '123456',
    status: 'approved',
    lastUpdate: '2024-03-20',
  },
  {
    id: 2,
    name: 'Dra. Maria Santos',
    specialty: 'Neurologia',
    crm: '789012',
    status: 'pending',
    lastUpdate: '2024-03-19',
  },
  {
    id: 3,
    name: 'Dr. Carlos Oliveira',
    specialty: 'Ortopedia',
    crm: '345678',
    status: 'approved',
    lastUpdate: '2024-03-18',
  },
]

const Medicos = () => {
  const tableBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const getStatusBadge = (status: string) => {
    const props = {
      approved: {
        colorScheme: 'green',
        text: 'Aprovado',
      },
      pending: {
        colorScheme: 'orange',
        text: 'Pendente',
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
      title="Médicos"
      description="Gerencie os médicos cadastrados no sistema"
    >
      <HStack mb={6} spacing={4}>
        <InputGroup maxW="xs">
          <InputLeftElement pointerEvents="none" color="gray.400">
            <FiSearch />
          </InputLeftElement>
          <Input
            placeholder="Buscar médicos..."
            bg={useColorModeValue('white', 'gray.800')}
            borderRadius="lg"
          />
        </InputGroup>
        <Button
          leftIcon={<FiUserPlus />}
          bgGradient={`linear(to-r, ${customColors.primary}, ${customColors.secondary})`}
          color="white"
          _hover={{
            bgGradient: `linear(to-r, ${customColors.primaryDark}, ${customColors.secondaryDark})`,
          }}
          borderRadius="lg"
          px={6}
        >
          Novo Médico
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
              <Th>Nome</Th>
              <Th>Especialidade</Th>
              <Th>CRM</Th>
              <Th>Status</Th>
              <Th>Última Atualização</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {mockData.map((doctor) => (
              <Tr key={doctor.id}>
                <Td fontWeight="medium">{doctor.name}</Td>
                <Td>{doctor.specialty}</Td>
                <Td>{doctor.crm}</Td>
                <Td>{getStatusBadge(doctor.status)}</Td>
                <Td>{new Date(doctor.lastUpdate).toLocaleDateString('pt-BR')}</Td>
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
                      <MenuItem color="red.500">Remover</MenuItem>
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

export default Medicos 