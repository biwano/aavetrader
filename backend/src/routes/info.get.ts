import { createRoute, z } from "@hono/zod-openapi";
import app from "../app.js";
import { getGasPriceInGwei } from "../utils/alchemy.js";
import blockchain from "../utils/blockchain.js";
import { Response } from "../utils/schema.js";

const InfoSchema = z
  .object({
    address: z.string(),
    gasPriceInGwei: z.number(),
  })
  .openapi("Info");

const route = createRoute({
  method: "get",
  path: "/info",
  responses: Response(InfoSchema),
});

app.openapi(route, async (c) => {
  return c.json({
    address: blockchain().account.address,
    gasPriceInGwei: await getGasPriceInGwei(),
  });
});
