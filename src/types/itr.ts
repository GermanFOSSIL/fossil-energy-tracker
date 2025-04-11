
export interface ITR {
  id: string;
  name: string;
  subsystem_id: string;
  status: string;
  progress?: number;
  quantity: number;
  start_date?: string;
  end_date?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  metadata?: {
    signatures?: Array<{
      id: string;
      itr_id: string;
      user_id: string;
      role: 'inspector' | 'approver';
      signature_date: string;
      created_at: string;
    }>;
    [key: string]: any;
  };
}
