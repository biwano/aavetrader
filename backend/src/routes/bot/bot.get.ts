import { createRoute, z } from "@hono/zod-openapi";
import { getBot } from "src/utils/supabase/bots.js";
import app from "../../app.js";
import { schemaToResponse } from "../../utils/schema.js";

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

  return c.json(await getBot(name));
});
