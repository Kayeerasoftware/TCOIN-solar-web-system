[Auth (7)](#Auth)[Public (3)](#Public)[CRM (11)](#CRM)[Catalog (7)](#Catalog)[Sizing and design (8)](#Sizing_and_design)[Quotes (9)](#Quotes)[Orders (8)](#Orders)[Inventory (11)](#Inventory)[Projects (10)](#Projects)[Field sync (3)](#Field_sync)[Maintenance (11)](#Maintenance)[Consultancy (4)](#Consultancy)[Billing (10)](#Billing)[Platform (7)](#Platform)[TCOIN documents (29)](#TCOIN_documents)[Webhooks (2)](#Webhooks)[Schemas](#schemas)

# TCOIN SOLAR UG: API Reference

TCOIN SOLAR UG Platform API v1.0.0. 140 operations, 68 schemas. Generated from openapi.yaml. Base path `/api/v1`. Conventions: JSON, UTC timestamps, cursor pagination, RFC 9457 errors, Idempotency-Key on payments, orders and invoices, ETag with If-Match on quotes, designs and projects.

## Auth

POST`/auth/login`public

Sign in with email or phone and password

Body: application/json. Responses: 200, 401, 429

POST`/auth/refresh`public

Rotate the refresh token and obtain a new access token

Body: application/json. Responses: 200, 401

POST`/auth/logout`

Revoke the current session

Responses: 204

POST`/auth/otp/request`public

Send a one-time code to a customer's phone

Body: application/json. Responses: 202, 429

POST`/auth/otp/verify`public

Verify a one-time code

Body: application/json. Responses: 200, 401

POST`/auth/mfa/verify`public

Complete a staff MFA challenge

Body: application/json. Responses: 200, 401

GET`/me`

Current user, roles, and permissions

Responses: 200

## Public

POST`/public/leads`public

Submit a lead from the website (bot protected, rate limited)

Body: LeadCreate. Responses: 201, 422, 429

POST`/public/sizing/estimate`public

Indicative estimate for the public calculator

Body: IndicativeRequest. Responses: 200, 422

GET`/public/services`public

Service descriptions and consultation services

Responses: 200

## CRM

GET`/customers`

List customers

Params: Limit, Cursor, q. Responses: 200

POST`/customers`

Create a customer

Body: CustomerCreate. Responses: 201, 409, 422

GET`/customers/{id}`

Customer 360 view

Params: Id. Responses: 200, 404

PATCH`/customers/{id}`

Update a customer

Params: Id. Body: CustomerCreate. Responses: 200

GET`/leads`

List leads

Params: Limit, Cursor, status, assigned_to, sort. Responses: 200

POST`/leads`

Create a lead (staff entry)

Body: LeadCreate. Responses: 201

GET`/leads/{id}`

Get a lead

Params: Id. Responses: 200, 404

PATCH`/leads/{id}`

Update status, assignment, or details

Params: Id. Body: application/json. Responses: 200

POST`/leads/{id}/convert`

Convert a lead into a customer and opportunity

Params: Id. Responses: 201

GET`/opportunities`

List opportunities

Params: Limit, Cursor, stage. Responses: 200

POST`/activities`

Log a call, visit, note, or task

Body: application/json. Responses: 201

## Catalog

GET`/catalog/products`public

Search and filter products

Params: Limit, Cursor, q, category, product_type, brand, min_price, max_price, in_stock. Responses: 200

POST`/catalog/products`

Create a product (staff)

Body: Product. Responses: 201

GET`/catalog/products/{id}`public

Product with variants, specs, and datasheets

Params: Id. Responses: 200, 404

PATCH`/catalog/products/{id}`

Update a product (staff)

Params: Id. Body: Product. Responses: 200

GET`/catalog/categories`public

Category tree

Responses: 200

POST`/catalog/imports`

Bulk import products or prices from CSV or XLSX

Body: multipart/form-data. Responses: 202

GET`/price-lists`

List price lists

Responses: 200

## Sizing and design

POST`/sizing/calculate`

Full sizing calculation (engineer tool)

Runs the sizing engine. Warnings are returned in the body; invalid input returns 422.

Body: SizingRequest. Responses: 200, 422

GET`/site-surveys`

List site surveys

Params: Limit, Cursor. Responses: 200

POST`/site-surveys`

Create or submit a site survey (idempotent by client_uuid)

Body: SiteSurvey. Responses: 201

GET`/designs`

List system designs

Params: Limit, Cursor, customer_id. Responses: 200

POST`/designs`

Create a design from survey, energy profile, and equipment choices

Body: DesignCreate. Responses: 201

GET`/designs/{id}`

Get a design

Params: Id. Responses: 200

PATCH`/designs/{id}`

Override values (reason required) or change status

Params: Id, IfMatch. Body: application/json. Responses: 200, 412

GET`/designs/{id}/bom`

Bill of materials mapped to catalog SKUs with price and availability

Params: Id. Responses: 200

## Quotes

GET`/quotes`

List quotes

Params: Limit, Cursor, status, customer_id. Responses: 200

POST`/quotes`

Create a quote, optionally from a design

Body: application/json. Responses: 201

GET`/quotes/{id}`

Get a quote with the current version

Params: Id. Responses: 200, 404

GET`/quotes/{id}/versions`

List versions

Params: Id. Responses: 200

POST`/quotes/{id}/versions`

Create a new version (copy of current, or supplied lines)

Params: Id, IfMatch. Body: QuoteVersionInput. Responses: 201, 412

POST`/quotes/{id}/submit-approval`

Request approval when a discount exceeds the role limit

Params: Id. Responses: 202

POST`/quotes/{id}/send`

Freeze the current version, render the PDF, and send a secure link

Params: Id. Body: application/json. Responses: 200, 409

POST`/quotes/{id}/accept`

Customer accepts the quote

In one transaction: locks the quote, creates the deposit invoice, creates the project from the template, and reserves BOM stock. Events are written to the outbox.

Params: Id, IdempotencyKey. Body: application/json. Responses: 200, 409

GET`/quotes/{id}/pdf`

Download the PDF of a version

Params: Id, version. Responses: 200

## Orders

GET`/cart`

Current cart

Responses: 200

PUT`/cart`

Replace cart items

Body: application/json. Responses: 200

GET`/orders`

List orders

Params: Limit, Cursor, status. Responses: 200

POST`/orders`

Place an order from the cart (checkout)

Params: IdempotencyKey. Body: application/json. Responses: 201, 409

GET`/orders/{id}`

Order with shipments

Params: Id. Responses: 200

POST`/orders/{id}/cancel`

Cancel an unshipped order

Params: Id. Responses: 200, 409

POST`/orders/{id}/shipments`

Create a shipment (fulfilment)

Params: Id. Body: application/json. Responses: 201

POST`/returns`

Request a return

Body: application/json. Responses: 201

## Inventory

GET`/warehouses`

List warehouses and vehicle stores

Responses: 200

GET`/stock`

Stock by variant and location with reserved and available

Params: Limit, Cursor, warehouse_id, low_stock. Responses: 200

GET`/stock/movements`

Ledger of movements

Params: Limit, Cursor, variant_id. Responses: 200

POST`/stock/movements`

Post a stock movement (issue, adjustment, return)

Append-only. Corrections are new movements. Adjustments require \`inventory.approve_adjustment\`.

Body: StockMovementCreate. Responses: 201, 409

POST`/stock/transfers`

Transfer between locations (creates paired movements)

Body: application/json. Responses: 201

GET`/serial-units/{serial}`

Look up a serial number with its status, asset, customer, and warranty

Params: serial. Responses: 200, 404

GET`/suppliers`

List suppliers

Responses: 200

GET`/purchase-orders`

List purchase orders

Params: Limit, Cursor, status. Responses: 200

POST`/purchase-orders`

Create a purchase order

Body: PurchaseOrderCreate. Responses: 201

POST`/purchase-orders/{id}/approve`

Approve a PO (approver must differ from creator)

Params: Id. Responses: 200, 403

POST`/purchase-orders/{id}/receive`

Receive goods against a PO with serial numbers and landed cost

Params: Id. Body: application/json. Responses: 201, 422

## Projects

GET`/projects`

List projects

Params: Limit, Cursor, status, manager_id. Responses: 200

GET`/projects/{id}`

Project dashboard data (progress, budget, margin, milestones)

Params: Id. Responses: 200

PATCH`/projects/{id}`

Update status, dates, or manager

Params: Id, IfMatch. Body: Project. Responses: 200, 412

GET`/projects/{id}/milestones`

Milestones

Params: Id. Responses: 200

GET`/projects/{id}/tasks`

Tasks

Params: Id. Responses: 200

POST`/projects/{id}/tasks`

Create a task

Params: Id. Body: Task. Responses: 201

PUT`/projects/{id}/commissioning`

Record commissioning readings and sign-off

Params: Id. Body: Commissioning. Responses: 200, 422

POST`/projects/{id}/handover`

Generate the handover pack and create assets and warranties

Requires commissioning sign-off and all mandatory checklist items passed.

Params: Id. Responses: 201, 409

GET`/schedule`

Calendar of crew assignments

Params: from, to, crew_id. Responses: 200

POST`/schedule`

Assign a crew to a project or task (rejects overlaps)

Body: application/json. Responses: 201, 409

## Field sync

GET`/sync/pull`

Pull records changed since a cursor (technician PWA)

Returns jobs, tasks, checklists, reference data, and tombstones assigned to the caller.

Params: cursor, limit, device_id. Responses: 200

POST`/sync/push`

Push queued mutations (idempotent by client_uuid)

Conflict rules: server wins for status and assignment; notes, photos, readings, and parts used are append-only and merged. Each mutation returns \`applied\`, \`duplicate\`, or \`rejected\` with a reason.

Body: SyncPush. Responses: 200

POST`/uploads/sign`

Get a signed URL to upload a file directly to object storage (resumable)

Body: application/json. Responses: 200

## Maintenance

GET`/assets`

Installed systems and components

Params: Limit, Cursor, customer_id, serial. Responses: 200

GET`/assets/{id}/warranties`

Warranties for an asset with effective status

Params: Id. Responses: 200

GET`/service-contracts`

List service contracts

Params: Limit, Cursor. Responses: 200

POST`/service-contracts`

Create a service contract and its preventive schedule

Body: ServiceContractCreate. Responses: 201

GET`/tickets`

List tickets

Params: Limit, Cursor, status, priority, sla_breached. Responses: 200

POST`/tickets`

Open a ticket

Body: TicketCreate. Responses: 201

GET`/tickets/{id}`

Ticket thread

Params: Id. Responses: 200

PATCH`/tickets/{id}`

Triage, assign, or change status

Params: Id. Body: application/json. Responses: 200

GET`/work-orders`

List work orders

Params: Limit, Cursor, assigned_to. Responses: 200

POST`/work-orders`

Create a work order from a ticket or schedule

Body: WorkOrder. Responses: 201

POST`/work-orders/{id}/complete`

Complete with visit report, parts used, and customer signature

Params: Id. Body: application/json. Responses: 200, 409

## Consultancy

GET`/consultation-services`public

Consultancy service catalog

Responses: 200

GET`/availability`public

Open slots for a service

Params: service_id, from, to. Responses: 200

POST`/bookings`

Book a consultation (creates a payable invoice)

Params: IdempotencyKey. Body: application/json. Responses: 201, 409

POST`/engagements/{id}/deliverables`

Attach and deliver a report to the customer portal

Params: Id. Body: application/json. Responses: 201

## Billing

GET`/invoices`

List invoices with balance and payment state

Params: Limit, Cursor, customer_id, payment_state. Responses: 200

POST`/invoices`

Create an invoice (manual or from a source record)

Params: IdempotencyKey. Body: InvoiceCreate. Responses: 201

GET`/invoices/{id}`

Get an invoice

Params: Id. Responses: 200

POST`/invoices/{id}/issue`

Issue the invoice (assigns the gapless number, submits e-invoice where required)

Params: Id. Responses: 200, 409

POST`/invoices/{id}/pay`

Start an online payment (card or mobile money)

Returns a hosted checkout URL or triggers a mobile money prompt. Final status arrives by webhook.

Params: Id, IdempotencyKey. Body: PayRequest. Responses: 202, 409

GET`/payments`

List confirmed payments

Params: Limit, Cursor. Responses: 200

POST`/payments`

Record an offline payment (cash, bank transfer, cheque) and allocate it

Params: IdempotencyKey. Body: application/json. Responses: 201

GET`/payments/reconciliation`

Gateway settlement versus recorded payments for a date

Params: date. Responses: 200

POST`/payment-plans`

Create an instalment plan for an invoice

Body: application/json. Responses: 201

POST`/credit-notes`

Raise a credit note (requires billing.refund to approve)

Body: application/json. Responses: 201

## Platform

GET`/documents`

List documents for a record

Params: owner_type, owner_id. Responses: 200

GET`/documents/{id}/download`

Short-lived signed download URL

Params: Id. Responses: 200

GET`/notifications`

In-app notifications for the current user

Params: Limit, Cursor. Responses: 200

GET`/settings/{key}`

Read a setting

Params: key. Responses: 200

PUT`/settings/{key}`

Change a setting (admin.settings)

Params: key. Body: application/json. Responses: 200

GET`/audit-log`

Query the audit trail

Params: Limit, Cursor, table_name, row_id, actor_id. Responses: 200

GET`/reports/{name}`

Run a named report

Names: \`pipeline\`, \`conversion_by_source\`, \`quote_win_rate\`, \`project_status\`, \`project_margin\`, \`stock_turnover\`, \`reorder_alerts\`, \`receivables_ageing\`, \`revenue_by_service\`, \`ticket_sla\`, \`warranty_expiry\`, \`contract_renewals\`.

Params: name, from, to, format. Responses: 200

## TCOIN documents

GET`/company-profile`public

Company profile, contacts, tagline, and brand colours (public)

Responses: 200

GET`/documents/templates`

List document templates and their active versions

Responses: 200

GET`/documents/verify/{code}`public

Public verification of an issued document from its QR code

Returns document type, number, date, amount, and status only. No personal data.

Params: code. Responses: 200, 404

GET`/amount-in-words`

Amount in words for a value and currency

Params: amount, currency. Responses: 200

GET`/signatories`

Authorised signatories

Responses: 200

POST`/quotes/{id}/proforma`

Issue the Proforma Invoice for the current quote version

Assigns the next proforma number (series PI), freezes the version, renders the PDF, and optionally sends it.

Params: Id. Body: ProformaIssue. Responses: 201, 409

GET`/quotes/{id}/proforma/pdf`

Download the Proforma Invoice PDF

Params: Id. Responses: 200

GET`/receipts`

List receipts

Params: Limit, Cursor. Responses: 200

POST`/receipts`

Issue a Cash/Sales Receipt (with item lines) or a Corporate Receipt

Cash sales also decrement stock and record the payment. Corporate receipts link to a payment and invoice and show the balance remaining.

Params: IdempotencyKey. Body: ReceiptCreate. Responses: 201, 422

GET`/receipts/{id}`

Get a receipt

Params: Id. Responses: 200

POST`/receipts/{id}/void`

Void a receipt (requires receipts.void); the number is kept

Params: Id. Body: application/json. Responses: 200

GET`/receipts/{id}/pdf`

Receipt PDF (A4 portrait for cash/sales, landscape for corporate)

Params: Id. Responses: 200

GET`/payment-vouchers`

List payment vouchers

Params: Limit, Cursor, status. Responses: 200

POST`/payment-vouchers`

Prepare a payment voucher

Body: PaymentVoucherCreate. Responses: 201

GET`/payment-vouchers/{id}`

Get a payment voucher

Params: Id. Responses: 200

POST`/payment-vouchers/{id}/submit`

Submit for approval

Params: Id. Responses: 200

POST`/payment-vouchers/{id}/approve`

Approve (approver must differ from preparer; requires vouchers.approve)

Params: Id. Responses: 200, 403

POST`/payment-vouchers/{id}/pay`

Record payment made (bank account, cheque number, method)

Params: Id. Body: application/json. Responses: 200

POST`/payment-vouchers/{id}/receive`

Record the payee's receipt with name, signature, and date

Params: Id. Body: application/json. Responses: 200

GET`/payment-vouchers/{id}/pdf`

Voucher PDF (A5 portrait, original and copy side by side on A4 landscape)

Params: Id. Responses: 200

GET`/delivery-notes`

List delivery notes

Params: Limit, Cursor. Responses: 200

POST`/delivery-notes`

Create a delivery note from an order, project BOM, or manual lines

Body: DeliveryNoteCreate. Responses: 201

POST`/delivery-notes/{id}/issue`

Issue the delivery note (assigns number, prints)

Params: Id. Responses: 200

POST`/delivery-notes/{id}/deliver`

Complete delivery with received-by and delivered-by blocks (idempotent by client_uuid)

Params: Id. Body: DeliveryComplete. Responses: 200

GET`/delivery-notes/{id}/pdf`

Delivery note PDF

Params: Id. Responses: 200

GET`/letters`

List letters

Params: Limit, Cursor. Responses: 200

POST`/letters`

Create a letter (Our Ref assigned on issue)

Body: LetterCreate. Responses: 201

POST`/letters/{id}/issue`

Issue the letter and render the PDF on the full letterhead

Params: Id. Responses: 200

GET`/letters/{id}/pdf`

Letter PDF

Params: Id. Responses: 200

## Webhooks

POST`/webhooks/payments/{provider}`public

Payment aggregator callback

Signature verified with the provider secret. The server re-queries the transaction from the provider, checks amount and currency, and only then records the payment and allocates it. Always returns 200 for valid, already-processed events so the provider stops retrying.

Params: provider, X-Signature. Body: application/json. Responses: 200, 401

POST`/webhooks/messaging/{provider}`public

Delivery receipts and inbound WhatsApp or SMS messages

Params: provider. Body: application/json. Responses: 200

## Schemas

**Problem**

| Field      | Type    | Req. | Note                         |
| ---------- | ------- | ---- | ---------------------------- |
| `type`     | string  | yes  |                              |
| `title`    | string  | yes  |                              |
| `status`   | integer | yes  |                              |
| `code`     | string  | yes  | Stable machine-readable code |
| `detail`   | string  |      |                              |
| `instance` | string  |      |                              |
| `errors`   | array   |      |                              |

**Page**

| Field         | Type   | Req. | Note |
| ------------- | ------ | ---- | ---- |
| `data`        | array  |      |      |
| `next_cursor` | string |      |      |

**Money**

| Field      | Type   | Req. | Note |
| ---------- | ------ | ---- | ---- |
| `amount`   | string | yes  |      |
| `currency` | string | yes  |      |

**AuthResponse**

| Field           | Type    | Req. | Note                              |
| --------------- | ------- | ---- | --------------------------------- |
| `access_token`  | string  |      |                                   |
| `refresh_token` | string  |      |                                   |
| `expires_in`    | integer |      |                                   |
| `mfa_required`  | boolean |      |                                   |
| `mfa_token`     | string  |      | Present when mfa_required is true |

**Me**

| Field         | Type   | Req. | Note |
| ------------- | ------ | ---- | ---- |
| `id`          | string |      |      |
| `full_name`   | string |      |      |
| `user_type`   | string |      |      |
| `customer_id` | string |      |      |
| `roles`       | array  |      |      |
| `permissions` | array  |      |      |

**Customer**

| Field                | Type    | Req. | Note |
| -------------------- | ------- | ---- | ---- |
| `customer_type`      | string  | yes  |      |
| `display_name`       | string  | yes  |      |
| `legal_name`         | string  |      |      |
| `email`              | string  |      |      |
| `phone`              | string  |      |      |
| `tax_id`             | string  |      |      |
| `billing_address`    | object  |      |      |
| `preferred_currency` | string  |      |      |
| `marketing_consent`  | boolean |      |      |
| `id`                 | string  |      |      |
| `customer_no`        | string  |      |      |
| `created_at`         | string  |      |      |

**CustomerCreate**

| Field                | Type    | Req. | Note |
| -------------------- | ------- | ---- | ---- |
| `customer_type`      | string  | yes  |      |
| `display_name`       | string  | yes  |      |
| `legal_name`         | string  |      |      |
| `email`              | string  |      |      |
| `phone`              | string  |      |      |
| `tax_id`             | string  |      |      |
| `billing_address`    | object  |      |      |
| `preferred_currency` | string  |      |      |
| `marketing_consent`  | boolean |      |      |

**LeadStatus**

**LeadCreate**

| Field               | Type    | Req. | Note                         |
| ------------------- | ------- | ---- | ---------------------------- |
| `full_name`         | string  | yes  |                              |
| `email`             | string  |      |                              |
| `phone`             | string  |      |                              |
| `location`          | string  |      |                              |
| `service_interest`  | string  |      |                              |
| `message`           | string  |      |                              |
| `source_code`       | string  |      |                              |
| `campaign`          | string  |      |                              |
| `calculator_input`  | object  |      |                              |
| `calculator_result` | object  |      |                              |
| `consent_marketing` | boolean |      |                              |
| `captcha_token`     | string  |      | Required on public endpoints |

**Lead**

| Field               | Type       | Req. | Note                         |
| ------------------- | ---------- | ---- | ---------------------------- |
| `full_name`         | string     | yes  |                              |
| `email`             | string     |      |                              |
| `phone`             | string     |      |                              |
| `location`          | string     |      |                              |
| `service_interest`  | string     |      |                              |
| `message`           | string     |      |                              |
| `source_code`       | string     |      |                              |
| `campaign`          | string     |      |                              |
| `calculator_input`  | object     |      |                              |
| `calculator_result` | object     |      |                              |
| `consent_marketing` | boolean    |      |                              |
| `captcha_token`     | string     |      | Required on public endpoints |
| `id`                | string     |      |                              |
| `lead_no`           | string     |      |                              |
| `status`            | LeadStatus |      |                              |
| `assigned_to`       | string     |      |                              |
| `created_at`        | string     |      |                              |

**Opportunity**

| Field            | Type    | Req. | Note |
| ---------------- | ------- | ---- | ---- |
| `id`             | string  |      |      |
| `opp_no`         | string  |      |      |
| `customer_id`    | string  |      |      |
| `title`          | string  |      |      |
| `service_line`   | string  |      |      |
| `stage`          | string  |      |      |
| `expected_value` | Money   |      |      |
| `probability`    | integer |      |      |
| `owner_id`       | string  |      |      |

**ProductType**

**Category**

| Field      | Type   | Req. | Note |
| ---------- | ------ | ---- | ---- |
| `id`       | string |      |      |
| `slug`     | string |      |      |
| `name`     | string |      |      |
| `children` | array  |      |      |

**Product**

| Field             | Type        | Req. | Note                                                            |
| ----------------- | ----------- | ---- | --------------------------------------------------------------- |
| `id`              | string      |      |                                                                 |
| `category_id`     | string      |      |                                                                 |
| `product_type`    | ProductType |      |                                                                 |
| `brand`           | string      |      |                                                                 |
| `model`           | string      |      |                                                                 |
| `name`            | string      |      |                                                                 |
| `slug`            | string      |      |                                                                 |
| `description`     | string      |      |                                                                 |
| `specs`           | object      |      | Technical attributes, e.g. {"pmax_w":550,"voc":49.9,"isc":13.9} |
| `warranty_months` | integer     |      |                                                                 |
| `is_serialised`   | boolean     |      |                                                                 |
| `variants`        | array       |      |                                                                 |

**Variant**

| Field           | Type   | Req. | Note |
| --------------- | ------ | ---- | ---- |
| `id`            | string |      |      |
| `sku`           | string |      |      |
| `name`          | string |      |      |
| `unit`          | string |      |      |
| `price`         | Money  |      |      |
| `available_qty` | number |      |      |

**ConsultationService**

| Field          | Type    | Req. | Note |
| -------------- | ------- | ---- | ---- |
| `id`           | string  |      |      |
| `code`         | string  |      |      |
| `name`         | string  |      |      |
| `description`  | string  |      |      |
| `duration_min` | integer |      |      |
| `price`        | Money   |      |      |

**Appliance**

| Field             | Type    | Req. | Note |
| ----------------- | ------- | ---- | ---- |
| `name`            | string  | yes  |      |
| `watts`           | number  | yes  |      |
| `quantity`        | integer | yes  |      |
| `hoursPerDay`     | number  | yes  |      |
| `surgeMultiplier` | number  |      |      |
| `runsAtNight`     | boolean |      |      |

**IndicativeRequest**

| Field          | Type   | Req. | Note                    |
| -------------- | ------ | ---- | ----------------------- |
| `monthly_kwh`  | number |      |                         |
| `monthly_bill` | Money  |      |                         |
| `appliances`   | array  |      |                         |
| `system_type`  | string | yes  |                         |
| `location`     | string | yes  | District or coordinates |

**IndicativeResult**

| Field              | Type    | Req. | Note |
| ------------------ | ------- | ---- | ---- |
| `dailyWh`          | number  |      |      |
| `arrayKwp`         | number  |      |      |
| `panels`           | integer |      |      |
| `batteryKwh`       | number  |      |      |
| `inverterKw`       | number  |      |      |
| `priceLow`         | number  |      |      |
| `priceHigh`        | number  |      |      |
| `annualSavings`    | number  |      |      |
| `paybackYearsLow`  | number  |      |      |
| `paybackYearsHigh` | number  |      |      |
| `disclaimer`       | string  |      |      |

**SizingRequest**

| Field                  | Type   | Req. | Note |
| ---------------------- | ------ | ---- | ---- |
| `appliances`           | array  | yes  |      |
| `site`                 | object | yes  |      |
| `system_type`          | string | yes  |      |
| `autonomy_days`        | number |      |      |
| `panel_variant_id`     | string | yes  |      |
| `inverter_variant_ids` | array  | yes  |      |
| `battery_variant_id`   | string |      |      |
| `cable_runs`           | object |      |      |
| `parameter_overrides`  | object |      |      |

**SizingResult**

See sizing-engine/types.ts (SizingResult). Includes energy, array, battery, inverter, strings, cables, protection, bom, financials, warnings.

**SiteSurvey**

| Field             | Type   | Req. | Note |
| ----------------- | ------ | ---- | ---- |
| `id`              | string |      |      |
| `client_uuid`     | string |      |      |
| `customer_id`     | string | yes  |      |
| `site_id`         | string |      |      |
| `roof_type`       | string |      |      |
| `roof_area_m2`    | number |      |      |
| `tilt_deg`        | number |      |      |
| `azimuth_deg`     | number |      |      |
| `shading_pct`     | number |      |      |
| `structure_notes` | string |      |      |
| `electrical`      | object |      |      |
| `measurements`    | object |      |      |

**DesignCreate**

| Field         | Type          | Req. | Note |
| ------------- | ------------- | ---- | ---- |
| `customer_id` | string        | yes  |      |
| `survey_id`   | string        |      |      |
| `profile_id`  | string        |      |      |
| `sizing`      | SizingRequest | yes  |      |

**Design**

| Field            | Type         | Req. | Note |
| ---------------- | ------------ | ---- | ---- |
| `id`             | string       |      |      |
| `design_no`      | string       |      |      |
| `status`         | string       |      |      |
| `system_type`    | string       |      |      |
| `engine_version` | string       |      |      |
| `inputs`         | object       |      |      |
| `results`        | SizingResult |      |      |
| `warnings`       | array        |      |      |
| `overrides`      | object       |      |      |

**LineItem**

Standard line-item columns used by quotes, BOM, stock, and purchase orders (the TCOIN proforma columns).

| Field               | Type    | Req. | Note                               |
| ------------------- | ------- | ---- | ---------------------------------- |
| `line_no`           | integer |      | No.                                |
| `particulars`       | string  | yes  | Particulars                        |
| `specification`     | string  |      | Size / Specification               |
| `image_document_id` | string  |      | Image                              |
| `image_url`         | string  |      | Short-lived signed URL for display |
| `quantity`          | number  | yes  | Quantity                           |
| `unit`              | string  |      | Unit                               |
| `rate`              | string  | yes  | Rate (UGX)                         |
| `amount`            | string  |      | Amount (UGX), quantity x rate      |

**BomItem**

| Field               | Type    | Req. | Note                               |
| ------------------- | ------- | ---- | ---------------------------------- |
| `line_no`           | integer |      | No.                                |
| `particulars`       | string  | yes  | Particulars                        |
| `specification`     | string  |      | Size / Specification               |
| `image_document_id` | string  |      | Image                              |
| `image_url`         | string  |      | Short-lived signed URL for display |
| `quantity`          | number  | yes  | Quantity                           |
| `unit`              | string  |      | Unit                               |
| `rate`              | string  | yes  | Rate (UGX)                         |
| `amount`            | string  |      | Amount (UGX), quantity x rate      |
| `role`              | string  |      |                                    |
| `variant_id`        | string  |      |                                    |
| `sku`               | string  |      |                                    |
| `available_qty`     | number  |      |                                    |

**QuoteStatus**

**Quote**

| Field             | Type         | Req. | Note |
| ----------------- | ------------ | ---- | ---- |
| `id`              | string       |      |      |
| `quote_no`        | string       |      |      |
| `customer_id`     | string       |      |      |
| `status`          | QuoteStatus  |      |      |
| `current_version` | integer      |      |      |
| `currency`        | string       |      |      |
| `valid_until`     | string       |      |      |
| `version`         | QuoteVersion |      |      |

**QuoteVersionInput**

| Field           | Type   | Req. | Note |
| --------------- | ------ | ---- | ---- |
| `lines`         | array  |      |      |
| `terms`         | string |      |      |
| `payment_terms` | array  |      |      |
| `valid_until`   | string |      |      |

**QuoteVersion**

| Field             | Type    | Req. | Note |
| ----------------- | ------- | ---- | ---- |
| `version_no`      | integer |      |      |
| `subtotal`        | Money   |      |      |
| `discount_amount` | Money   |      |      |
| `tax_amount`      | Money   |      |      |
| `total`           | Money   |      |      |
| `margin_pct`      | number  |      |      |
| `sent_at`         | string  |      |      |
| `lines`           | array   |      |      |

**QuoteLine**

| Field               | Type    | Req. | Note                               |
| ------------------- | ------- | ---- | ---------------------------------- |
| `line_no`           | integer |      | No.                                |
| `particulars`       | string  | yes  | Particulars                        |
| `specification`     | string  |      | Size / Specification               |
| `image_document_id` | string  |      | Image                              |
| `image_url`         | string  |      | Short-lived signed URL for display |
| `quantity`          | number  | yes  | Quantity                           |
| `unit`              | string  |      | Unit                               |
| `rate`              | string  | yes  | Rate (UGX)                         |
| `amount`            | string  |      | Amount (UGX), quantity x rate      |
| `variant_id`        | string  |      |                                    |
| `discount_pct`      | number  |      |                                    |
| `tax_rate`          | number  |      |                                    |

**Cart**

| Field      | Type   | Req. | Note |
| ---------- | ------ | ---- | ---- |
| `id`       | string |      |      |
| `currency` | string |      |      |
| `items`    | array  |      |      |
| `subtotal` | Money  |      |      |

**Order**

| Field        | Type   | Req. | Note |
| ------------ | ------ | ---- | ---- |
| `id`         | string |      |      |
| `order_no`   | string |      |      |
| `status`     | string |      |      |
| `total`      | Money  |      |      |
| `invoice_id` | string |      |      |
| `placed_at`  | string |      |      |

**StockLevel**

| Field               | Type    | Req. | Note                               |
| ------------------- | ------- | ---- | ---------------------------------- |
| `line_no`           | integer |      | No.                                |
| `particulars`       | string  | yes  | Particulars                        |
| `specification`     | string  |      | Size / Specification               |
| `image_document_id` | string  |      | Image                              |
| `image_url`         | string  |      | Short-lived signed URL for display |
| `quantity`          | number  | yes  | Quantity                           |
| `unit`              | string  |      | Unit                               |
| `rate`              | string  | yes  | Rate (UGX)                         |
| `amount`            | string  |      | Amount (UGX), quantity x rate      |
| `variant_id`        | string  |      |                                    |
| `sku`               | string  |      |                                    |
| `warehouse_id`      | string  |      |                                    |
| `reserved`          | number  |      |                                    |
| `available`         | number  |      |                                    |
| `reorder_level`     | number  |      |                                    |

**StockMovementCreate**

| Field            | Type   | Req. | Note                           |
| ---------------- | ------ | ---- | ------------------------------ |
| `variant_id`     | string | yes  |                                |
| `warehouse_id`   | string | yes  |                                |
| `movement_type`  | string | yes  |                                |
| `quantity`       | number | yes  | Signed delta; must not be zero |
| `serial_numbers` | array  |      |                                |
| `ref_type`       | string |      |                                |
| `ref_id`         | string |      |                                |
| `reason`         | string |      |                                |

**PurchaseOrderCreate**

| Field           | Type   | Req. | Note |
| --------------- | ------ | ---- | ---- |
| `supplier_id`   | string | yes  |      |
| `currency`      | string | yes  |      |
| `expected_date` | string |      |      |
| `project_id`    | string |      |      |
| `lines`         | array  | yes  |      |

**Project**

| Field            | Type   | Req. | Note |
| ---------------- | ------ | ---- | ---- |
| `id`             | string |      |      |
| `project_no`     | string |      |      |
| `name`           | string |      |      |
| `customer_id`    | string |      |      |
| `status`         | string |      |      |
| `manager_id`     | string |      |      |
| `start_planned`  | string |      |      |
| `end_planned`    | string |      |      |
| `progress_pct`   | number |      |      |
| `contract_value` | Money  |      |      |
| `actual_cost`    | Money  |      |      |
| `margin_pct`     | number |      |      |

**Milestone**

| Field             | Type    | Req. | Note |
| ----------------- | ------- | ---- | ---- |
| `id`              | string  |      |      |
| `seq`             | integer |      |      |
| `name`            | string  |      |      |
| `due_date`        | string  |      |      |
| `status`          | string  |      |      |
| `billing_percent` | number  |      |      |
| `invoice_id`      | string  |      |      |

**Task**

| Field         | Type   | Req. | Note |
| ------------- | ------ | ---- | ---- |
| `id`          | string |      |      |
| `client_uuid` | string |      |      |
| `title`       | string |      |      |
| `status`      | string |      |      |
| `assigned_to` | string |      |      |
| `due_date`    | string |      |      |

**Commissioning**

| Field                            | Type   | Req. | Note |
| -------------------------------- | ------ | ---- | ---- |
| `voc_v`                          | number |      |      |
| `isc_a`                          | number |      |      |
| `insulation_mohm`                | number |      |      |
| `earth_ohm`                      | number |      |      |
| `inverter_settings`              | object |      |      |
| `first_day_kwh`                  | number |      |      |
| `customer_signature_document_id` | string |      |      |

**SyncPull**

| Field      | Type    | Req. | Note                            |
| ---------- | ------- | ---- | ------------------------------- |
| `cursor`   | integer |      | Store and send on the next pull |
| `has_more` | boolean |      |                                 |
| `changes`  | object  |      |                                 |
| `deleted`  | array   |      |                                 |

**SyncPush**

| Field       | Type   | Req. | Note |
| ----------- | ------ | ---- | ---- |
| `device_id` | string | yes  |      |
| `mutations` | array  | yes  |      |

**SyncPushResult**

| Field     | Type  | Req. | Note |
| --------- | ----- | ---- | ---- |
| `results` | array |      |      |

**Asset**

| Field             | Type   | Req. | Note |
| ----------------- | ------ | ---- | ---- |
| `id`              | string |      |      |
| `asset_no`        | string |      |      |
| `asset_type`      | string |      |      |
| `name`            | string |      |      |
| `serial_no`       | string |      |      |
| `installed_at`    | string |      |      |
| `status`          | string |      |      |
| `parent_asset_id` | string |      |      |

**Warranty**

| Field              | Type    | Req. | Note |
| ------------------ | ------- | ---- | ---- |
| `id`               | string  |      |      |
| `coverage_type`    | string  |      |      |
| `starts_on`        | string  |      |      |
| `ends_on`          | string  |      |      |
| `days_remaining`   | integer |      |      |
| `effective_status` | string  |      |      |

**ServiceContractCreate**

| Field                    | Type    | Req. | Note |
| ------------------------ | ------- | ---- | ---- |
| `customer_id`            | string  | yes  |      |
| `plan_name`              | string  | yes  |      |
| `visit_frequency_months` | integer |      |      |
| `starts_on`              | string  | yes  |      |
| `ends_on`                | string  | yes  |      |
| `price`                  | string  | yes  |      |
| `currency`               | string  | yes  |      |
| `sla_response_hours`     | integer |      |      |
| `sla_resolution_hours`   | integer |      |      |
| `auto_renew`             | boolean |      |      |
| `asset_ids`              | array   | yes  |      |

**TicketCreate**

| Field                | Type   | Req. | Note |
| -------------------- | ------ | ---- | ---- |
| `asset_id`           | string |      |      |
| `category`           | string | yes  |      |
| `priority`           | string |      |      |
| `subject`            | string | yes  |      |
| `description`        | string |      |      |
| `photo_document_ids` | array  |      |      |

**Ticket**

| Field                | Type   | Req. | Note |
| -------------------- | ------ | ---- | ---- |
| `asset_id`           | string |      |      |
| `category`           | string | yes  |      |
| `priority`           | string |      |      |
| `subject`            | string | yes  |      |
| `description`        | string |      |      |
| `photo_document_ids` | array  |      |      |
| `id`                 | string |      |      |
| `ticket_no`          | string |      |      |
| `status`             | string |      |      |
| `sla_response_due`   | string |      |      |
| `sla_resolution_due` | string |      |      |

**WorkOrder**

| Field             | Type    | Req. | Note |
| ----------------- | ------- | ---- | ---- |
| `id`              | string  |      |      |
| `wo_no`           | string  |      |      |
| `ticket_id`       | string  |      |      |
| `asset_id`        | string  |      |      |
| `wo_type`         | string  |      |      |
| `status`          | string  |      |      |
| `assigned_to`     | string  |      |      |
| `scheduled_start` | string  |      |      |
| `scheduled_end`   | string  |      |      |
| `covered_by`      | string  |      |      |
| `is_billable`     | boolean |      |      |

**Booking**

| Field        | Type   | Req. | Note |
| ------------ | ------ | ---- | ---- |
| `id`         | string |      |      |
| `booking_no` | string |      |      |
| `service_id` | string |      |      |
| `starts_at`  | string |      |      |
| `ends_at`    | string |      |      |
| `status`     | string |      |      |
| `invoice_id` | string |      |      |

**InvoiceCreate**

| Field         | Type   | Req. | Note |
| ------------- | ------ | ---- | ---- |
| `customer_id` | string | yes  |      |
| `source_type` | string | yes  |      |
| `source_id`   | string |      |      |
| `currency`    | string | yes  |      |
| `due_date`    | string |      |      |
| `lines`       | array  |      |      |

**Invoice**

| Field           | Type   | Req. | Note |
| --------------- | ------ | ---- | ---- |
| `id`            | string |      |      |
| `invoice_no`    | string |      |      |
| `customer_id`   | string |      |      |
| `status`        | string |      |      |
| `payment_state` | string |      |      |
| `issue_date`    | string |      |      |
| `due_date`      | string |      |      |
| `subtotal`      | Money  |      |      |
| `tax_total`     | Money  |      |      |
| `total`         | Money  |      |      |
| `paid`          | Money  |      |      |
| `balance`       | Money  |      |      |
| `fiscal_no`     | string |      |      |

**PayRequest**

| Field        | Type   | Req. | Note                                                                       |
| ------------ | ------ | ---- | -------------------------------------------------------------------------- |
| `method`     | string | yes  |                                                                            |
| `amount`     | string |      | Defaults to the full balance; partial amounts allowed where a plan permits |
| `phone`      | string |      | Required for mobile money                                                  |
| `return_url` | string |      |                                                                            |

**PayResponse**

| Field          | Type   | Req. | Note                                         |
| -------------- | ------ | ---- | -------------------------------------------- |
| `attempt_id`   | string |      |                                              |
| `status`       | string |      |                                              |
| `checkout_url` | string |      |                                              |
| `instructions` | string |      | For example approve the prompt on your phone |

**Document**

| Field        | Type    | Req. | Note |
| ------------ | ------- | ---- | ---- |
| `id`         | string  |      |      |
| `doc_type`   | string  |      |      |
| `title`      | string  |      |      |
| `mime_type`  | string  |      |      |
| `size_bytes` | integer |      |      |
| `visibility` | string  |      |      |
| `created_at` | string  |      |      |

**CompanyProfile**

| Field            | Type   | Req. | Note |
| ---------------- | ------ | ---- | ---- |
| `company`        | string |      |      |
| `legal_name`     | string |      |      |
| `division`       | string |      |      |
| `division_short` | string |      |      |
| `tagline`        | string |      |      |
| `address`        | string |      |      |
| `po_box`         | string |      |      |
| `tel`            | string |      |      |
| `mobile`         | string |      |      |
| `hotlines`       | array  |      |      |
| `email`          | string |      |      |
| `web`            | string |      |      |
| `what_we_do`     | array  |      |      |
| `colours`        | object |      |      |

**DocumentVerification**

| Field      | Type   | Req. | Note |
| ---------- | ------ | ---- | ---- |
| `doc_type` | string |      |      |
| `doc_no`   | string |      |      |
| `doc_date` | string |      |      |
| `amount`   | string |      |      |
| `currency` | string |      |      |
| `status`   | string |      |      |

**ProformaIssue**

| Field             | Type    | Req. | Note                 |
| ----------------- | ------- | ---- | -------------------- |
| `document_title`  | string  |      |                      |
| `bill_to_text`    | string  |      |                      |
| `validity_days`   | integer |      |                      |
| `show_images`     | boolean |      |                      |
| `show_eoe`        | boolean |      |                      |
| `signatory_id`    | string  |      |                      |
| `amount_in_words` | string  |      | Generated if omitted |
| `send_via`        | array   |      |                      |

**ProformaResult**

| Field             | Type   | Req. | Note |
| ----------------- | ------ | ---- | ---- |
| `proforma_no`     | string |      |      |
| `issued_on`       | string |      |      |
| `valid_until`     | string |      |      |
| `document_id`     | string |      |      |
| `total`           | Money  |      |      |
| `amount_in_words` | string |      |      |

**ReceiptCreate**

| Field                   | Type   | Req. | Note                        |
| ----------------------- | ------ | ---- | --------------------------- |
| `receipt_type`          | string | yes  |                             |
| `customer_id`           | string |      |                             |
| `received_from`         | string | yes  |                             |
| `received_from_address` | string |      |                             |
| `amount`                | string | yes  |                             |
| `currency`              | string | yes  |                             |
| `method`                | string | yes  |                             |
| `cheque_no`             | string |      |                             |
| `payment_for`           | string |      | Being payment of            |
| `invoice_id`            | string |      |                             |
| `quote_id`              | string |      |                             |
| `warehouse_id`          | string |      | Stock source for cash sales |
| `signatory_id`          | string |      |                             |
| `lines`                 | array  |      | Required for cash_sales     |

**Receipt**

| Field                   | Type   | Req. | Note                        |
| ----------------------- | ------ | ---- | --------------------------- |
| `receipt_type`          | string | yes  |                             |
| `customer_id`           | string |      |                             |
| `received_from`         | string | yes  |                             |
| `received_from_address` | string |      |                             |
| `amount`                | string | yes  |                             |
| `currency`              | string | yes  |                             |
| `method`                | string | yes  |                             |
| `cheque_no`             | string |      |                             |
| `payment_for`           | string |      | Being payment of            |
| `invoice_id`            | string |      |                             |
| `quote_id`              | string |      |                             |
| `warehouse_id`          | string |      | Stock source for cash sales |
| `signatory_id`          | string |      |                             |
| `lines`                 | array  |      | Required for cash_sales     |
| `id`                    | string |      |                             |
| `receipt_no`            | string |      |                             |
| `receipt_date`          | string |      |                             |
| `amount_in_words`       | string |      |                             |
| `balance_after`         | string |      |                             |
| `status`                | string |      |                             |
| `verify_code`           | string |      |                             |
| `document_id`           | string |      |                             |

**PaymentVoucherCreate**

| Field                | Type   | Req. | Note |
| -------------------- | ------ | ---- | ---- |
| `pay_to`             | string | yes  |      |
| `supplier_id`        | string |      |      |
| `payee_type`         | string |      |      |
| `currency`           | string |      |      |
| `method`             | string |      |      |
| `bank_account`       | string |      |      |
| `cheque_no`          | string |      |      |
| `withholding_amount` | string |      |      |
| `ref_type`           | string |      |      |
| `ref_id`             | string |      |      |
| `lines`              | array  | yes  |      |

**PaymentVoucher**

| Field                | Type   | Req. | Note |
| -------------------- | ------ | ---- | ---- |
| `pay_to`             | string | yes  |      |
| `supplier_id`        | string |      |      |
| `payee_type`         | string |      |      |
| `currency`           | string |      |      |
| `method`             | string |      |      |
| `bank_account`       | string |      |      |
| `cheque_no`          | string |      |      |
| `withholding_amount` | string |      |      |
| `ref_type`           | string |      |      |
| `ref_id`             | string |      |      |
| `lines`              | array  | yes  |      |
| `id`                 | string |      |      |
| `voucher_no`         | string |      |      |
| `voucher_date`       | string |      |      |
| `amount`             | string |      |      |
| `amount_in_words`    | string |      |      |
| `status`             | string |      |      |
| `prepared_by`        | string |      |      |
| `approved_by`        | string |      |      |
| `received_by_name`   | string |      |      |

**DeliveryNoteCreate**

| Field                | Type   | Req. | Note |
| -------------------- | ------ | ---- | ---- |
| `order_id`           | string |      |      |
| `project_id`         | string |      |      |
| `customer_id`        | string |      |      |
| `deliver_to_name`    | string | yes  |      |
| `deliver_to_address` | string |      |      |
| `contact_info`       | string |      |      |
| `lines`              | array  | yes  |      |

**DeliveryNote**

| Field                | Type   | Req. | Note |
| -------------------- | ------ | ---- | ---- |
| `order_id`           | string |      |      |
| `project_id`         | string |      |      |
| `customer_id`        | string |      |      |
| `deliver_to_name`    | string | yes  |      |
| `deliver_to_address` | string |      |      |
| `contact_info`       | string |      |      |
| `lines`              | array  | yes  |      |
| `id`                 | string |      |      |
| `dn_no`              | string |      |      |
| `dn_date`            | string |      |      |
| `status`             | string |      |      |

**DeliveryComplete**

| Field                             | Type   | Req. | Note |
| --------------------------------- | ------ | ---- | ---- |
| `client_uuid`                     | string | yes  |      |
| `received_by_name`                | string | yes  |      |
| `received_signature_document_id`  | string |      |      |
| `delivered_by_name`               | string | yes  |      |
| `delivered_signature_document_id` | string |      |      |
| `line_conditions`                 | array  |      |      |

**LetterCreate**

| Field           | Type   | Req. | Note                  |
| --------------- | ------ | ---- | --------------------- |
| `customer_id`   | string |      |                       |
| `addressee`     | string | yes  |                       |
| `your_ref`      | string |      |                       |
| `subject`       | string |      |                       |
| `body`          | string | yes  | Rich text or markdown |
| `template_code` | string |      |                       |
| `signatory_id`  | string |      |                       |

**Letter**

| Field           | Type   | Req. | Note                  |
| --------------- | ------ | ---- | --------------------- |
| `customer_id`   | string |      |                       |
| `addressee`     | string | yes  |                       |
| `your_ref`      | string |      |                       |
| `subject`       | string |      |                       |
| `body`          | string | yes  | Rich text or markdown |
| `template_code` | string |      |                       |
| `signatory_id`  | string |      |                       |
| `id`            | string |      |                       |
| `our_ref`       | string |      |                       |
| `letter_date`   | string |      |                       |
| `status`        | string |      |                       |
