import type { APIInteractionResponse } from "discord-api-types/v10";
import { InteractionResponseType } from "discord-api-types/v10";
import type { ResponseHeader } from "hono/utils/headers";

export { InteractionResponseType };

export function discordInteractionHandler(
  data?: APIInteractionResponse,
  options?: {
    headers?: Record<ResponseHeader, string>;
    status?: number;
  },
) {
  const { headers = {}, status = 200 } = options || {};

  return new Response(JSON.stringify(data), {
    headers: {
      ...{ "Content-Type": "application/json" },
      ...headers,
    },
    status: status,
  });
}
