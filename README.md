# Freebug

## Dodo Payments billing

1. In the Dodo Payments dashboard, create monthly recurring products priced at **$149 USD** (Starter) and **$499 USD** (Scale).
2. Copy their product IDs and test-mode API key into the backend variables shown in `backend/.env.example`. Decide positive included-credit allocations and `RUN_CREDIT_COST`; these values are intentionally not hard-coded product decisions.
3. Register `https://<api-host>/v1/billing/webhooks/dodo` and store its signing key in `DODO_WEBHOOK_KEY`. Subscribe to subscription activation/renewal/cancellation and payment success/failure events.
4. Keep every Dodo key server-side. Run checkout and webhook replay tests in `test_mode`; duplicate period/event IDs do not grant twice.
5. Set `BILLING_ENABLED=true`, then verify plan catalog, checkout, signed webhook, account balance, reservation, completion settlement, failure release, and insufficient-credit `402` behavior before considering live mode.

### Current MVP limitations

Billing identity is a normalized customer email and the ledger is process-local memory. It loses state on restart and cannot safely coordinate multiple instances. Do **not** enable live mode until an authenticated workspace owns each customer and subscriptions, grants, reservations, and webhook event IDs use durable transactional storage. Failed runs currently release their fixed reservation. Refunds, chargebacks, proration, annual plans, top-ups, and a customer portal are out of scope.
