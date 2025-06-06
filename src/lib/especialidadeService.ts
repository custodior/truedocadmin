import { supabase } from './supabaseClient'

export interface Especialidade {
  id: string
  nome: string
  tipo: 'D' | 'E'
}

export const getEspecialidades = async () => {
  try {
    const { data, error } = await supabase
      .from('especialidade')
      .select('*')
      .order('nome')

    if (error) throw error

    return data as Especialidade[]
  } catch (error) {
    console.error('Error fetching especialidades:', error)
    throw error
  }
} 