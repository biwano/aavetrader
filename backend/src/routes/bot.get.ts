import { createRoute, z } from "@hono/zod-openapi";
import supabase from "src/utils/supabase.js";
import app from "../app.js";
import { makeError, schemaToResponse } from "../utils/schema.js";

const ParamsSchema = z.object({
  name: z.string(),
});

const BotSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    direction: z.number(),
    created_at: z.string(),
  })
  .openapi("Bot");

const route = createRoute({
  method: "get",
  path: "/bot/:name",
  query: {
    params: ParamsSchema,
  },
  responses: schemaToResponse(BotSchema),
});

app.openapi(route, async (c) => {
  const name = c.req.param("name");

  const { data } = await supabase
    .from("bots")
    .select("*")
    .eq("name", name)
    .single();

  if (!data) throw makeError(500, "DB Error");
  return c.json(data);
});
