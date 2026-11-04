import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL;
const key =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = url && key ? createClient(url, key) : null;

// One shared promise also prevents duplicate anonymous accounts in React Strict Mode.
let sessionPromise: Promise<string> | null = null;
export function ensureGuest(): Promise<string> {
  if (!supabase)
    return Promise.reject(new Error("Supabase is not configured."));
  if (!sessionPromise)
    sessionPromise = (async () => {
      const { data, error } = await supabase!.auth.getSession();
      if (error) throw error;
      if (data.session) return data.session.user.id;
      const result = await supabase!.auth.signInAnonymously();
      if (result.error) throw result.error;
      if (!result.data.user)
        throw new Error("Could not start a guest session.");
      return result.data.user.id;
    })().catch((error) => {
      sessionPromise = null;
      throw error;
    });
  return sessionPromise;
}
