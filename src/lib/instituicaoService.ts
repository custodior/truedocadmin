import { supabase } from './supabaseClient'

export interface Instituicao {
  id: string
  nome: string
}

export interface InstituicaoFilters {
  search?: string
}

export interface InstituicaoSort {
  column: string
  direction: 'asc' | 'desc'
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export const getInstituicoes = async (
  filters: InstituicaoFilters,
  sort: InstituicaoSort,
  pagination: PaginationParams
) => {
  try {
    let query = supabase
      .from('instituicao_residencia')
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
      instituicoes: data as Instituicao[],
      total: count || 0
    }
  } catch (error) {
    console.error('Error fetching instituicoes:', error)
    throw error
  }
}

export const createInstituicao = async (instituicao: Omit<Instituicao, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('instituicao_residencia')
      .insert([instituicao])
      .select()
      .single()

    if (error) throw error

    return data as Instituicao
  } catch (error) {
    console.error('Error creating instituicao:', error)
    throw error
  }
}

export const updateInstituicao = async (id: string, updates: Partial<Instituicao>) => {
  try {
    const { data, error } = await supabase
      .from('instituicao_residencia')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return data as Instituicao
  } catch (error) {
    console.error('Error updating instituicao:', error)
    throw error
  }
}

export const deleteInstituicao = async (id: string) => {
  try {
    const { error } = await supabase
      .from('instituicao_residencia')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting instituicao:', error)
    throw error
  }
} 