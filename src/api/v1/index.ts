import { Hono } from "hono";
import type { Bindings } from "~/types";
import { cronRoutes } from "./cron";
import { discordRoutes } from "./discord";
import { googleSheetsRoutes } from "./google-sheets";

const v1 = new Hono<{ Bindings: Bindings }>();

v1.route("/v1", googleSheetsRoutes);
v1.route("/v1", discordRoutes);
v1.route("/v1", cronRoutes);

export default v1;
