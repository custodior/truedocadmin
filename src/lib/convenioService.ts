import { supabase } from './supabaseClient'

export interface Convenio {
  id: string
  nome: string
}

export interface ConvenioFilters {
  search?: string
}

export interface ConvenioSort {
  column: string
  direction: 'asc' | 'desc'
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export const getConvenios = async (
  filters: ConvenioFilters,
  sort: ConvenioSort,
  pagination: PaginationParams
) => {
  try {
    let query = supabase
      .from('convenio')
      .select('*', { count: 'exact' })

    // Apply filters
    if (filters.search) {
      query = query.ilike('nome', `%${filters.search}%`)
    }

    // Apply sorting
    query = query.order(sort.column, { ascending: sort.direction === 'asc' })

    // Apply pagination
    const from = pagination.page * pagination.pageSize
    query = query.range(from, from + pagination.pageSize - 1)

    const { data, error, count } = await query

    if (error) throw error

    return {
      convenios: data as Convenio[],
      total: count || 0
    }
  } catch (error) {
    console.error('Error fetching convenios:', error)
    throw error
  }
}

export const createConvenio = async (convenio: Omit<Convenio, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('convenio')
      .insert([convenio])
      .select()
      .single()

    if (error) throw error

    return data as Convenio
  } catch (error) {
    console.error('Error creating convenio:', error)
    throw error
  }
}

export const updateConvenio = async (id: string, updates: Partial<Convenio>) => {
  try {
    const { data, error } = await supabase
      .from('convenio')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return data as Convenio
  } catch (error) {
    console.error('Error updating convenio:', error)
    throw error
  }
}

export const deleteConvenio = async (id: string) => {
  try {
    const { error } = await supabase
      .from('convenio')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting convenio:', error)
    throw error
  }
} 