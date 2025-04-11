
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/project";
import { i18n } from "i18next";

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

export async function createProject(projectData: Omit<Partial<Project>, 'name'> & { name: string }): Promise<Project> {
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
  // Ensure name is defined if it's included in the update
  if ('name' in projectData && projectData.name === undefined) {
    throw new Error("Project name cannot be undefined");
  }
  
  const { data, error } = await supabase
    .from('projects')
    .update(projectData as { name: string })
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

// Helper function to translate project status based on current language
export function translateProjectStatus(status: string | undefined, i18n: i18n): string {
  if (!status) return '';
  
  const statusKey = status.toLowerCase().replace(/-/g, '');
  const translations: Record<string, string> = {
    'pending': i18n.t('projects.statuses.pending'),
    'inprogress': i18n.t('projects.statuses.inProgress'),
    'completed': i18n.t('projects.statuses.completed'),
    'delayed': i18n.t('projects.statuses.delayed')
  };
  
  return translations[statusKey] || status;
}
