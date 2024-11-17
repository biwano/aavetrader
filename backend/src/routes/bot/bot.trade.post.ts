import { zBodyValidator } from "@hono-dev/zod-body-validator";
import { createRoute, z } from "@hono/zod-openapi";
import { Tlx } from "src/utils/blockchain/tlx.js";
import { getBot, updateBot } from "src/utils/supabase/bots.js";
import { Logger } from "src/utils/supabase/logs.js";
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

  let bot = await getBot(name);

  if (Object.keys(body).length) {
    new Logger(bot).info(`Updating bot ${JSON.stringify(body)}`);
    bot = await updateBot(name, body);
  }

  await new Tlx(bot).trade();

  return c.json({
    result: "ok",
  });
});
