import type { Bindings } from "~/types";
import { generateHMAC } from "~/utils/crypto";

export async function callCronEndpoint(props: {
  path: string;
  env: Bindings;
}) {
  const { path, env } = props;

  console.log("Calling cron endpoint:", path, "...");

  try {
    const timestamp = Date.now().toString();
    const apiKey = env.API_ENDPOINT_SECRET || null;

    if (!apiKey) {
      throw new Error('"API_ENDPOINT_SECRET" is not set');
    }

    const payload = timestamp + path;
    const signature = await generateHMAC(payload, apiKey);

    const response = await fetch(`https://your-api-domain.com${path}`, {
      headers: {
        "X-Request-Timestamp": timestamp,
        "X-Signature": signature,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to call cron endpoint: ${response.statusText}`);
    }

    console.log(`Cron executed successfully at ${new Date().toISOString()}`);
  } catch (error) {
    console.error("Cron execution failed:", error);
  }
}
