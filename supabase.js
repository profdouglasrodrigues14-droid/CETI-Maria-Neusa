import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://sbwtvvtyjtzouokugrxb.supabase.co";

const supabaseKey = "COLE_AQUI_SUA_ANON_KEY";

export const supabase = createClient(
    supabaseUrl,
    supabaseKey
);
