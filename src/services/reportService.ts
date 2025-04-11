
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import i18next from "i18next";

interface ReportRecipient {
  id: string;
  email: string;
  created_at: string;
}

interface ReportScheduleSettings {
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
}

interface ReportSchedule {
  id: string;
  settings: ReportScheduleSettings;
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
  
  if (!data) return null;
  
  // Parse the JSON settings string into our expected format
  const settings = typeof data.settings === 'string' 
    ? JSON.parse(data.settings) 
    : data.settings as unknown as ReportScheduleSettings;
    
  return {
    id: data.id,
    created_at: data.created_at,
    updated_at: data.updated_at,
    settings
  };
}

export async function updateReportSchedule(settings: ReportScheduleSettings): Promise<ReportSchedule> {
  // Check if a schedule exists
  const existingSchedule = await getReportSchedule();
  
  // Convert ReportScheduleSettings to a format compatible with Json
  const jsonSettings = settings as unknown as Json;
  
  if (existingSchedule) {
    // Update existing schedule
    const { data, error } = await supabase
      .from('report_schedule')
      .update({ settings: jsonSettings })
      .eq('id', existingSchedule.id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating report schedule:", error);
      throw error;
    }
    
    // Convert back from Json to ReportScheduleSettings
    const updatedSettings = typeof data.settings === 'string' 
      ? JSON.parse(data.settings) 
      : data.settings as unknown as ReportScheduleSettings;
      
    return {
      id: data.id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      settings: updatedSettings
    };
  } else {
    // Create a new schedule
    const { data, error } = await supabase
      .from('report_schedule')
      .insert({ settings: jsonSettings })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating report schedule:", error);
      throw error;
    }
    
    // Convert back from Json to ReportScheduleSettings
    const newSettings = typeof data.settings === 'string' 
      ? JSON.parse(data.settings) 
      : data.settings as unknown as ReportScheduleSettings;
      
    return {
      id: data.id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      settings: newSettings
    };
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
  // Get current language for email templates
  const emailSubject = i18next.t('emails.report.subject');
  const greeting = i18next.t('emails.report.greeting');
  const currentDate = new Date().toLocaleDateString(
    i18next.language === 'es' ? 'es-ES' : 'en-US', 
    { year: 'numeric', month: 'long', day: 'numeric' }
  );
  const intro = i18next.t('emails.report.intro', { date: currentDate });
  const content = i18next.t('emails.report.content');
  const outro = i18next.t('emails.report.outro');
  const footer = i18next.t('emails.report.footer');
  
  const emailBody = `
    ${greeting}
    
    ${intro}
    
    ${content}
    
    ${message}
    
    ${outro}
    
    ${footer}
  `;
  
  console.log(`Sending report email to ${recipients.join(', ')}`);
  console.log(`Subject: ${emailSubject}`);
  console.log(`Message: ${emailBody}`);
  console.log(`Attachment type: ${attachmentType || 'none'}`);
  
  // In a real implementation, this would call an edge function
  // to send the email with the generated report
  
  return true;
}
