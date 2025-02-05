import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord-api-types/v10";
import type { Bindings, DiscordCommand } from "~/types";

export const DISCORD_API_BASE_URL = "https://discord.com/api/v10";

export function parseEnv(env: Bindings) {
  return {
    discord: {
      apiBaseUrl: DISCORD_API_BASE_URL,
      token: env.DISCORD_TOKEN || "",
      applicationId: env.DISCORD_APPLICATION_ID || "",
      publicKey: env.DISCORD_PUBLIC_KEY || "",
      channelId: env.DISCORD_CHANNEL_ID || "",
    },
    googleSheets: {
      clientEmail: env.GOOGLE_CLIENT_EMAIL || "",
      privateKey: env.GOOGLE_PRIVATE_KEY || "",
      spreadsheetId: env.SPREADSHEET_ID || "",
      range: "A:E", // 取得する範囲
    },
    node: {
      env: env.NODE_ENV || "production",
    },
  } as const;
}

export type ParsedEnv = ReturnType<typeof parseEnv>;

export const DISCORD_COMMANDS = [
  {
    name: "roomy",
    description: "予約している教室を確認する",
    type: ApplicationCommandType.ChatInput,
    options: [
      {
        name: "today",
        description: "今日の教室",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "help",
        description: "使い方・コマンド一覧",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },
] as const satisfies DiscordCommand[];
