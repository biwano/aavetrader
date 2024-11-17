import { createRoute } from "@hono/zod-openapi";
import CONTRACTS from "src/utils/blockchain/contracts.js";
import { getBot } from "src/utils/supabase/bots.js";
import { Logger } from "src/utils/supabase/logs.js";
import app from "../../app.js";
import { ResultSchema, schemaToResponse } from "../../utils/schema.js";

const route = createRoute({
  method: "post",
  path: "/bot/:name/stats",
  responses: schemaToResponse(ResultSchema),
});

app.openapi(route, async (c) => {
  const name = c.req.param("name");
  const bot = await getBot(name);

  const [longValue, shortValue, baseValue] = await Promise.all([
    CONTRACTS.BTC_LONG.getValueinSUSD(CONTRACTS.SUSD),
    CONTRACTS.BTC_SHORT.getValueinSUSD(CONTRACTS.SUSD),
    CONTRACTS.SUSD.getBalance(),
  ]);
  const equity = longValue + shortValue + baseValue;

  new Logger(bot).logs([
    { namespace: "equity", value: equity },
    { namespace: "direction", value: bot.direction },
  ]);

  return c.json({
    result: "ok",
  });
});
