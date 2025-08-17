import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: `./env/.env.dev` }); // para leer tu .env

// ⚠️ Estas variables deben estar en tu .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan las variables SUPABASE_URL o SUPABASE_ANON_KEY en el archivo .env"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
