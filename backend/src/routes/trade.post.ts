import { zBodyValidator } from "@hono-dev/zod-body-validator";
import { createRoute, z } from "@hono/zod-openapi";
import app from "../app.js";
import { schemaToResponse } from "../utils/schema.js";
import { trade } from "../utils/tlx.js";

const TradeSchema = z
  .object({
    result: z.string(),
  })
  .openapi("Trade");

const BodySchema = z.object({
  direction: z.number(),
});
type Body = z.infer<typeof BodySchema>;

const route = createRoute({
  method: "post",
  path: "/trade",
  responses: schemaToResponse(TradeSchema),
  middleware: zBodyValidator(BodySchema),
});

app.openapi(route, async (c) => {
  const body = await c.req.json<Body>();
  await trade(body.direction);
  return c.json({
    result: "ok",
  });
});
