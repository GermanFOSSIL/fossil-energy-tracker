
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { task } = await req.json()

    if (!task) {
      return new Response(
        JSON.stringify({ error: 'Task is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Log the task execution
    await supabase
      .from('db_activity_log')
      .insert({
        action: `SCHEDULED_TASK_${task.toUpperCase()}`,
        table_name: 'system',
        details: { task, triggered_at: new Date().toISOString() }
      })

    let result = null

    switch (task) {
      case 'check_delays':
        result = await checkDelays(supabase)
        break
      case 'send_daily_report':
        result = await sendDailyReport(supabase)
        break
      case 'send_weekly_report':
        result = await sendWeeklyReport(supabase)
        break
      case 'send_monthly_report':
        result = await sendMonthlyReport(supabase)
        break
      default:
        return new Response(
          JSON.stringify({ error: `Unknown task: ${task}` }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        task,
        result,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )
  } catch (error) {
    console.error('Error executing scheduled task:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )
  }
})

async function checkDelays(supabase) {
  const today = new Date()
  const alerts = []
  
  // Check for delayed projects
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .lt('end_date', today.toISOString())
    .neq('status', 'complete')
  
  if (projectsError) throw projectsError
  
  for (const project of projects || []) {
    alerts.push({
      entity_type: 'project',
      entity_id: project.id,
      entity_name: project.name,
      due_date: project.end_date
    })
  }
  
  // Check for delayed systems
  const { data: systems, error: systemsError } = await supabase
    .from('systems')
    .select('*')
    .lt('end_date', today.toISOString())
  
  if (systemsError) throw systemsError
  
  for (const system of systems || []) {
    alerts.push({
      entity_type: 'system',
      entity_id: system.id,
      entity_name: system.name,
      due_date: system.end_date
    })
  }
  
  // Check for delayed subsystems
  const { data: subsystems, error: subsystemsError } = await supabase
    .from('subsystems')
    .select('*')
    .lt('end_date', today.toISOString())
  
  if (subsystemsError) throw subsystemsError
  
  for (const subsystem of subsystems || []) {
    alerts.push({
      entity_type: 'subsystem',
      entity_id: subsystem.id,
      entity_name: subsystem.name,
      due_date: subsystem.end_date
    })
  }
  
  // Check for delayed ITRs
  const { data: itrs, error: itrsError } = await supabase
    .from('itrs')
    .select('*')
    .lt('end_date', today.toISOString())
    .neq('status', 'complete')
  
  if (itrsError) throw itrsError
  
  for (const itr of itrs || []) {
    alerts.push({
      entity_type: 'itr',
      entity_id: itr.id,
      entity_name: itr.name,
      due_date: itr.end_date
    })
  }
  
  if (alerts.length === 0) {
    return { message: 'No delays detected', delays: 0 }
  }
  
  // Get all recipients
  const { data: recipients, error: recipientsError } = await supabase
    .from('report_recipients')
    .select('email')
  
  if (recipientsError) throw recipientsError
  
  if (!recipients || recipients.length === 0) {
    return { message: 'No recipients configured for alerts', delays: alerts.length }
  }
  
  const recipientEmails = recipients.map(r => r.email)
  
  // Format email content
  const subject = `FOSSIL Energy Tracker - ${alerts.length} Delays Detected`
  
  let message = `
    <h1>FOSSIL Energy Tracker - Delay Alerts</h1>
    <p>The following delays have been detected in your projects:</p>
    <ul>
  `
  
  for (const alert of alerts) {
    const dueDate = new Date(alert.due_date).toLocaleDateString()
    message += `
      <li>
        ${alert.entity_type.charAt(0).toUpperCase() + alert.entity_type.slice(1)} 
        "${alert.entity_name}" is delayed (due ${dueDate})
      </li>
    `
  }
  
  message += `
    </ul>
    <p>Please log in to the FOSSIL Energy Tracker application to take action.</p>
    <p>This is an automated message, please do not reply.</p>
  `
  
  // Call the send-email function
  const sendEmailUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`
  const sendEmailResponse = await fetch(sendEmailUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
    },
    body: JSON.stringify({
      recipients: recipientEmails,
      subject,
      message
    })
  })
  
  if (!sendEmailResponse.ok) {
    const errorText = await sendEmailResponse.text()
    throw new Error(`Failed to send delay alerts: ${errorText}`)
  }
  
  // Log the alerts
  await supabase
    .from('db_activity_log')
    .insert({
      action: 'SEND_DELAY_ALERTS',
      table_name: 'multiple',
      details: { 
        delay_count: alerts.length,
        recipients: recipientEmails
      }
    })
  
  return { 
    message: 'Delay alerts sent successfully', 
    delays: alerts.length,
    recipients: recipientEmails.length
  }
}

async function sendDailyReport(supabase) {
  // Get report schedule
  const { data: scheduleData, error: scheduleError } = await supabase
    .from('report_schedule')
    .select('*')
    .single()
  
  if (scheduleError) throw scheduleError
  
  if (!scheduleData) {
    return { message: 'No report schedule found' }
  }
  
  const settings = typeof scheduleData.settings === 'string' 
    ? JSON.parse(scheduleData.settings) 
    : scheduleData.settings
  
  if (!settings.daily.enabled) {
    return { message: 'Daily reports are disabled' }
  }
  
  return await generateAndSendReport(supabase, 'daily')
}

async function sendWeeklyReport(supabase) {
  // Get report schedule
  const { data: scheduleData, error: scheduleError } = await supabase
    .from('report_schedule')
    .select('*')
    .single()
  
  if (scheduleError) throw scheduleError
  
  if (!scheduleData) {
    return { message: 'No report schedule found' }
  }
  
  const settings = typeof scheduleData.settings === 'string' 
    ? JSON.parse(scheduleData.settings) 
    : scheduleData.settings
  
  if (!settings.weekly.enabled) {
    return { message: 'Weekly reports are disabled' }
  }
  
  // Check if today is the configured day of the week
  const today = new Date()
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  
  if (dayOfWeek !== settings.weekly.day.toLowerCase()) {
    return { message: `Weekly reports are scheduled for ${settings.weekly.day}, not ${dayOfWeek}` }
  }
  
  return await generateAndSendReport(supabase, 'weekly')
}

async function sendMonthlyReport(supabase) {
  // Get report schedule
  const { data: scheduleData, error: scheduleError } = await supabase
    .from('report_schedule')
    .select('*')
    .single()
  
  if (scheduleError) throw scheduleError
  
  if (!scheduleData) {
    return { message: 'No report schedule found' }
  }
  
  const settings = typeof scheduleData.settings === 'string' 
    ? JSON.parse(scheduleData.settings) 
    : scheduleData.settings
  
  if (!settings.monthly.enabled) {
    return { message: 'Monthly reports are disabled' }
  }
  
  // Check if today is the configured day of the month
  const today = new Date()
  const dayOfMonth = today.getDate().toString()
  
  if (dayOfMonth !== settings.monthly.day) {
    return { message: `Monthly reports are scheduled for day ${settings.monthly.day}, not day ${dayOfMonth}` }
  }
  
  return await generateAndSendReport(supabase, 'monthly')
}

async function generateAndSendReport(supabase, reportType) {
  // Get all recipients
  const { data: recipients, error: recipientsError } = await supabase
    .from('report_recipients')
    .select('email')
  
  if (recipientsError) throw recipientsError
  
  if (!recipients || recipients.length === 0) {
    return { message: 'No recipients configured for reports' }
  }
  
  const recipientEmails = recipients.map(r => r.email)
  
  // Get project data for report
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .order('name')
  
  if (projectsError) throw projectsError
  
  // Get ITR data for report
  const { data: itrs, error: itrsError } = await supabase
    .from('itrs')
    .select('*')
    .order('name')
  
  if (itrsError) throw itrsError
  
  // Format email content
  const subject = `FOSSIL Energy Tracker - ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`
  
  let message = `
    <h1>FOSSIL Energy Tracker - ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h1>
    <p>Report generated on: ${new Date().toLocaleDateString()}</p>
    
    <h2>Project Summary</h2>
    <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse;">
      <tr>
        <th>Project</th>
        <th>Status</th>
        <th>Progress</th>
        <th>Start Date</th>
        <th>End Date</th>
      </tr>
  `
  
  for (const project of projects || []) {
    message += `
      <tr>
        <td>${project.name}</td>
        <td>${project.status}</td>
        <td>${project.progress || 0}%</td>
        <td>${project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}</td>
        <td>${project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}</td>
      </tr>
    `
  }
  
  message += `
    </table>
    
    <h2>ITR Summary</h2>
    <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse;">
      <tr>
        <th>ITR Name</th>
        <th>Status</th>
        <th>Progress</th>
        <th>Start Date</th>
        <th>End Date</th>
      </tr>
  `
  
  for (const itr of itrs || []) {
    message += `
      <tr>
        <td>${itr.name}</td>
        <td>${itr.status}</td>
        <td>${itr.progress || 0}%</td>
        <td>${itr.start_date ? new Date(itr.start_date).toLocaleDateString() : 'N/A'}</td>
        <td>${itr.end_date ? new Date(itr.end_date).toLocaleDateString() : 'N/A'}</td>
      </tr>
    `
  }
  
  message += `
    </table>
    
    <p>Please log in to the FOSSIL Energy Tracker application for more detailed information.</p>
    <p>This is an automated ${reportType} report, please do not reply.</p>
  `
  
  // Call the send-email function
  const sendEmailUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`
  const sendEmailResponse = await fetch(sendEmailUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
    },
    body: JSON.stringify({
      recipients: recipientEmails,
      subject,
      message
    })
  })
  
  if (!sendEmailResponse.ok) {
    const errorText = await sendEmailResponse.text()
    throw new Error(`Failed to send ${reportType} report: ${errorText}`)
  }
  
  // Log the report generation
  await supabase
    .from('db_activity_log')
    .insert({
      action: `SEND_${reportType.toUpperCase()}_REPORT`,
      table_name: 'system',
      details: { 
        projects_count: projects?.length || 0,
        itrs_count: itrs?.length || 0,
        recipients: recipientEmails
      }
    })
  
  return { 
    message: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report sent successfully`, 
    recipients: recipientEmails.length,
    projects_count: projects?.length || 0,
    itrs_count: itrs?.length || 0
  }
}
