import { createRoute, z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import supabase from "src/utils/supabase.js";
import app from "../app.js";
import { Response } from "../utils/schema.js";

const ParamsSchema = z.object({
  name: z.string(),
});

const ResponseSchema = z
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
  responses: Response(ResponseSchema),
});

app.openapi(route, async (c) => {
  const name = c.req.param("name");

  const { data } = await supabase
    .from("bots")
    .select("*")
    .eq("name", name)
    .single();
  if (!data) throw new HTTPException(500, { message: "DB Error" });
  return c.json(data);
});
