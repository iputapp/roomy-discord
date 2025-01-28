import { Hono } from "hono";
import type { Bindings } from "~/types";
import { GoogleSheetsController } from "./controller";

const router = new Hono<{ Bindings: Bindings }>();

router.get("/sheets/room/today", GoogleSheetsController.getRoom);

export default router;
