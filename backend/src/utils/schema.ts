import { z } from '@hono/zod-openapi'
import type { ZodRawShape } from 'zod'

export const Response = <T extends ZodRawShape>(schema: z.ZodObject<T>) => ({
  200: {
    content: {
      'application/json': {
        schema,
      },
    },
    description: 'Retrieve information',
  },
})
