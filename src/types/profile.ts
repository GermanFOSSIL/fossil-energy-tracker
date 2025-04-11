
export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
  role?: string;
  permissions?: string[];
  created_at: string;
  updated_at: string;
}
