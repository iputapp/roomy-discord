import type { Bindings } from "~/types";

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
