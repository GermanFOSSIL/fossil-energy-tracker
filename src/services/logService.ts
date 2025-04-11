
import { supabase } from "@/integrations/supabase/client";

interface LogEntry {
  id: string;
  action: string;
  fecha: string;
  tag_id: string;
  usuario_id: string;
}

export async function logAction(action: string, tagId: string, userId: string): Promise<LogEntry> {
  const { data, error } = await supabase
    .from('acciones_log')
    .insert({
      accion: action,
      tag_id: tagId,
      usuario_id: userId
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error logging action:", error);
    throw error;
  }
  
  // Map the response to match our interface
  return {
    id: data.id,
    action: data.accion,
    fecha: data.fecha,
    tag_id: data.tag_id,
    usuario_id: data.usuario_id
  };
}

export async function getActionLogs(tagId?: string, userId?: string): Promise<LogEntry[]> {
  let query = supabase
    .from('acciones_log')
    .select('*')
    .order('fecha', { ascending: false });
  
  if (tagId) {
    query = query.eq('tag_id', tagId);
  }
  
  if (userId) {
    query = query.eq('usuario_id', userId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching action logs:", error);
    throw error;
  }
  
  // Map the response to match our interface
  return (data || []).map(item => ({
    id: item.id,
    action: item.accion,
    fecha: item.fecha,
    tag_id: item.tag_id,
    usuario_id: item.usuario_id
  }));
}

export async function logDatabaseActivity(action: string, tableName: string, recordId: string, details?: any): Promise<void> {
  const { error } = await supabase
    .from('db_activity_log')
    .insert({
      action,
      table_name: tableName,
      record_id: recordId,
      details
    });
  
  if (error) {
    console.error("Error logging database activity:", error);
    throw error;
  }
}
