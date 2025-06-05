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
  Tag,
  Text,
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
    name: 'Ana Silva',
    email: 'ana.silva@email.com',
    phone: '(11) 98765-4321',
    source: 'Website',
    status: 'new',
    createdAt: '2024-03-20',
  },
  {
    id: 2,
    name: 'Pedro Santos',
    email: 'pedro.santos@email.com',
    phone: '(11) 91234-5678',
    source: 'Indicação',
    status: 'contacted',
    createdAt: '2024-03-19',
  },
  {
    id: 3,
    name: 'Mariana Oliveira',
    email: 'mariana.oliveira@email.com',
    phone: '(11) 99876-5432',
    source: 'Instagram',
    status: 'converted',
    createdAt: '2024-03-18',
  },
]

const Leads = () => {
  const tableBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const getStatusBadge = (status: string) => {
    const props = {
      new: {
        colorScheme: 'blue',
        text: 'Novo',
      },
      contacted: {
        colorScheme: 'orange',
        text: 'Contatado',
      },
      converted: {
        colorScheme: 'green',
        text: 'Convertido',
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
      title="Leads"
      description="Gerencie seus leads e potenciais clientes"
    >
      <HStack mb={6} spacing={4}>
        <InputGroup maxW="xs">
          <InputLeftElement pointerEvents="none" color="gray.400">
            <FiSearch />
          </InputLeftElement>
          <Input
            placeholder="Buscar leads..."
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
          Novo Lead
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
              <Th>Contato</Th>
              <Th>Origem</Th>
              <Th>Status</Th>
              <Th>Data de Cadastro</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {mockData.map((lead) => (
              <Tr key={lead.id}>
                <Td fontWeight="medium">{lead.name}</Td>
                <Td>
                  <Box>
                    <Text fontSize="sm">{lead.email}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {lead.phone}
                    </Text>
                  </Box>
                </Td>
                <Td>
                  <Tag size="sm" borderRadius="full">
                    {lead.source}
                  </Tag>
                </Td>
                <Td>{getStatusBadge(lead.status)}</Td>
                <Td>{new Date(lead.createdAt).toLocaleDateString('pt-BR')}</Td>
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
                      <MenuItem>Enviar email</MenuItem>
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

export default Leads 