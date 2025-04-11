
export interface Project {
  id: string;
  name: string;
  progress?: number;
  start_date?: string;
  end_date?: string;
  status: string;
  location?: string;
  created_at: string;
  updated_at: string;
}
