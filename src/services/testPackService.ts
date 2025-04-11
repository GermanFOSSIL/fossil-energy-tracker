
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

export async function createTestPack(testPackData: Partial<TestPack>): Promise<TestPack> {
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

export async function createTag(tagData: Partial<Tag>): Promise<Tag> {
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
