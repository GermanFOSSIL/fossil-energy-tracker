
export interface ITR {
  id: string;
  name: string;
  quantity: number;
  status: string;
  progress: number;
  start_date: string;
  end_date: string;
  assigned_to: string;
  subsystem_id: string;
  created_at: string;
  updated_at: string;
  metadata?: {
    signatures?: Array<{
      user_id: string;
      name: string;
      role: string;
      timestamp: string;
      revoked?: boolean;
    }>;
    comments?: Array<{
      user_id: string;
      content: string;
      timestamp: string;
    }>;
    steps?: Array<{
      id: string;
      name: string;
      status: 'pending' | 'in-progress' | 'completed' | 'failed';
      completed_at?: string;
    }>;
  };
}
