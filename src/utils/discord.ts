import { DISCORD_API_BASE_URL, DISCORD_COMMANDS } from "~/constants";
import type { DiscordMessage } from "~/types";

export async function sendDiscordMessage(props: {
  token: string;
  channelId: string;
  content: string;
}): Promise<void> {
  const { token, channelId, content } = props;
  const message: DiscordMessage = { content };

  await fetch(`${DISCORD_API_BASE_URL}/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

export async function registerCommands(props: {
  token: string;
  applicationId: string;
}): Promise<void> {
  const { token, applicationId } = props;

  console.log(
    "Registering Discord commands...\n",
    `* token: ${token}\n`,
    `* applicationId: ${applicationId}`,
  );

  try {
    const response = await fetch(
      `${DISCORD_API_BASE_URL}/applications/${applicationId}/commands`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bot ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(DISCORD_COMMANDS),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to register commands: ${JSON.stringify(error)}`);
    }

    console.log("Successfully registered Discord commands");
  } catch (err) {
    console.error("Error registering Discord commands:", err);
    throw err;
  }
}
