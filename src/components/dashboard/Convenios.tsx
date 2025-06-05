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
    name: 'Unimed',
    logo: 'https://placehold.co/40x40',
    type: 'Nacional',
    coverage: 'Ampla',
    partneredDoctors: 1250,
    status: 'active',
  },
  {
    id: 2,
    name: 'Bradesco Saúde',
    logo: 'https://placehold.co/40x40',
    type: 'Nacional',
    coverage: 'Completa',
    partneredDoctors: 980,
    status: 'active',
  },
  {
    id: 3,
    name: 'SulAmérica',
    logo: 'https://placehold.co/40x40',
    type: 'Regional',
    coverage: 'Básica',
    partneredDoctors: 450,
    status: 'pending',
  },
]

const Convenios = () => {
  const tableBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const getStatusBadge = (status: string) => {
    const props = {
      active: {
        colorScheme: 'green',
        text: 'Ativo',
      },
      pending: {
        colorScheme: 'orange',
        text: 'Pendente',
      },
      inactive: {
        colorScheme: 'red',
        text: 'Inativo',
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

  const getCoverageBadge = (coverage: string) => {
    const colorScheme = {
      Ampla: 'purple',
      Completa: 'blue',
      Básica: 'gray',
    }[coverage]

    return (
      <Badge
        colorScheme={colorScheme}
        px={2}
        py={1}
        borderRadius="full"
        textTransform="capitalize"
      >
        {coverage}
      </Badge>
    )
  }

  return (
    <PageContainer
      title="Convênios"
      description="Gerencie os convênios médicos parceiros"
    >
      <HStack mb={6} spacing={4}>
        <InputGroup maxW="xs">
          <InputLeftElement pointerEvents="none" color="gray.400">
            <FiSearch />
          </InputLeftElement>
          <Input
            placeholder="Buscar convênios..."
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
          Novo Convênio
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
              <Th>Convênio</Th>
              <Th>Tipo</Th>
              <Th>Cobertura</Th>
              <Th isNumeric>Médicos Parceiros</Th>
              <Th>Status</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {mockData.map((convenio) => (
              <Tr key={convenio.id}>
                <Td>
                  <HStack spacing={3}>
                    <Image
                      src={convenio.logo}
                      alt={convenio.name}
                      boxSize="40px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                    <Text fontWeight="medium">{convenio.name}</Text>
                  </HStack>
                </Td>
                <Td>{convenio.type}</Td>
                <Td>{getCoverageBadge(convenio.coverage)}</Td>
                <Td isNumeric>{convenio.partneredDoctors.toLocaleString()}</Td>
                <Td>{getStatusBadge(convenio.status)}</Td>
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
                      <MenuItem>Gerenciar planos</MenuItem>
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

export default Convenios 