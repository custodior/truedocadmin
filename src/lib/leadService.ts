import { supabase } from './supabaseClient'

export interface Lead {
  id: number
  name: string
  email: string
  phone: string
  source: string
  status: 'new' | 'contacted' | 'converted'
  created_at: string
  notes?: string
}

export interface LeadFilters {
  search?: string
  status?: string
  source?: string
  startDate?: string
  endDate?: string
}

export interface LeadSort {
  column: string
  direction: 'asc' | 'desc'
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export const getLeads = async (
  filters: LeadFilters,
  sort: LeadSort,
  pagination: PaginationParams
) => {
  try {
    let query = supabase
      .from('lead')
      .select('*', { count: 'exact' })

    // Apply filters
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.source) {
      query = query.eq('source', filters.source)
    }
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate)
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate)
    }

    // Apply sorting
    query = query.order(sort.column, { ascending: sort.direction === 'asc' })

    // Apply pagination
    const from = pagination.page * pagination.pageSize
    query = query.range(from, from + pagination.pageSize - 1)

    const { data, error, count } = await query

    if (error) throw error

    return {
      leads: data as Lead[],
      total: count || 0
    }
  } catch (error) {
    console.error('Error fetching leads:', error)
    throw error
  }
}

export const createLead = async (lead: Omit<Lead, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('lead')
      .insert([lead])
      .select()
      .single()

    if (error) throw error

    return data as Lead
  } catch (error) {
    console.error('Error creating lead:', error)
    throw error
  }
}

export const updateLead = async (id: number, updates: Partial<Lead>) => {
  try {
    const { data, error } = await supabase
      .from('lead')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return data as Lead
  } catch (error) {
    console.error('Error updating lead:', error)
    throw error
  }
}

export const deleteLead = async (id: number) => {
  try {
    const { error } = await supabase
      .from('lead')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting lead:', error)
    throw error
  }
}

export const getLeadSources = async () => {
  try {
    const { data, error } = await supabase
      .from('lead')
      .select('source')
      .then(result => {
        if (result.error) throw result.error
        // Get unique sources
        const uniqueSources = [...new Set(result.data.map(item => item.source))]
        return { data: uniqueSources, error: null }
      })

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching lead sources:', error)
    throw error
  }
} 