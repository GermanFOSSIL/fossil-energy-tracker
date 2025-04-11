
import { supabase } from "@/integrations/supabase/client";
import { TestPack, Tag } from "@/types/testPack";

export async function getTestPacks(itrName?: string): Promise<TestPack[]> {
  let query = supabase
    .from('test_packs')
    .select('*')
    .order('nombre_paquete');
  
  if (itrName) {
    query = query.eq('itr_asociado', itrName);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching test packs:", error);
    throw error;
  }
  
  return data || [];
}

export async function getTestPack(id: string): Promise<TestPack | null> {
  const { data, error } = await supabase
    .from('test_packs')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error("Error fetching test pack:", error);
    throw error;
  }
  
  return data;
}

export async function createTestPack(testPackData: Omit<Partial<TestPack>, 'nombre_paquete' | 'itr_asociado' | 'sistema' | 'subsistema'> & { 
  nombre_paquete: string, 
  itr_asociado: string, 
  sistema: string, 
  subsistema: string 
}): Promise<TestPack> {
  const { data, error } = await supabase
    .from('test_packs')
    .insert(testPackData)
    .select()
    .single();
  
  if (error) {
    console.error("Error creating test pack:", error);
    throw error;
  }
  
  return data;
}

export async function updateTestPack(id: string, testPackData: Partial<TestPack>): Promise<TestPack> {
  // Ensure required fields are defined if they're included in the update
  if ('nombre_paquete' in testPackData && testPackData.nombre_paquete === undefined) {
    throw new Error("TestPack name cannot be undefined");
  }
  if ('itr_asociado' in testPackData && testPackData.itr_asociado === undefined) {
    throw new Error("ITR Asociado cannot be undefined");
  }
  if ('sistema' in testPackData && testPackData.sistema === undefined) {
    throw new Error("Sistema cannot be undefined");
  }
  if ('subsistema' in testPackData && testPackData.subsistema === undefined) {
    throw new Error("Subsistema cannot be undefined");
  }
  
  const { data, error } = await supabase
    .from('test_packs')
    .update(testPackData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating test pack:", error);
    throw error;
  }
  
  return data;
}

export async function deleteTestPack(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('test_packs')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting test pack:", error);
    throw error;
  }
  
  return true;
}

export async function getTagsByTestPack(testPackId: string): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('test_pack_id', testPackId)
    .order('created_at');
  
  if (error) {
    console.error("Error fetching tags:", error);
    throw error;
  }
  
  return data || [];
}

export async function createTag(tagData: Omit<Partial<Tag>, 'tag_name' | 'test_pack_id'> & { 
  tag_name: string, 
  test_pack_id: string 
}): Promise<Tag> {
  const { data, error } = await supabase
    .from('tags')
    .insert(tagData)
    .select()
    .single();
  
  if (error) {
    console.error("Error creating tag:", error);
    throw error;
  }
  
  return data;
}

export async function updateTag(id: string, tagData: Partial<Tag>): Promise<Tag> {
  // Ensure required fields are defined if they're included in the update
  if ('tag_name' in tagData && tagData.tag_name === undefined) {
    throw new Error("Tag name cannot be undefined");
  }
  if ('test_pack_id' in tagData && tagData.test_pack_id === undefined) {
    throw new Error("Test Pack ID cannot be undefined");
  }
  
  const { data, error } = await supabase
    .from('tags')
    .update(tagData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating tag:", error);
    throw error;
  }
  
  return data;
}

export async function deleteTag(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting tag:", error);
    throw error;
  }
  
  return true;
}
