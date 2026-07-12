# Dodo billing setup

1. In Dodo test mode, create monthly subscription products priced at **$149 USD** (Starter) and **$499 USD** (Scale).
2. Copy their product IDs into `DODO_STARTER_PRODUCT_ID` and `DODO_SCALE_PRODUCT_ID`. Decide integer included-credit grants and set `DODO_STARTER_CREDITS`, `DODO_SCALE_CREDITS`, and `RUN_CREDIT_COST`.
3. Set `DODO_API_KEY`, `DODO_WEBHOOK_KEY`, `DODO_RETURN_URL`, and `BILLING_ENABLED=true` on the backend only. Never expose these values through Vite/frontend environment variables.
4. Configure the webhook URL as `/v1/billing/webhooks/dodo` and subscribe to `subscription.active`, `subscription.renewed`, `subscription.cancelled`, and `payment.failed`.
5. Exercise Dodo's test checkout and webhook tools. Confirm duplicate deliveries do not duplicate grants, successful runs consume reservations, and failed runs release them before switching `DODO_ENVIRONMENT=live_mode`.

## MVP limitations

Billing accounts are currently identified by normalized email and the credit ledger is in memory. This is suitable only for local/MVP validation: production requires authenticated workspace identity, tenant authorization, and durable transactional persistence for subscriptions, grants, reservations, and webhook IDs. Failed runs release their reservation; a later usage policy may charge consumed browser time.
