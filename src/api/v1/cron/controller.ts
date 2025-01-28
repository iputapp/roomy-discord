import type { Context } from "hono";
import { parseEnv } from "~/constants";
import { APIError, apiErrorHandler, apiSuccessHandler } from "~/handler";
import type { Bindings } from "~/types";
import { isValidRequest } from "~/utils/auth";
import { CronService } from "./service";

export namespace CronController {
  export async function handleCron(c: Context<{ Bindings: Bindings }>) {
    const { node } = parseEnv(c.env);

    try {
      /** @todo 外部から保護する */
      if (node.env === "production") {
        if (!isValidRequest(c)) {
          throw new APIError("Invalid request", 401);
        }
      }

      await CronService.processCronJob(c.env);
      return apiSuccessHandler(
        {
          success: true,
          message: "Cron job processed",
          timestamp: new Date().toISOString(),
        },
        c,
      );
    } catch (err) {
      console.error(err);
      return apiErrorHandler(err, c);
    }
  }
}
