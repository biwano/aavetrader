import { createRoute } from '@hono/zod-openapi'
import { z } from '@hono/zod-openapi'
import app from '../app.js'

const InfoSchema = z
  .object({
    address: z.string().regex(new RegExp(/^(0x)?[0-9a-fA-F]{40}$/)),
  })
  .openapi('User')

const route = createRoute({
  method: 'get',
  path: '/info',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: InfoSchema,
        },
      },
      description: 'Retrieve information',
    },
  },
})

app.openapi(route, (c) => {
  return c.json({
    address: 'yo',
  })
})
