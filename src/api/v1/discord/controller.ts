import type { Context } from "hono";
import { APIError, apiErrorHandler } from "~/handler";
import type { Bindings } from "~/types";
import { DiscordService } from "./service";

export namespace DiscordController {
  export async function handleInteraction(c: Context<{ Bindings: Bindings }>) {
    const signature = c.req.header("X-Signature-Ed25519");
    const timestamp = c.req.header("X-Signature-Timestamp");
    const body = await c.req.text();
    try {
      if (!signature || !timestamp) {
        throw new APIError("Missing signature or timestamp", 401);
      }
      return await DiscordService.handleInteraction({
        body,
        signature,
        timestamp,
        env: c.env,
      });
    } catch (err) {
      console.error(err);
      return apiErrorHandler(err, c);
    }
  }
}
