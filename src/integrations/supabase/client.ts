// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ryiktnbsaqxlegfrrbih.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5aWt0bmJzYXF4bGVnZnJyYmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4ODE3NjAsImV4cCI6MjA1OTQ1Nzc2MH0.D9_cj7PuBTtnr1RzVrGCdcQZElgEDsrJPRSMxEk-OQY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);