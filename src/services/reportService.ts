
import { supabase } from "@/integrations/supabase/client";

interface ReportRecipient {
  id: string;
  email: string;
  created_at: string;
}

interface ReportSchedule {
  id: string;
  settings: {
    daily: {
      time: string;
      enabled: boolean;
    };
    weekly: {
      day: string;
      time: string;
      enabled: boolean;
    };
    monthly: {
      day: string;
      time: string;
      enabled: boolean;
    };
  };
  created_at: string;
  updated_at: string;
}

export async function getReportRecipients(): Promise<ReportRecipient[]> {
  const { data, error } = await supabase
    .from('report_recipients')
    .select('*')
    .order('email');
  
  if (error) {
    console.error("Error fetching report recipients:", error);
    throw error;
  }
  
  return data || [];
}

export async function addReportRecipient(email: string): Promise<ReportRecipient> {
  const { data, error } = await supabase
    .from('report_recipients')
    .insert({ email })
    .select()
    .single();
  
  if (error) {
    console.error("Error adding report recipient:", error);
    throw error;
  }
  
  return data;
}

export async function removeReportRecipient(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('report_recipients')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error removing report recipient:", error);
    throw error;
  }
  
  return true;
}

export async function getReportSchedule(): Promise<ReportSchedule | null> {
  const { data, error } = await supabase
    .from('report_schedule')
    .select('*')
    .maybeSingle();
  
  if (error) {
    console.error("Error fetching report schedule:", error);
    throw error;
  }
  
  return data;
}

export async function updateReportSchedule(settings: any): Promise<ReportSchedule> {
  // Check if a schedule exists
  const existingSchedule = await getReportSchedule();
  
  if (existingSchedule) {
    // Update existing schedule
    const { data, error } = await supabase
      .from('report_schedule')
      .update({ settings })
      .eq('id', existingSchedule.id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating report schedule:", error);
      throw error;
    }
    
    return data;
  } else {
    // Create a new schedule
    const { data, error } = await supabase
      .from('report_schedule')
      .insert({ settings })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating report schedule:", error);
      throw error;
    }
    
    return data;
  }
}

// This function would typically be implemented in an edge function 
// for actual email sending, but we'll define the interface here
export async function sendReportEmail(
  recipients: string[], 
  subject: string, 
  message: string, 
  attachmentType?: 'pdf' | 'excel'
): Promise<boolean> {
  console.log(`Sending report email to ${recipients.join(', ')}`);
  console.log(`Subject: ${subject}`);
  console.log(`Message: ${message}`);
  console.log(`Attachment type: ${attachmentType || 'none'}`);
  
  // In a real implementation, this would call an edge function
  // to send the email with the generated report
  
  return true;
}
