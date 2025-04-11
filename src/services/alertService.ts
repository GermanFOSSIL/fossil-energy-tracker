
import { supabase } from "@/integrations/supabase/client";

export interface Alert {
  id: string;
  message: string;
  level: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  entity?: string;
}

export async function getAlerts(limit = 10) {
  // For now we'll query the db_activity_log to get recent activities
  const { data, error } = await supabase
    .from('db_activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error("Error fetching alerts:", error);
    throw error;
  }
  
  // Transform db_activity_log entries to alerts format
  const alerts: Alert[] = (data || []).map(log => {
    // Determine alert level based on action type
    let level: 'info' | 'warning' | 'error' | 'success' = 'info';
    if (log.action.includes('DELETE')) {
      level = 'error';
    } else if (log.action.includes('UPDATE')) {
      level = 'warning';
    } else if (log.action.includes('INSERT')) {
      level = 'success';
    }
    
    // Format the message based on action and table
    const message = `${log.action} in ${log.table_name} ${log.record_id ? `(${log.record_id})` : ''}`;
    
    return {
      id: log.id,
      message,
      level,
      timestamp: new Date(log.created_at).toLocaleString(),
      entity: log.table_name
    };
  });
  
  return alerts;
}

export async function logAction(action: string, tableName: string, recordId: string, details?: any) {
  const { error } = await supabase
    .from('db_activity_log')
    .insert({
      action,
      table_name: tableName,
      record_id: recordId,
      details: details || {}
    });
  
  if (error) {
    console.error("Error logging action:", error);
    throw error;
  }
  
  return true;
}
