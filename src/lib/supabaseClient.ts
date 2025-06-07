import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getPendingDoctorsCount = async () => {
  const { count, error } = await supabase
    .from('medico')
    .select('*', { count: 'exact', head: true })
    .eq('aprovado', false);

  if (error) {
    console.error('Error fetching pending doctors:', error);
    throw error;
  }

  return count || 0;
};

export const getApprovedDoctorsCount = async () => {
  const { count, error } = await supabase
    .from('medico')
    .select('*', { count: 'exact', head: true })
    .eq('aprovado', true);

  if (error) {
    console.error('Error fetching approved doctors:', error);
    throw error;
  }

  return count || 0;
};

export const getTotalLeadsCount = async () => {
  const { count, error } = await supabase
    .from('lead')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error fetching total leads:', error);
    throw error;
  }

  return count || 0;
};

export const getDoctorsWithPendingChangesCount = async () => {
  try {
    // Get ALL doctors with their relationships
    const { data: doctors, error } = await supabase
      .from('medico')
      .select(`
        id,
        aprovado,
        new_rqe,
        medico_especialidade_residencia!left (
          aprovado
        ),
        medico_subespecialidade_residencia!left (
          aprovado
        ),
        formacao_outros!left (
          aprovado
        )
      `)
      .eq('aprovado', true);

    if (error) {
      console.error('Error fetching doctors:', error)
      throw error
    }

    // Filter doctors with pending changes
    const doctorsWithChanges = doctors?.filter(doctor => {
      const hasNewRQE = doctor.new_rqe != null && doctor.new_rqe !== ''
      const hasUnapprovedEsp = doctor.medico_especialidade_residencia?.some(esp => !esp.aprovado)
      const hasUnapprovedSubesp = doctor.medico_subespecialidade_residencia?.some(sub => !sub.aprovado)
      const hasUnapprovedForm = doctor.formacao_outros?.some(form => !form.aprovado)

      return hasNewRQE || hasUnapprovedEsp || hasUnapprovedSubesp || hasUnapprovedForm
    })

    console.log('Total doctors:', doctors?.length || 0)
    console.log('Doctors with changes:', doctorsWithChanges?.length || 0)
    console.log('Doctor IDs with changes:', doctorsWithChanges?.map(d => d.id))

    return doctorsWithChanges?.length || 0
  } catch (error) {
    console.error('Error counting doctors with pending changes:', error)
    throw error
  }
} 