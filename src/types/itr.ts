
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
}
