
export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
  role?: string;
  permissions?: string[];
  created_at: string;
  updated_at: string;
  metadata?: {
    roles?: Array<{
      id: string;
      user_id: string;
      role: 'admin' | 'manager' | 'inspector' | 'viewer';
      created_at: string;
    }>;
    [key: string]: any;
  };
}
