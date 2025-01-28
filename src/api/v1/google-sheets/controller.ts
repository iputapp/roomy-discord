import type { Context } from "hono";
import { parseEnv } from "~/constants";
import { APIError, apiErrorHandler, apiSuccessHandler } from "~/handler";
import type { Bindings } from "~/types";
import { isValidRequest } from "~/utils/auth";
import { GoogleSheetsService } from "./service";

export namespace GoogleSheetsController {
  export async function getRoom(c: Context<{ Bindings: Bindings }>) {
    const { node } = parseEnv(c.env);

    try {
      /** @todo 外部から保護する */
      if (node.env === "production") {
        if (!isValidRequest(c)) {
          throw new APIError("Invalid request", 401);
        }
      }

      const { googleSheets } = parseEnv(c.env);
      const message = await GoogleSheetsService.getRoomInfo(googleSheets);
      return apiSuccessHandler({ message }, c);
    } catch (err) {
      console.error(err);
      return apiErrorHandler(err, c);
    }
  }
}
