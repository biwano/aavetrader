import { showRoutes } from 'hono/dev'
import { createApp } from 'honox/server'
import { OpenAPIHono } from '@hono/zod-openapi'

const app = new OpenAPIHono()

showRoutes(app)

export default app
