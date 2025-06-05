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
  // First get all approved doctors with pending RQE changes
  const { data: rqeDoctors, error: rqeError } = await supabase
    .from('medico')
    .select('id')
    .eq('aprovado', true)
    .not('new_rqe', 'is', null);

  if (rqeError) throw rqeError;

  // Get doctors with pending formacao_outros
  const { data: formacaoDoctors, error: formacaoError } = await supabase
    .from('formacao_outros')
    .select('medico_id')
    .eq('aprovado', false);

  if (formacaoError) throw formacaoError;

  // Get doctors with pending especialidades
  const { data: especialidadeDoctors, error: especialidadeError } = await supabase
    .from('medico_especialidade_residencia')
    .select('medico_id')
    .eq('aprovado', false);

  if (especialidadeError) throw especialidadeError;

  // Get doctors with pending subespecialidades
  const { data: subespecialidadeDoctors, error: subespecialidadeError } = await supabase
    .from('medico_subespecialidade_residencia')
    .select('medico_id')
    .eq('aprovado', false);

  if (subespecialidadeError) throw subespecialidadeError;

  // Combine all doctor IDs and get unique count
  const allDoctorIds = new Set([
    ...(rqeDoctors?.map(d => d.id) || []),
    ...(formacaoDoctors?.map(d => d.medico_id) || []),
    ...(especialidadeDoctors?.map(d => d.medico_id) || []),
    ...(subespecialidadeDoctors?.map(d => d.medico_id) || [])
  ]);

  return allDoctorIds.size;
}; 