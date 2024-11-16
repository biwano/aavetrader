import app from '../app.js'
import { swaggerUI } from '@hono/swagger-ui'

app.get('/ui', swaggerUI({ url: '/openapi.json' }))
