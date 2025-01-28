import { Hono } from "hono";
import type { Bindings } from "~/types";
import { cronRoutes } from "./cron";
import { discordRoutes } from "./discord";
import { googleRoutes } from "./google";

const v1 = new Hono<{ Bindings: Bindings }>();

v1.route("/v1", googleRoutes);
v1.route("/v1", discordRoutes);
v1.route("/v1", cronRoutes);

export default v1;
