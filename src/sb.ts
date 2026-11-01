const SUPABASE_URL = "https://tgleohmsmwqlvndxfykv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_vOM4373bRXKYAnUeEdTIDA_5gDXE98F";

export const sb: any =
  typeof window !== "undefined" && (window as any).supabase
    ? (window as any).supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;
