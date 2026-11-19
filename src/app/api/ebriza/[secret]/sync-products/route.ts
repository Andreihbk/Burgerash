// Ebriza SyncProductsUrl (ack + log only). Auth + parsing: src/lib/ebriza-webhook.ts.
import { ebrizaWebhookRoute } from "@/lib/ebriza-webhook";
import { handleSyncProducts } from "@/lib/ebriza-webhook-handlers";

export const POST = ebrizaWebhookRoute("sync-products", handleSyncProducts);
