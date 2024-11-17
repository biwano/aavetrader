import { createRoute, z } from "@hono/zod-openapi";
import app from "../app.js";
import blockchain from "../utils/blockchain/blockchain.js";
import CONTRACTS from "../utils/blockchain/contracts.js";
import { Response } from "../utils/schema.js";

const InfoSchema = z
  .object({
    address: z.string(),
    balances: z.object({
      SUSD: z.number(),
      BTC_LONG: z.number(),
      BTC_SHORT: z.number(),
    }),
  })
  .openapi("Info");

const route = createRoute({
  method: "get",
  path: "/info",
  responses: Response(InfoSchema),
});

app.openapi(route, async (c) => {
  const [SusdBalance, BtcLongBalance, BtcShortBalance] = await Promise.all([
    CONTRACTS.SUSD.getBalance(),
    CONTRACTS.BTC_LONG.getBalance(),
    CONTRACTS.BTC_SHORT.getBalance(),
  ]);
  return c.json({
    address: blockchain().account.address,
    balances: {
      SUSD: SusdBalance,
      BTC_LONG: BtcLongBalance,
      BTC_SHORT: BtcShortBalance,
    },
  });
});
