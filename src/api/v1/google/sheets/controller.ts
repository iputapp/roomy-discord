import type { Context } from "hono";
import { safeParse } from "valibot";
import { parseEnv } from "~/constants";
import { APIError, apiSuccessHandler } from "~/handler";
import type { Bindings } from "~/types";
import { QueryParamsSchema } from "./schema";
import { GoogleSheetsService } from "./service";

export namespace GoogleSheetsController {
  export async function getRoom(c: Context<{ Bindings: Bindings }>) {
    const query = safeParse(QueryParamsSchema, c.req.query());
    if (!query.success) {
      throw new APIError("Invalid query parameters", 400);
    }
    const { googleSheets } = parseEnv(c.env);
    const message = await GoogleSheetsService.getRoomInfo({
      ...googleSheets,
      query: query.output,
    });
    return apiSuccessHandler({ message }, c);
  }
}
