import crypto from "node:crypto";
import type { Context, Next } from "hono";
import { parseEnv } from "~/constants";
import { APIError } from "~/handler";
import type { Bindings } from "~/types";

const DEFEAULT_TIMESTAMP_TOLERANCE = 5 * 60 * 1000; // 5分(ミリ秒)

async function generateHMAC(payload: string, key: string): Promise<string> {
  const hmac = crypto.createHmac("sha256", key);
  hmac.update(payload);
  return hmac.digest("hex");
}

export async function authMiddleware(
  c: Context<{ Bindings: Bindings }>,
  next: Next,
  options?: { timestampTolerance?: number },
) {
  const { timestampTolerance = DEFEAULT_TIMESTAMP_TOLERANCE } = options || {};

  /**
   * 本番環境以外は認証をスキップ
   */
  const { node } = parseEnv(c.env);
  if (node.env !== "production") return await next();

  const apiEndpointKey = c.env.API_ENDPOINT_SECRET || null;
  if (!apiEndpointKey) {
    throw new APIError(
      'YOU HAVE TO SET ENVIROMENT VARIABLE "API_ENDPOINT_SECRET"',
      500,
      "API_ENDPOINT_SECRET",
    );
  }

  const timestamp = c.req.header("X-Request-Timestamp");
  const signature = c.req.header("X-Signature");
  if (!timestamp || !signature) {
    throw new APIError("Missing authentication headers", 401, "UNAUTHORIZED");
  }

  // タイムスタンプの検証
  const now = Date.now();
  if (now - Number(timestamp) > timestampTolerance) {
    throw new APIError("Timestamp expired", 401, "TIMESTAMP_EXPIRED");
  }

  // 署名の検証
  const payload = timestamp + c.req.path;
  const expectedSignature = await generateHMAC(payload, apiEndpointKey);

  if (signature !== expectedSignature) {
    throw new APIError("Invalid signature", 401, "INVALID_SIGNATURE");
  }

  await next();
}
