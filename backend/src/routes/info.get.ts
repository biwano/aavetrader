import { createRoute } from '@hono/zod-openapi'
import { z } from '@hono/zod-openapi'
import app from '../app.js'
import { Response } from '../utils/schema.js'
import wallet from '../utils/blockchain.js'
import getBlockchain from '../utils/blockchain.js'
import { getGasPriceInGwei } from '../utils/alchemy.js'

const InfoSchema = z
  .object({
    address: z.string(),
    gasPriceInGwei: z.number(),
  })
  .openapi('Info')

const route = createRoute({
  method: 'get',
  path: '/info',
  responses: Response(InfoSchema),
})

app.openapi(route, async (c) => {
  return c.json({
    address: getBlockchain().wallet.address,
    gasPriceInGwei: await getGasPriceInGwei(),
  })
})
