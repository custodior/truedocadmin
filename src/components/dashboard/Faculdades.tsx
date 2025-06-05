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
    name: 'Universidade de São Paulo',
    logo: 'https://placehold.co/40x40',
    location: 'São Paulo, SP',
    type: 'Pública',
    status: 'active',
    programs: 45,
  },
  {
    id: 2,
    name: 'PUC-Rio',
    logo: 'https://placehold.co/40x40',
    location: 'Rio de Janeiro, RJ',
    type: 'Privada',
    status: 'active',
    programs: 32,
  },
  {
    id: 3,
    name: 'UNIFESP',
    logo: 'https://placehold.co/40x40',
    location: 'São Paulo, SP',
    type: 'Pública',
    status: 'pending',
    programs: 28,
  },
]

const Faculdades = () => {
  const tableBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

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
      title="Faculdades"
      description="Gerencie as instituições de ensino parceiras"
    >
      <HStack mb={6} spacing={4}>
        <InputGroup maxW="xs">
          <InputLeftElement pointerEvents="none" color="gray.400">
            <FiSearch />
          </InputLeftElement>
          <Input
            placeholder="Buscar faculdades..."
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
          Nova Faculdade
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
              <Th>Faculdade</Th>
              <Th>Localização</Th>
              <Th>Tipo</Th>
              <Th>Programas</Th>
              <Th>Status</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {mockData.map((faculdade) => (
              <Tr key={faculdade.id}>
                <Td>
                  <HStack spacing={3}>
                    <Image
                      src={faculdade.logo}
                      alt={faculdade.name}
                      boxSize="40px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                    <Text fontWeight="medium">{faculdade.name}</Text>
                  </HStack>
                </Td>
                <Td>{faculdade.location}</Td>
                <Td>{faculdade.type}</Td>
                <Td isNumeric>{faculdade.programs}</Td>
                <Td>{getStatusBadge(faculdade.status)}</Td>
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
                      <MenuItem>Gerenciar programas</MenuItem>
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

export default Faculdades 