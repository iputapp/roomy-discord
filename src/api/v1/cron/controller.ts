import type { Context } from "hono";
import { apiSuccessHandler } from "~/handler";
import type { Bindings } from "~/types";
import { CronService } from "./service";

export namespace CronController {
  export async function handleCron(c: Context<{ Bindings: Bindings }>) {
    await CronService.processCronJob(c.env);
    return apiSuccessHandler(
      {
        success: true,
        message: "Cron job processed",
        timestamp: new Date().toISOString(),
      },
      c,
    );
  }
}
