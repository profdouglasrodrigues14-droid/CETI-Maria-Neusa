import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://sbwtvvtyjtzouokugrxb.supabase.co";

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNid3R2dnR5anR6b3Vva3VncnhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDQ3NDgsImV4cCI6MjA5ODEyMDc0OH0.GbUEMQIylmGhlYcjWynCGmGkQWMhSgsqWBXl8rBzOxU";

export const supabase = createClient(
    supabaseUrl,
    supabaseKey
);
