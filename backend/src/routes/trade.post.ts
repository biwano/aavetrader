import { createRoute } from '@hono/zod-openapi'
import { z } from '@hono/zod-openapi'
import app from '../app.js'
import { Response } from '../utils/schema.js'
import wallet from '../utils/blockchain.js'
import getBlockchain from '../utils/blockchain.js'
import { long } from '../utils/tlx.js'

const InfoSchema = z
  .object({
    result: z.string(),
  })
  .openapi('Info')

const route = createRoute({
  method: 'post',
  path: '/trade',
  responses: Response(InfoSchema),
})

app.openapi(route, (c) => {
  long()
  return c.json({
    result: 'ok',
  })
})
