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
  const { CONTRACTS, getBalanceAsNumber } = blockchain();
  const [SusdBalance, BtcLongBalance, BtcShortBalance] = await Promise.all([
    getBalanceAsNumber(CONTRACTS.SUSD),
    getBalanceAsNumber(CONTRACTS.BTC_LONG),
    getBalanceAsNumber(CONTRACTS.BTC_SHORT),
  ]);
  return c.json({
    address: blockchain().account.address,
    gasPriceInGwei: await getGasPriceInGwei(),
    balances: {
      SUSD: SusdBalance,
      BTC_LONG: BtcLongBalance,
      BTC_SHORT: BtcShortBalance,
    },
  });
});
