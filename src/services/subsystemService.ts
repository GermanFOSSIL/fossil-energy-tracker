
import { supabase } from "@/integrations/supabase/client";
import { Subsystem } from "@/types/subsystem";

export async function getSubsystems(systemId?: string): Promise<Subsystem[]> {
  let query = supabase
    .from('subsystems')
    .select('*')
    .order('name');
  
  if (systemId) {
    query = query.eq('system_id', systemId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching subsystems:", error);
    throw error;
  }
  
  return data || [];
}

export async function getSubsystem(id: string): Promise<Subsystem | null> {
  const { data, error } = await supabase
    .from('subsystems')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error("Error fetching subsystem:", error);
    throw error;
  }
  
  return data;
}

export async function createSubsystem(subsystemData: Partial<Subsystem>): Promise<Subsystem> {
  const { data, error } = await supabase
    .from('subsystems')
    .insert(subsystemData)
    .select()
    .single();
  
  if (error) {
    console.error("Error creating subsystem:", error);
    throw error;
  }
  
  return data;
}

export async function updateSubsystem(id: string, subsystemData: Partial<Subsystem>): Promise<Subsystem> {
  const { data, error } = await supabase
    .from('subsystems')
    .update(subsystemData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating subsystem:", error);
    throw error;
  }
  
  return data;
}

export async function deleteSubsystem(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('subsystems')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting subsystem:", error);
    throw error;
  }
  
  return true;
}
