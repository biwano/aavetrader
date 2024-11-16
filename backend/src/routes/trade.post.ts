import { createRoute, z } from "@hono/zod-openapi";
import app from "../app.js";
import { Response } from "../utils/schema.js";
import { trade } from "../utils/tlx.js";

const InfoSchema = z
  .object({
    result: z.string(),
  })
  .openapi("Info");

const route = createRoute({
  method: "post",
  path: "/trade",
  responses: Response(InfoSchema),
});

app.openapi(route, async (c) => {
  await trade(0.5);
  return c.json({
    result: "ok",
  });
});
