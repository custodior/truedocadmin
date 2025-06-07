import React, { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  Container,
  Heading,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  Image,
  Flex,
  InputRightElement,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

// Custom theme colors based on #5deb99
const customColors = {
  primary: '#5deb99',
  primaryDark: '#4ac980',
  secondary: '#3dd6a3',
  secondaryDark: '#35b98c',
}

const Auth = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()
  const { setSession } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.session) {
        // Check if user is a moderator
        const { data: medicoData, error: medicoError } = await supabase
          .from('medico')
          .select('moderador')
          .eq('email', email)
          .single()

        if (medicoError) {
          throw new Error('Error checking moderator status')
        }

        if (!medicoData?.moderador) {
          // Sign out if not a moderator
          await supabase.auth.signOut()
          throw new Error('Acesso não autorizado. Apenas moderadores podem acessar o painel.')
        }

        setSession(data.session)
        navigate('/dashboard')
      }
    } catch (error: any) {
      toast({
        title: 'Erro no Login',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      // Sign out if there was an error
      await supabase.auth.signOut()
    } finally {
      setLoading(false)
    }
  }

  const bgGradient = useColorModeValue(
    `linear(to-r, ${customColors.primary}, ${customColors.secondary})`,
    `linear(to-r, ${customColors.primaryDark}, ${customColors.secondaryDark})`
  )

  return (
    <Flex minH="100vh" bg={useColorModeValue('gray.50', 'gray.800')}>
      {/* Left side - Decorative */}
      <MotionBox
        display={{ base: 'none', lg: 'flex' }}
        flex={1}
        bgGradient={bgGradient}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Flex
          direction="column"
          alignItems="center"
          justifyContent="center"
          color="black"
          p={10}
          textAlign="center"
          w="full"
        >
          <MotionFlex
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            direction="column"
            align="center"
          >
            <Heading size="2xl" mb={6} fontWeight="bold">
              TrueDoc Admin
            </Heading>
            <Text fontSize="xl" maxW="md" lineHeight="tall" fontWeight="medium">
              Plataform pra gerenciar o site TrueDoc.com.br
            </Text>
          </MotionFlex>
        </Flex>
      </MotionBox>

      {/* Right side - Login form */}
      <Flex flex={1} align="center" justify="center">
        <MotionBox
          w="full"
          maxW="md"
          mx="auto"
          px={8}
          py={10}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <VStack spacing={6} align="stretch">
            <Box textAlign="center" mb={8}>
              <Heading
                bgGradient={`linear(to-r, ${customColors.primary}, ${customColors.secondary})`}
                bgClip="text"
                size="xl"
                mb={2}
              >
                Bem-vindo
              </Heading>
              <Text color={useColorModeValue('gray.600', 'gray.400')}>
                Entre com suas credenciais para acessar
              </Text>
            </Box>

            <FormControl id="email">
              <FormLabel>Email</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" color={customColors.primary}>
                  <FiMail />
                </InputLeftElement>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  bg={useColorModeValue('white', 'gray.700')}
                  borderRadius="lg"
                  size="lg"
                  _focus={{
                    borderColor: customColors.primary,
                    boxShadow: `0 0 0 1px ${customColors.primary}`,
                  }}
                />
              </InputGroup>
            </FormControl>

            <FormControl id="password">
              <FormLabel>Senha</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" color={customColors.primary}>
                  <FiLock />
                </InputLeftElement>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  bg={useColorModeValue('white', 'gray.700')}
                  borderRadius="lg"
                  size="lg"
                  _focus={{
                    borderColor: customColors.primary,
                    boxShadow: `0 0 0 1px ${customColors.primary}`,
                  }}
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    color={customColors.primary}
                    _hover={{
                      bg: useColorModeValue('gray.100', 'gray.700'),
                    }}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Button
              size="lg"
              width="full"
              onClick={handleLogin}
              isLoading={loading}
              loadingText="Entrando..."
              bgGradient={bgGradient}
              color="white"
              _hover={{
                bgGradient: useColorModeValue(
                  `linear(to-r, ${customColors.primaryDark}, ${customColors.secondaryDark})`,
                  `linear(to-r, ${customColors.primary}, ${customColors.secondary})`
                ),
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
              _active={{
                transform: 'translateY(0)',
                boxShadow: 'md',
              }}
              transition="all 0.2s"
            >
              Entrar
            </Button>
          </VStack>
        </MotionBox>
      </Flex>
    </Flex>
  )
}

export default Auth 