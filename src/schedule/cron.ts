import type { Bindings } from "~/types";
import { generateHMAC } from "~/utils/crypto";

export async function callCronEndpoint(props: {
  path: string;
  env: Bindings;
}) {
  const { path, env } = props;

  console.log("Calling cron endpoint...", path);

  try {
    const timestamp = Date.now().toString();
    const apiKey = env.API_ENDPOINT_SECRET || null;
    const apiUrl = env.API_ENDPOINT_URL || null;

    if (!apiKey) {
      throw new Error('"API_ENDPOINT_SECRET" is not set');
    }
    if (!apiUrl) {
      throw new Error('"API_ENDPOINT_URL" is not set');
    }

    const url = new URL(path, apiUrl);
    console.log("API URL:", url.href);

    const payload = timestamp + path;
    const signature = await generateHMAC(payload, apiKey);

    const response = await fetch(url.href, {
      method: "POST",
      headers: {
        "X-Request-Timestamp": timestamp,
        "X-Signature": signature,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to call cron endpoint: ${response.statusText}`);
    }

    console.log(await response.json());
    console.log(`Cron executed successfully at ${new Date().toISOString()}`);
  } catch (error) {
    console.error("Cron execution failed:", error);
  }
}
