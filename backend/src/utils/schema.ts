import { z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import type { ZodRawShape } from "zod";

export const schemaToResponse = <T extends ZodRawShape>(
  schema: z.ZodObject<T>,
) => ({
  200: {
    content: {
      "application/json": {
        schema,
      },
    },
    description: "Retrieve information",
  },
});

export const makeError = (status: number, message: string) => {
  return new HTTPException(500, {
    res: new Response(JSON.stringify({ error: message }), {
      status,
    }),
  });
};
