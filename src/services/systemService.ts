
import { supabase } from "@/integrations/supabase/client";
import { System } from "@/types/system";

export async function getSystems(projectId?: string): Promise<System[]> {
  let query = supabase
    .from('systems')
    .select('*')
    .order('name');
  
  if (projectId) {
    query = query.eq('project_id', projectId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching systems:", error);
    throw error;
  }
  
  return data || [];
}

export async function getSystem(id: string): Promise<System | null> {
  const { data, error } = await supabase
    .from('systems')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error("Error fetching system:", error);
    throw error;
  }
  
  return data;
}

export async function createSystem(systemData: Omit<Partial<System>, 'name' | 'project_id'> & { name: string, project_id: string }): Promise<System> {
  const { data, error } = await supabase
    .from('systems')
    .insert(systemData)
    .select()
    .single();
  
  if (error) {
    console.error("Error creating system:", error);
    throw error;
  }
  
  return data;
}

export async function updateSystem(id: string, systemData: Partial<System>): Promise<System> {
  const { data, error } = await supabase
    .from('systems')
    .update(systemData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating system:", error);
    throw error;
  }
  
  return data;
}

export async function deleteSystem(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('systems')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting system:", error);
    throw error;
  }
  
  return true;
}
