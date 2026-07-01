import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://sbwtvvtyjtzouokugrxb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNid3R2dnR5anR6b3Vva3VncnhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDQ3NDgsImV4cCI6MjA5ODEyMDc0OH0.GbUEMQIylmG";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Funções auxiliares para cache local com fallback
const CACHE_PREFIX = "ceti_cache_";
const CACHE_TIME = 5 * 60 * 1000; // 5 minutos

export async function fetchWithCache(table, key, fetchFn) {
  const cacheKey = `${CACHE_PREFIX}${table}_${key}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TIME) {
      return data;
    }
  }

  try {
    const data = await fetchFn();
    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
    return data;
  } catch (error) {
    console.error(`Erro ao buscar ${table}:`, error);
    if (cached) {
      const { data } = JSON.parse(cached);
      console.log("Usando dados em cache");
      return data;
    }
    throw error;
  }
}

export function clearCache(table) {
  const prefix = `${CACHE_PREFIX}${table}_`;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      localStorage.removeItem(key);
    }
  }
}
