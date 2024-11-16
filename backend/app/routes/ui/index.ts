import { swaggerUI } from '@hono/swagger-ui'
import { createRoute } from 'honox/factory'

export default createRoute(swaggerUI({ url: '/doc' }))
