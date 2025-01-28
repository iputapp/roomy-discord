import type { APIApplicationCommand, APIMessage } from "discord-api-types/v10";

export interface DiscordMessage extends Pick<APIMessage, "content"> {}

export interface DiscordCommand
  extends Pick<
    APIApplicationCommand,
    "name" | "description" | "type" | "options"
  > {}
