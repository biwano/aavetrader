import { createRoute } from 'honox/factory'

export default createRoute((c) => {
  return c.json({
    info: {
      title: 'An API',
      version: 'v1',
    },
    openapi: '3.1.0',
  })
})
