import { Hono } from "hono";
import api from "~/api";
import { APIError, apiErrorHandler } from "~/handler";
import { authMiddleware } from "~/middleware";
import type { Bindings } from "~/types";

const app = new Hono<{ Bindings: Bindings }>();

app.notFound((c) =>
  apiErrorHandler(new APIError("Not found or Method not allowed", 404), c),
);

app.onError(apiErrorHandler);

app.use("/v1/cron/*", authMiddleware);
app.use("/v1/google/*", authMiddleware);

app.route("/", api);

export default app;
