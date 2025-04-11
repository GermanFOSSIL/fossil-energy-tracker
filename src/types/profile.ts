
export interface Profile {
  id: string;
  avatar_url: string;
  full_name: string;
  role: string;
  permissions: string[];
  email: string;
  created_at: string;
  updated_at: string;
  metadata?: {
    roles?: Array<{
      role: string;
      permissions: string[];
    }>;
    preferences?: {
      theme: 'light' | 'dark';
      notifications: boolean;
    };
  };
}
