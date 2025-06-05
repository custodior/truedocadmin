import React, { useEffect, useState } from 'react'
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Heading,
  Text,
} from '@chakra-ui/react'
import { supabase } from '../../lib/supabase'

interface TableInfo {
  name: string
  rowCount: number
}

const DatabaseOverview = () => {
  const [tables, setTables] = useState<TableInfo[]>([])

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const { data: tablesData, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')

        if (tablesError) throw tablesError

        const tableInfoPromises = tablesData.map(async ({ table_name }) => {
          const { count, error: countError } = await supabase
            .from(table_name)
            .select('*', { count: 'exact', head: true })

          if (countError) throw countError

          return {
            name: table_name,
            rowCount: count || 0,
          }
        })

        const tableInfo = await Promise.all(tableInfoPromises)
        setTables(tableInfo)
      } catch (error) {
        console.error('Error fetching tables:', error)
      }
    }

    fetchTables()
  }, [])

  return (
    <Box>
      <Heading size="lg" mb={6}>Database Overview</Heading>
      <Text mb={8} color="gray.600">
        Overview of your database tables and their record counts.
      </Text>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {tables.map((table) => (
          <Stat
            key={table.name}
            px={4}
            py={3}
            bg="white"
            shadow="sm"
            borderWidth="1px"
            borderRadius="lg"
            transition="all 0.2s"
            _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
          >
            <StatLabel fontSize="lg" color="gray.600">{table.name}</StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold" color="blue.600">
              {table.rowCount}
            </StatNumber>
            <StatHelpText color="gray.500">Total Records</StatHelpText>
          </Stat>
        ))}
      </SimpleGrid>
    </Box>
  )
}

export default DatabaseOverview 