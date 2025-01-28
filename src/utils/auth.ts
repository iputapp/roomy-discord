import type { Context } from "hono";
import type { Bindings } from "~/types";

export function isValidRequest(c: Context<{ Bindings: Bindings }>): boolean {
  return c.req.header("XXX-API-ENDPOINT-SECRET") === c.env.API_ENDPOINT_SECRET;
}
