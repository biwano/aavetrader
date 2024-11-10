import { createRoute } from '@hono/zod-openapi'
import { z } from '@hono/zod-openapi'
import app from '../app.js'


const ParamsSchema = z.object({
    id: z
      .string()
      .min(3)
      .openapi({
        param: {
          name: 'id',
          in: 'path',
        },
        example: '1212121',
      }),
  })
  
const QuerySchema = z.object({
    n: z.coerce
    .number()
    .openapi({
    param: {
        name: 'n',
        in: 'path',
    },
    example: 1,
    }),
})


const UserSchema = z
.object({
    id: z.string().openapi({
    example: '123',
    }),
    name: z.string().openapi({
    example: 'John Doe',
    }),
    age: z.number().openapi({
    example: 42,
    }),
})
.openapi('User')
  
  
   
const route = createRoute({
  method: 'get',
  path: '/users/{id}',
  request: {
    params: ParamsSchema,
    query:QuerySchema,

  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
      description: 'Retrieve the user',
    },
  },
})


app.openapi(route, (c) => {
    const { id } = c.req.valid('param')
    const { n } = c.req.valid('query')
    console.info(typeof n)
    return c.json({
      id,
      age: 20,
      name: 'Ultra-man',
    })
  })