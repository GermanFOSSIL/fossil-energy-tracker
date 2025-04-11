
import { supabase } from '@/integrations/supabase/client';
import { logDatabaseActivity } from '@/services/logService';
import { Profile } from '@/types/profile';

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  return data;
}

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  
  await logDatabaseActivity(
    'LOGIN',
    'auth',
    data.user?.id || '',
    { email }
  );
  
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  
  if (error) throw error;
  
  return true;
}

export async function register(email: string, password: string, userData: Partial<Profile>) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: userData.full_name,
      },
    },
  });
  
  if (error) throw error;
  
  await logDatabaseActivity(
    'REGISTER',
    'auth',
    data.user?.id || '',
    { email }
  );
  
  return data;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  if (error) throw error;
  
  return true;
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({
    password,
  });
  
  if (error) throw error;
  
  return true;
}

export async function getUserRoles(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (!data || !data.metadata || !data.metadata.roles) {
    return [];
  }
  
  return data.metadata.roles;
}

export async function hasRole(userId: string, role: string): Promise<boolean> {
  const roles = await getUserRoles(userId);
  return roles.some(r => r.role === role);
}
