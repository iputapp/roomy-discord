import type { Context } from "hono";
import { parseEnv } from "~/constants";
import { apiSuccessHandler } from "~/handler";
import type { Bindings } from "~/types";
import { GoogleSheetsService } from "./service";

export namespace GoogleSheetsController {
  export async function getRoom(c: Context<{ Bindings: Bindings }>) {
    const { googleSheets } = parseEnv(c.env);
    const message = await GoogleSheetsService.getRoomInfo(googleSheets);
    return apiSuccessHandler({ message }, c);
  }
}
