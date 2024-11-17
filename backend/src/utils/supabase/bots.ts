import type { Database } from "src/.generated/database.types.js";
import { makeDBError } from "../schema.js";
import supabase from "./supabase.js";

export type Bot = Database["public"]["Tables"]["bots"]["Row"];

export const getBot = async (name: string): Promise<Bot> => {
  const { data: bot, error } = await supabase
    .from("bots")
    .select("*")
    .eq("name", name)
    .single();
  if (error) throw makeDBError(error);
  return bot;
};

export const updateBot = async (
  name: string,
  body: Partial<Bot>,
): Promise<Bot> => {
  const { data: bot, error } = await supabase
    .from("bots")
    .update(body)
    .eq("name", name)
    .select()
    .single();

  if (error) throw makeDBError(error);
  console.info(bot);
  return bot;
};
