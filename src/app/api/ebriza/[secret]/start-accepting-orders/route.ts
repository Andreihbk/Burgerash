// Ebriza StartAcceptingOrdersUrl (POS pause/resume). Auth + parsing: src/lib/ebriza-webhook.ts.
import { ebrizaWebhookRoute } from "@/lib/ebriza-webhook";
import { handleStartAcceptingOrders } from "@/lib/ebriza-webhook-handlers";

export const POST = ebrizaWebhookRoute("start-accepting-orders", handleStartAcceptingOrders);
