// Ebriza ChangeStatusUrl. Auth + parsing: src/lib/ebriza-webhook.ts.
import { ebrizaWebhookRoute } from "@/lib/ebriza-webhook";
import { handleChangeStatus } from "@/lib/ebriza-webhook-handlers";

export const POST = ebrizaWebhookRoute("change-status", handleChangeStatus);
