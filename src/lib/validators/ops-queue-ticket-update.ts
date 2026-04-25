import { z } from "zod";

export const opsQueueTicketUpdateSchema = z.object({
  status: z.enum(["OPEN", "ACKED", "IN_PROGRESS", "RESOLVED", "CANCELED"]),
  assigneeUserId: z.string().trim().optional().nullable(),
});

export type OpsQueueTicketUpdateInput = z.infer<typeof opsQueueTicketUpdateSchema>;
