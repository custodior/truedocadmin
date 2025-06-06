import { supabase } from './supabaseClient'

export interface Faculdade {
  id: string
  nome: string
}

export interface FaculdadeFilters {
  search?: string
}

export interface FaculdadeSort {
  column: string
  direction: 'asc' | 'desc'
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export const getFaculdades = async (
  filters: FaculdadeFilters,
  sort: FaculdadeSort,
  pagination: PaginationParams
) => {
  try {
    let query = supabase
      .from('faculdade')
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
      faculdades: data as Faculdade[],
      total: count || 0
    }
  } catch (error) {
    console.error('Error fetching faculdades:', error)
    throw error
  }
}

export const createFaculdade = async (faculdade: Omit<Faculdade, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('faculdade')
      .insert([faculdade])
      .select()
      .single()

    if (error) throw error

    return data as Faculdade
  } catch (error) {
    console.error('Error creating faculdade:', error)
    throw error
  }
}

export const updateFaculdade = async (id: string, updates: Partial<Faculdade>) => {
  try {
    const { data, error } = await supabase
      .from('faculdade')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return data as Faculdade
  } catch (error) {
    console.error('Error updating faculdade:', error)
    throw error
  }
}

export const deleteFaculdade = async (id: string) => {
  try {
    const { error } = await supabase
      .from('faculdade')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting faculdade:', error)
    throw error
  }
} 