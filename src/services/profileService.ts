
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";

export async function getProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name');
  
  if (error) {
    console.error("Error fetching profiles:", error);
    throw error;
  }
  
  return data || [];
}

export async function getProfile(id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
  
  return data;
}

export async function updateProfile(id: string, profileData: Partial<Profile>): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
  
  return data;
}

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }
  
  return getProfile(user.id);
}
