
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { logDatabaseActivity } from "@/services/logService";

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'manager' | 'inspector' | 'viewer';
  created_at: string;
}

export async function getUsers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name');
  
  if (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
  
  return data || [];
}

export async function getUser(id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
  
  return data;
}

export async function createUser(email: string, password: string, fullName: string): Promise<Profile> {
  // Use Supabase auth to create the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (authError) {
    console.error("Error creating user:", authError);
    throw authError;
  }

  if (!authData.user) {
    throw new Error("User creation failed");
  }

  // Get the newly created profile
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (error) {
    console.error("Error retrieving new user profile:", error);
    throw error;
  }

  // Log the activity
  await logDatabaseActivity(
    'CREATE_USER',
    'profiles',
    data.id,
    { email }
  );

  return data;
}

export async function updateUser(id: string, userData: Partial<Profile>): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(userData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating user:", error);
    throw error;
  }
  
  // Log the activity
  await logDatabaseActivity(
    'UPDATE_USER',
    'profiles',
    id,
    { updated_fields: Object.keys(userData) }
  );
  
  return data;
}

export async function deleteUser(id: string): Promise<boolean> {
  // When deleting a user, we need to delete both the profile and the auth user
  // First delete the profile
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);
  
  if (profileError) {
    console.error("Error deleting user profile:", profileError);
    throw profileError;
  }
  
  // Then delete the auth user (this may require admin rights)
  const { error: authError } = await supabase.auth.admin.deleteUser(id);
  
  if (authError) {
    console.error("Error deleting auth user:", authError);
    throw authError;
  }
  
  // Log the activity
  await logDatabaseActivity(
    'DELETE_USER',
    'profiles',
    id,
    {}
  );
  
  return true;
}

export async function getUserRoles(userId: string): Promise<UserRole[]> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId);
  
  if (error) {
    console.error("Error fetching user roles:", error);
    throw error;
  }
  
  return data || [];
}

export async function assignRole(userId: string, role: 'admin' | 'manager' | 'inspector' | 'viewer'): Promise<UserRole> {
  // Check if the user already has this role
  const { data: existingRole } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId)
    .eq('role', role)
    .maybeSingle();
  
  if (existingRole) {
    return existingRole;
  }
  
  // Assign the new role
  const { data, error } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error assigning role:", error);
    throw error;
  }
  
  // Log the activity
  await logDatabaseActivity(
    'ASSIGN_ROLE',
    'user_roles',
    data.id,
    { user_id: userId, role }
  );
  
  return data;
}

export async function removeRole(userRoleId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('id', userRoleId);
  
  if (error) {
    console.error("Error removing role:", error);
    throw error;
  }
  
  // Log the activity
  await logDatabaseActivity(
    'REMOVE_ROLE',
    'user_roles',
    userRoleId,
    {}
  );
  
  return true;
}
