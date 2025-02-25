import { type InferOutput, object, optional, picklist } from "valibot";

const period = ["today", "week"] as const;

export type Period = (typeof period)[number];

export const QueryParamsSchema = object({
  period: optional(picklist(period)),
});

export type QueryParamsSchemaType = InferOutput<typeof QueryParamsSchema>;
