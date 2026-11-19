---
name: staff-screen
description: Use when building or changing the internal staff apps (/kitchen KDS, /dispatch, /rider, /admin) that read and update orders in real time through Supabase Realtime.
---

# Building a staff screen

First read `supabase/schema.sql` and `src/types/database.ts` for the REAL order status values and columns.
Do not invent statuses; if one is missing, propose a schema change and ask.

## Pattern (all four screens)
1. Page is a Client Component under `src/app/<route>/`. Load initial orders, then subscribe to
   Realtime `postgres_changes` on `orders` (and `order_items` if needed). Unsubscribe on unmount.
2. Keep state in one list keyed by order id; apply INSERT / UPDATE / DELETE events to it.
3. Status changes are explicit button taps that update Supabase (optimistic UI, roll back on error).
4. New order -> visible alert (and sound) on kitchen and dispatch.
5. Show order number (BRG-XXXX), age of the order (live timer), items with modifiers, notes, cutlery, delivery/pickup.
6. Touch-first: large targets, readable at arm's length on a tablet; /rider is phone-first.
7. Brand tokens only (#790D20, #F5E6CC, #332420; Nunito 900 display / Nunito body / Roboto Mono accents). No new colors.
8. Staff screens must keep working if Ebriza is down; never block on Ebriza calls in the UI.
9. Auth: leave a clear TODO guard until Supabase Auth is added (plan task 4.1). Do not ship without it.

## Screens
- /kitchen: 3 columns (new / in preparation / ready), oldest first, one tap to advance.
- /dispatch: ready orders, packing checklist (bags, sauces, cutlery), assign a rider.
- /rider: assigned orders, address + phone buttons, mark picked up / delivered.
- /admin: stock toggles, menu/price edits, opening hours.

## Before finishing
Build + lint. Test with two browser tabs: place an order in one, watch it appear in the other.
