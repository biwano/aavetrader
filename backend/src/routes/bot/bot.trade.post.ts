import { zBodyValidator } from "@hono-dev/zod-body-validator";
import { createRoute, z } from "@hono/zod-openapi";
import { getBot, updateBot } from "src/utils/bots.js";
import { trade } from "src/utils/tlx.js";
import app from "../../app.js";
import { schemaToResponse } from "../../utils/schema.js";

const TradeSchema = z
  .object({
    result: z.string(),
  })
  .openapi("Trade");

const BodySchema = z.object({
  direction: z.number().optional(),
});
type Body = z.infer<typeof BodySchema>;

const route = createRoute({
  method: "post",
  path: "/bot/:name/trade",
  responses: schemaToResponse(TradeSchema),
  middleware: zBodyValidator(BodySchema),
});

app.openapi(route, async (c) => {
  const name = c.req.param("name");
  const body = await c.req.json<Body>();

  if (Object.keys(body).length) {
    await updateBot(name, body);
  }

  const bot = await getBot(name);

  await trade(bot.direction);

  return c.json({
    result: "ok",
  });
});
