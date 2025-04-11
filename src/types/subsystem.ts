
export interface Subsystem {
  id: string;
  name: string;
  system_id: string;
  completion_rate?: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  metadata?: {
    description?: string;
    tags?: string[];
    status_history?: Array<{
      status: string;
      date: string;
      user_id: string;
    }>;
  };
}
