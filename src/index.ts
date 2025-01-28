import { Hono } from "hono";
import api from "~/api";
import type { Bindings } from "~/types";

const app = new Hono<{ Bindings: Bindings }>();

app.route("/", api);

export default app;
