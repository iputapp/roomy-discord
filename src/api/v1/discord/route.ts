import { Hono } from "hono";
import type { Bindings } from "~/types";
import { DiscordController } from "./controller";

const router = new Hono<{ Bindings: Bindings }>();

router.post("/discord/interaction", DiscordController.handleInteraction);

export default router;
