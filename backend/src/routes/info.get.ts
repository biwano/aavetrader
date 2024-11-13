import { createRoute } from '@hono/zod-openapi'
import { z } from '@hono/zod-openapi'
import app from '../app.js'
import { Response } from '../utils/schema.js'
import wallet from '../utils/wallet.js'
import getWallet from '../utils/wallet.js'

const InfoSchema = z
  .object({
    address: z.string(),
  })
  .openapi('Info')

const route = createRoute({
  method: 'get',
  path: '/info',
  responses: Response(InfoSchema),
})

app.openapi(route, (c) => {
  return c.json({
    address: getWallet().address,
  })
})
