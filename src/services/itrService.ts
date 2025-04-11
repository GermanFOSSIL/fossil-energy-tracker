
import { supabase } from "@/integrations/supabase/client";
import { ITR } from "@/types/itr";

export async function getItrs(subsystemId?: string): Promise<ITR[]> {
  let query = supabase
    .from('itrs')
    .select('*')
    .order('name');
  
  if (subsystemId) {
    query = query.eq('subsystem_id', subsystemId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching ITRs:", error);
    throw error;
  }
  
  return data || [];
}

export async function getItr(id: string): Promise<ITR | null> {
  const { data, error } = await supabase
    .from('itrs')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error("Error fetching ITR:", error);
    throw error;
  }
  
  return data;
}

export async function createItr(itrData: Omit<Partial<ITR>, 'name' | 'subsystem_id'> & { name: string, subsystem_id: string }): Promise<ITR> {
  const { data, error } = await supabase
    .from('itrs')
    .insert(itrData)
    .select()
    .single();
  
  if (error) {
    console.error("Error creating ITR:", error);
    throw error;
  }
  
  return data;
}

export async function updateItr(id: string, itrData: Partial<ITR>): Promise<ITR> {
  // Create a new object with only the fields we want to update
  const updatedData: Record<string, any> = {};
  
  // Copy only the properties that exist in itrData
  for (const key in itrData) {
    if (Object.prototype.hasOwnProperty.call(itrData, key)) {
      updatedData[key] = (itrData as any)[key];
    }
  }
  
  const { data, error } = await supabase
    .from('itrs')
    .update(updatedData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating ITR:", error);
    throw error;
  }
  
  return data;
}

export async function deleteItr(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('itrs')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting ITR:", error);
    throw error;
  }
  
  return true;
}
