
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

// Since we don't have direct access to the user_roles table in the schema,
// we'll implement role management through the profiles table's metadata field
export async function getUserRoles(userId: string): Promise<UserRole[]> {
  // Get the user profile
  const { data: user, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error("Error fetching user roles:", error);
    throw error;
  }
  
  // If no metadata or roles, return empty array
  if (!user || !user.metadata || !user.metadata.roles) {
    return [];
  }
  
  return user.metadata.roles as UserRole[];
}

export async function assignRole(userId: string, role: 'admin' | 'manager' | 'inspector' | 'viewer'): Promise<UserRole> {
  // Get the user first
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (userError) {
    console.error("Error fetching user:", userError);
    throw userError;
  }
  
  // Get current roles or initialize empty array
  const currentRoles = (user.metadata && user.metadata.roles) ? user.metadata.roles : [];
  
  // Check if the user already has this role
  const existingRole = currentRoles.find((r: UserRole) => r.role === role);
  if (existingRole) {
    return existingRole;
  }
  
  // Create new role
  const newRole = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    user_id: userId,
    role,
    created_at: new Date().toISOString()
  };
  
  // Add the new role
  const updatedRoles = [...currentRoles, newRole];
  
  // Update user metadata
  const { data, error } = await supabase
    .from('profiles')
    .update({
      metadata: {
        ...user.metadata,
        roles: updatedRoles
      }
    })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error("Error assigning role:", error);
    throw error;
  }
  
  // Log the activity
  await logDatabaseActivity(
    'ASSIGN_ROLE',
    'profiles',
    userId,
    { role_id: newRole.id, role }
  );
  
  return newRole;
}

export async function removeRole(userRoleId: string): Promise<boolean> {
  // Find the user with this role
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('*');
  
  if (usersError) {
    console.error("Error fetching users:", usersError);
    throw usersError;
  }
  
  // Find the user that has this role ID
  let userWithRole = null;
  let roleToRemove = null;
  let updatedRoles = [];
  
  for (const user of users) {
    if (user.metadata && user.metadata.roles) {
      const roleIndex = user.metadata.roles.findIndex((r: UserRole) => r.id === userRoleId);
      if (roleIndex >= 0) {
        userWithRole = user;
        roleToRemove = user.metadata.roles[roleIndex];
        updatedRoles = [...user.metadata.roles];
        updatedRoles.splice(roleIndex, 1);
        break;
      }
    }
  }
  
  if (!userWithRole || !roleToRemove) {
    throw new Error("Role not found");
  }
  
  // Update the user's roles
  const { error } = await supabase
    .from('profiles')
    .update({
      metadata: {
        ...userWithRole.metadata,
        roles: updatedRoles
      }
    })
    .eq('id', userWithRole.id);
  
  if (error) {
    console.error("Error removing role:", error);
    throw error;
  }
  
  // Log the activity
  await logDatabaseActivity(
    'REMOVE_ROLE',
    'profiles',
    userWithRole.id,
    { role_id: userRoleId }
  );
  
  return true;
}
