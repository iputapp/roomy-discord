export interface Bindings {
  NODE_ENV: "development" | "staging" | "production" | "test";
  API_ENDPOINT_URL: string;
  API_ENDPOINT_SECRET: string;
  DISCORD_TOKEN: string;
  DISCORD_APPLICATION_ID: string;
  DISCORD_PUBLIC_KEY: string;
  DISCORD_CHANNEL_ID: string;
  GOOGLE_CLIENT_EMAIL: string;
  GOOGLE_PRIVATE_KEY: string;
  SPREADSHEET_ID: string;
}
