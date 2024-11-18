import dotenv from "dotenv";
dotenv.config();

export const MNEMONIC = process.env.MNEMONIC;
export const ALCHEMY_KEY = process.env.ALCHEMY_KEY;

export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
