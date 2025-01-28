import { googleSheetsRoutes } from "./sheets";

import { Hono } from "hono";
import type { Bindings } from "~/types";

const google = new Hono<{ Bindings: Bindings }>();

google.route("/google", googleSheetsRoutes);

export default google;
