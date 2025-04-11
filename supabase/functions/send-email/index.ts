
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    const { recipients, subject, message, attachmentType, attachmentContent } = await req.json()

    // Validate required fields
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Recipients are required and must be an array' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    if (!subject) {
      return new Response(
        JSON.stringify({ error: 'Subject is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // In a real implementation, this would use an email service like Resend, SendGrid, etc.
    // For demonstration purposes, we'll just log the email details
    console.log('Email details:')
    console.log('Recipients:', recipients)
    console.log('Subject:', subject)
    console.log('Message:', message)
    
    if (attachmentType) {
      console.log('Attachment Type:', attachmentType)
      console.log('Attachment Content Length:', attachmentContent ? attachmentContent.length : 0)
    }

    // In a real implementation, we would return the response from the email service
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        recipients,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )
  }
})
