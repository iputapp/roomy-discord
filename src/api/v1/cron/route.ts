import { Hono } from "hono";
import type { Bindings } from "~/types";
import { CronController } from "./controller";

const router = new Hono<{ Bindings: Bindings }>();

router.post("/cron", CronController.handleCron);

export default router;
