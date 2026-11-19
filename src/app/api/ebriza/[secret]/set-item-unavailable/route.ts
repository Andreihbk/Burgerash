// Ebriza SetItemUnavailableUrl (POS product snooze). Auth + parsing: src/lib/ebriza-webhook.ts.
import { ebrizaWebhookRoute } from "@/lib/ebriza-webhook";
import { handleSetItemUnavailable } from "@/lib/ebriza-webhook-handlers";

export const POST = ebrizaWebhookRoute("set-item-unavailable", handleSetItemUnavailable);
