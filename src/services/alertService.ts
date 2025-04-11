
import { supabase } from "@/integrations/supabase/client";
import { getProjects } from "@/services/projectService";
import { getSystems } from "@/services/systemService";
import { getSubsystems } from "@/services/subsystemService";
import { getItrs } from "@/services/itrService";
import { getReportRecipients } from "@/services/reportService";

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

export async function checkForDelays(): Promise<Alert[]> {
  const today = new Date();
  const alerts: Alert[] = [];
  
  // Check for delayed projects
  const projects = await getProjects();
  for (const project of projects) {
    if (project.end_date && new Date(project.end_date) < today && project.status !== 'complete') {
      alerts.push({
        id: `project-${project.id}`,
        message: `Project "${project.name}" is delayed (due ${new Date(project.end_date).toLocaleDateString()})`,
        level: 'error',
        timestamp: today.toISOString(),
        entity: 'projects'
      });
    }
  }
  
  // Check for delayed systems
  const systems = await getSystems();
  for (const system of systems) {
    if (system.end_date && new Date(system.end_date) < today) {
      alerts.push({
        id: `system-${system.id}`,
        message: `System "${system.name}" is delayed (due ${new Date(system.end_date).toLocaleDateString()})`,
        level: 'error',
        timestamp: today.toISOString(),
        entity: 'systems'
      });
    }
  }
  
  // Check for delayed subsystems
  const subsystems = await getSubsystems();
  for (const subsystem of subsystems) {
    if (subsystem.end_date && new Date(subsystem.end_date) < today) {
      alerts.push({
        id: `subsystem-${subsystem.id}`,
        message: `Subsystem "${subsystem.name}" is delayed (due ${new Date(subsystem.end_date).toLocaleDateString()})`,
        level: 'error',
        timestamp: today.toISOString(),
        entity: 'subsystems'
      });
    }
  }
  
  // Check for delayed ITRs
  const itrs = await getItrs();
  for (const itr of itrs) {
    if (itr.end_date && new Date(itr.end_date) < today && itr.status !== 'complete') {
      alerts.push({
        id: `itr-${itr.id}`,
        message: `ITR "${itr.name}" is delayed (due ${new Date(itr.end_date).toLocaleDateString()})`,
        level: 'warning',
        timestamp: today.toISOString(),
        entity: 'itrs'
      });
    }
  }
  
  return alerts;
}

export async function sendDelayAlerts(): Promise<boolean> {
  const delays = await checkForDelays();
  
  if (delays.length === 0) {
    console.log("No delays detected, no alerts to send");
    return true;
  }
  
  // Get all recipients
  const recipients = await getReportRecipients();
  
  if (recipients.length === 0) {
    console.log("No recipients configured for alerts");
    return false;
  }
  
  const recipientEmails = recipients.map(r => r.email);
  
  // Format email content
  const subject = `FOSSIL Energy Tracker - ${delays.length} Delays Detected`;
  
  let message = `
    <h1>FOSSIL Energy Tracker - Delay Alerts</h1>
    <p>The following delays have been detected in your projects:</p>
    <ul>
  `;
  
  for (const delay of delays) {
    message += `<li>${delay.message}</li>`;
  }
  
  message += `
    </ul>
    <p>Please log in to the FOSSIL Energy Tracker application to take action.</p>
    <p>This is an automated message, please do not reply.</p>
  `;
  
  // TODO: Implement sending the actual email via an edge function
  console.log(`Would send delay alerts to: ${recipientEmails.join(', ')}`);
  console.log(`Subject: ${subject}`);
  console.log(`Message: ${message}`);
  
  // Log this alert
  const { error } = await supabase
    .from('db_activity_log')
    .insert({
      action: 'SEND_DELAY_ALERTS',
      table_name: 'multiple',
      details: { 
        delay_count: delays.length,
        recipients: recipientEmails
      }
    });
  
  if (error) {
    console.error("Error logging delay alerts:", error);
    throw error;
  }
  
  return true;
}
