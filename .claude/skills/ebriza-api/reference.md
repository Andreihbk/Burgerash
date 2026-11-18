# Ebriza API reference (distilled from the official docs; verify against the docs if in doubt)

Base URL: https://api.ebriza.com  - HTTPS only.

## Auth
Apps are created in Ebriza Marketplace (Ebriza reviews them). You get an app ID (public key) and secret.
- Token: `POST /token` with HTTP Basic auth (user = public key, password = secret),
  `Content-Type: application/x-www-form-urlencoded`.
- Response: `access_token`, `expires_in` (seconds), `token_type: bearer`.
- Token lives 30 minutes and can be revoked: on 401, get a new one.
- Headers on calls: `Authorization: bearer <token>`, `ebriza-clientid: <location client id>`,
  `Content-Type: application/json`.
- `ebriza-clientid` = the app installed by an Ebriza account on a location (or company, for Global apps).

## Push an order (the main call)
`POST /bills/openbillwithclient` - NO token needed, only `ebriza-clientid`.
Optional header `ebriza-appname: <your app name>` -> POS shows your app name/icon (otherwise the order is
created under Ebriza's default Web Ordering app).
Body: `{ "bill": BillRequest, "client": ClientRequest }`

BillRequest (key fields):
- `items[]`: `{ sku | id, quantity, lock?, isMod?, note?, type? }`
- `externalOrderNo` (string, shown in POS) and `externalOrderID` (our ID) - send both (error 0676 if externalOrderNo is missing)
- `isForPickup` (bool), `note`, `payments[]`, `preparationTime`, `deliveryDate`
- `useProviderIntegration` (bool): for orders delivered by your OWN couriers; POS hands the order to the courier
  and closes it automatically when the fiscal receipt is printed. Delivery orders only (not pickup). Needs a real test.
- `usePreferentialPrice` (default true)
- No tableID/roomName = treated as a delivery order (needs a POS user that handles deliveries, else error 0099).
Prices come from the POS catalogue (matched by sku or id). Unmatched products: error 0104 unless the app may create items.

Modifiers: the product line and its extras share the same `lock` GUID; extras have `isMod: true`.
```
{ "sku":"brg-classic","lock":"<guid>","quantity":1 }
{ "sku":"extra-cheddar","lock":"<guid>","isMod":true,"quantity":1 }
```

System lines (name/price/sku you send are IGNORED; amounts go in quantity):
- `{ "type": 1000, "quantity": <tip amount> }`            Tips
- `{ "type": 1002, "quantity": <delivery fee amount> }`   DeliveryFee
- `{ "type": 1003, "quantity": <number of sets> }`        Cutlery
- `{ "type": 1001, "lock": "<product lock>", "quantity": n }` BottleDeposit

payments[]: `{ "type": <OrderPaymentType>, "value": <number>, "units?", "details?" }`
OrderPaymentType: 0 CashOnDelivery, 1 Cash, 2 CreditCard, 3 BankTransfer, 4 Protocol, 5 CashWithInvoiceReceipt,
6 MealTickets, 7 FiscalProtocol, 8 CashNotFiscal, 9 Other, 10 CreditCardOnDelivery

ClientRequest: `{ firstName, lastName, phone, email?, address?: { street, city, county, country, details?, isDeliveryAddress }, adressNeedsValidation? }`
(note the doc's spelling `adressNeedsValidation`). At least phone OR email is required; first+last name required together;
delivery address needs street, city, county, country.

## Other endpoints (all need token + ebriza-clientid)
- `GET /bills/get/{id}` - bill details; `GET /bills/getExternal?externalOrderID=..&externalOrderNo=..`
- `POST /bills/update` `{ id, items[] }`; `POST /bills/cancel` `{ id }`
- `GET /items?locationID=&sku=&name=&includeProducts=true` - list POS products
- `GET /orders/get/{id}`, `GET /orders?...` - closed (paid) bills
- `GET /tables`, `GET /users?pos=true` - rooms/tables, POS users
- Bills are open orders; an "order" is a paid/closed bill. A POS user must close/print.

## Webhooks
- `POST /webHooks/subscribe` `{ callbackUrl, entity }`, `POST /webHooks/unsubscribe` `{ entity }`, `GET /webHooks`
- entity: 0 Order, 1 Bill, 2 Room, 100 Invoice
- Callback body: `{ id, ebrizaClientID, entity }` only. No signature is documented.
  Subscriptions are per app + client; you are notified only for resources created by your app.

## BillStatus
0 New, 1 Error, 10 Accepted, 11 Canceled, 15 MovedOnLocation, 20 InPreparation, 21 PreparationFinished,
29 NonFiscalReceiptPrinted, 30 FiscalReceiptPrinted, 31 FiscalReceiptRePrinted, 90 PickedUp,
100 SentToFleetApp, 110 SentToFleetAppFailed, 120 InDelivery, 130 DeliveryFinished

## HTTP errors
400 validation (see code), 401 new token needed, 403 API claim not approved, 404 not found,
412 `ebriza-clientid` missing, 5xx Ebriza side.

## Error codes that matter for Burgerash
0002 required field - 0099 no delivery user - 0100 item not found (need id or sku) - 0103 new item needs name+price+vat -
0104 SKU not found and saving new items not allowed - 0105 item missing id/sku/name - 0106 item not available for this location -
0109 product VAT not set in Ebriza - 0110 need phone/email/company - 0111 first+last name required -
0114-0117 address city/country/county/street required - 0664 clientid header missing - 0665 token expired/missing -
0668 app not installed - 0669 API claim not approved by the client - 0671 app not installed on location -
0673 resource locked, retry in a few seconds - 0674 too many requests (limits in response headers) -
0675 invalid request object - 0676 missing externalOrderNo - 0101 no bill found with this id

## Open questions (confirm with Ebriza / real test)
- Does an API order appear automatically on the POS tablet; who accepts it?
- With useProviderIntegration, who updates statuses 100-130 for our own riders?
- Is there a staging/test location?
