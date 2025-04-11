
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/project";

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('name');
  
  if (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
  
  return data || [];
}

export async function getProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error("Error fetching project:", error);
    throw error;
  }
  
  return data;
}

export async function createProject(projectData: Partial<Project>): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert(projectData)
    .select()
    .single();
  
  if (error) {
    console.error("Error creating project:", error);
    throw error;
  }
  
  return data;
}

export async function updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update(projectData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating project:", error);
    throw error;
  }
  
  return data;
}

export async function deleteProject(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
  
  return true;
}
