import { z } from "@hono/zod-openapi";
import type { PostgrestError } from "@supabase/supabase-js";
import { HTTPException } from "hono/http-exception";
import type { StatusCode } from "hono/utils/http-status";
import type { ZodRawShape } from "zod";

export const ResultSchema = z
  .object({
    result: z.string(),
  })
  .openapi("Result");

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

export const makeError = (status: StatusCode, message: string) => {
  return new HTTPException(status, {
    res: new Response(JSON.stringify({ error: message }), {
      status,
    }),
  });
};

export const makeDBError = (error: PostgrestError) => {
  return makeError(
    500,
    `${error.code} ${error.name} ${error.message} ${error.details}`,
  );
};
