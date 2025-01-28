import { registerCommands } from "~/utils/discord";

registerCommands({
  token: process.env.DISCORD_TOKEN || "",
  applicationId: process.env.DISCORD_APPLICATION_ID || "",
});
