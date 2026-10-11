[Overview](#over)[platform](#platform)[identity](#identity)[crm](#crm)[catalog](#catalog)[inventory](#inventory)[quotes](#quotes)[sales](#sales)[projects](#projects)[maintenance](#maintenance)[consulting](#consulting)[billing](#billing)

# TCOIN SOLAR UG: Entity Relationship Diagrams

Generated from schema.sql: 99 tables in 11 modules, 186 foreign keys, 13 views. Each diagram shows primary keys, foreign keys, and the first three other columns. Tables from other modules appear as key-only stubs. The full column list is in data-dictionary.xlsx.

## Module dependencies (foreign keys between schemas)

```mermaid
flowchart LR
  billing -->|2 FK| catalog
  billing -->|12 FK| identity
  billing -->|8 FK| platform
  catalog -->|2 FK| platform
  consulting -->|3 FK| identity
  consulting -->|2 FK| platform
  crm -->|8 FK| identity
  crm -->|1 FK| platform
  identity -->|1 FK| platform
  inventory -->|6 FK| catalog
  inventory -->|5 FK| identity
  inventory -->|2 FK| platform
  maintenance -->|2 FK| catalog
  maintenance -->|8 FK| identity
  maintenance -->|1 FK| platform
  platform -->|3 FK| identity
  projects -->|7 FK| identity
  projects -->|1 FK| inventory
  projects -->|2 FK| platform
  quotes -->|2 FK| catalog
  quotes -->|10 FK| identity
  quotes -->|2 FK| platform
  sales -->|3 FK| catalog
  sales -->|4 FK| identity
  sales -->|2 FK| platform
```

## platform (16 tables)

currency, exchange_rate, setting, number_sequence, audit_log, outbox_event, idempotency_key, document, document_template, notification_template, notification, sync_device, cms_page, number_series, signatory, letter

```mermaid
erDiagram
  platform_currency {
    char code PK
    text name
    text symbol
    smallint decimals
  }
  platform_exchange_rate {
    uuid id PK
    char base_ccy FK
    char quote_ccy FK
    numeric rate
    date valid_on
    text source
  }
  platform_setting {
    text key PK
    jsonb value
    text description
    uuid updated_by
  }
  platform_number_sequence {
    text prefix PK
    integer year PK
    bigint last_value
  }
  platform_audit_log {
    bigserial id PK
    timestamptz at
    uuid actor_id
    text action
  }
  platform_outbox_event {
    uuid id PK
    text aggregate_type
    uuid aggregate_id
    text event_type
  }
  platform_idempotency_key {
    text scope PK
    text key PK
    text request_hash
    integer status_code
    jsonb response
  }
  platform_document {
    uuid id PK
    text owner_type
    uuid owner_id
    text doc_type
  }
  platform_document_template {
    uuid id PK
    text code
    text name
    text kind
  }
  platform_notification_template {
    uuid id PK
    text code
    text channel
    text locale
  }
  platform_notification {
    uuid id PK
    uuid user_id
    uuid customer_id
    text channel
  }
  platform_sync_device {
    uuid id PK
    uuid user_id
    text device_name
    text user_agent
  }
  platform_cms_page {
    uuid id PK
    text slug
    text title
    text page_type
  }
  platform_number_series {
    text doc_type PK
    text division_code PK
    text prefix
    boolean include_year
    smallint pad
  }
  platform_signatory {
    uuid id PK
    uuid user_id FK
    text display_name
    text job_title
    uuid signature_document_id
  }
  platform_letter {
    uuid id PK
    text division_code
    text our_ref
    text your_ref
    uuid customer_id FK
    uuid signatory_id FK
    uuid issued_by FK
  }
  billing_credit_note {
    uuid id PK
  }
  billing_invoice {
    uuid id PK
  }
  billing_payment {
    uuid id PK
  }
  billing_payment_attempt {
    uuid id PK
  }
  billing_payment_plan {
    uuid id PK
  }
  billing_payment_voucher {
    uuid id PK
  }
  billing_receipt {
    uuid id PK
  }
  catalog_price_list {
    uuid id PK
  }
  catalog_variant {
    uuid id PK
  }
  consulting_booking {
    uuid id PK
  }
  consulting_consultation_service {
    uuid id PK
  }
  crm_opportunity {
    uuid id PK
  }
  identity_customer {
    uuid id PK
  }
  identity_user_account {
    uuid id PK
  }
  inventory_purchase_order {
    uuid id PK
  }
  inventory_supplier {
    uuid id PK
  }
  maintenance_service_contract {
    uuid id PK
  }
  projects_project {
    uuid id PK
  }
  projects_project_cost {
    uuid id PK
  }
  quotes_quote {
    uuid id PK
  }
  sales_cart {
    uuid id PK
  }
  sales_sales_order {
    uuid id PK
  }
  platform_currency ||--o{ platform_exchange_rate : "base_ccy"
  platform_currency ||--o{ platform_exchange_rate : "quote_ccy"
  platform_currency ||--o{ identity_customer : "preferred_currency"
  platform_currency ||--o{ crm_opportunity : "currency"
  platform_currency |o--o{ catalog_variant : "cost_currency"
  platform_currency ||--o{ catalog_price_list : "currency"
  platform_currency |o--o{ inventory_supplier : "currency"
  platform_currency ||--o{ inventory_purchase_order : "currency"
  platform_currency ||--o{ quotes_quote : "currency"
  platform_currency ||--o{ sales_cart : "currency"
  platform_currency ||--o{ sales_sales_order : "currency"
  platform_currency ||--o{ projects_project : "currency"
  platform_currency ||--o{ projects_project_cost : "currency"
  platform_currency ||--o{ maintenance_service_contract : "currency"
  platform_currency ||--o{ consulting_consultation_service : "currency"
  platform_currency ||--o{ consulting_booking : "currency"
  platform_currency ||--o{ billing_invoice : "currency"
  platform_currency ||--o{ billing_payment_attempt : "currency"
  platform_currency ||--o{ billing_payment : "currency"
  platform_currency ||--o{ billing_payment_plan : "currency"
  platform_currency ||--o{ billing_credit_note : "currency"
  identity_user_account ||--o{ platform_signatory : "user_id"
  platform_signatory |o--o{ quotes_quote : "signatory_id"
  platform_currency ||--o{ billing_receipt : "currency"
  platform_signatory |o--o{ billing_receipt : "signatory_id"
  platform_currency ||--o{ billing_payment_voucher : "currency"
  identity_customer |o--o{ platform_letter : "customer_id"
  platform_signatory |o--o{ platform_letter : "signatory_id"
  identity_user_account |o--o{ platform_letter : "issued_by"
```

## identity (8 tables)

organization, customer, contact, user_account, role, permission, role_permission, user_role

```mermaid
erDiagram
  identity_organization {
    uuid id PK
    text code
    text name
    uuid parent_id FK
    text address
  }
  identity_customer {
    uuid id PK
    text customer_no
    text customer_type
    text display_name
    char preferred_currency FK
  }
  identity_contact {
    uuid id PK
    uuid customer_id FK
    text full_name
    citext email
    text phone
  }
  identity_user_account {
    uuid id PK
    text user_type
    citext email
    text phone
    uuid customer_id FK
    uuid contact_id FK
    uuid branch_id FK
  }
  identity_role {
    uuid id PK
    text code
    text name
    text description
  }
  identity_permission {
    uuid id PK
    text code
    text description
  }
  identity_role_permission {
    uuid role_id PK
    uuid permission_id PK
  }
  identity_user_role {
    uuid user_id PK
    uuid role_id PK
  }
  billing_credit_note {
    uuid id PK
  }
  billing_invoice {
    uuid id PK
  }
  billing_payment {
    uuid id PK
  }
  billing_payment_attempt {
    uuid id PK
  }
  billing_payment_plan {
    uuid id PK
  }
  billing_payment_voucher {
    uuid id PK
  }
  billing_receipt {
    uuid id PK
  }
  consulting_booking {
    uuid id PK
  }
  consulting_engagement {
    uuid id PK
  }
  crm_activity {
    uuid id PK
  }
  crm_customer_site {
    uuid id PK
  }
  crm_lead {
    uuid id PK
  }
  crm_opportunity {
    uuid id PK
  }
  inventory_goods_receipt {
    uuid id PK
  }
  inventory_purchase_order {
    uuid id PK
  }
  inventory_stock_movement {
    uuid id PK
  }
  inventory_warehouse {
    uuid id PK
  }
  maintenance_asset {
    uuid id PK
  }
  maintenance_service_contract {
    uuid id PK
  }
  maintenance_ticket {
    uuid id PK
  }
  maintenance_visit_report {
    uuid id PK
  }
  maintenance_work_order {
    uuid id PK
  }
  platform_currency {
    char code PK
  }
  platform_letter {
    uuid id PK
  }
  platform_signatory {
    uuid id PK
  }
  projects_checklist_response {
    uuid id PK
  }
  projects_commissioning_record {
    uuid id PK
  }
  projects_crew {
    uuid id PK
  }
  projects_crew_member {
    uuid crew_id PK
    uuid user_id PK
  }
  projects_project {
    uuid id PK
  }
  projects_task {
    uuid id PK
  }
  quotes_energy_profile {
    uuid id PK
  }
  quotes_quote {
    uuid id PK
  }
  quotes_quote_version {
    uuid id PK
  }
  quotes_site_survey {
    uuid id PK
  }
  quotes_system_design {
    uuid id PK
  }
  sales_cart {
    uuid id PK
  }
  sales_delivery_note {
    uuid id PK
  }
  sales_sales_order {
    uuid id PK
  }
  identity_organization |o--o{ identity_organization : "parent_id"
  platform_currency ||--o{ identity_customer : "preferred_currency"
  identity_customer ||--o{ identity_contact : "customer_id"
  identity_customer |o--o{ identity_user_account : "customer_id"
  identity_contact |o--o{ identity_user_account : "contact_id"
  identity_organization |o--o{ identity_user_account : "branch_id"
  identity_role ||--o{ identity_role_permission : "role_id"
  identity_permission ||--o{ identity_role_permission : "permission_id"
  identity_user_account ||--o{ identity_user_role : "user_id"
  identity_role ||--o{ identity_user_role : "role_id"
  identity_customer ||--o{ crm_customer_site : "customer_id"
  identity_customer |o--o{ crm_lead : "customer_id"
  identity_user_account |o--o{ crm_lead : "assigned_to"
  identity_organization |o--o{ crm_lead : "branch_id"
  identity_customer ||--o{ crm_opportunity : "customer_id"
  identity_user_account |o--o{ crm_opportunity : "owner_id"
  identity_user_account |o--o{ crm_activity : "assigned_to"
  identity_user_account |o--o{ crm_activity : "created_by"
  identity_organization |o--o{ inventory_warehouse : "branch_id"
  identity_user_account |o--o{ inventory_purchase_order : "created_by"
  identity_user_account |o--o{ inventory_purchase_order : "approved_by"
  identity_user_account |o--o{ inventory_goods_receipt : "received_by"
  identity_user_account |o--o{ inventory_stock_movement : "created_by"
  identity_customer ||--o{ quotes_site_survey : "customer_id"
  identity_user_account |o--o{ quotes_site_survey : "surveyor_id"
  identity_customer |o--o{ quotes_energy_profile : "customer_id"
  identity_customer ||--o{ quotes_system_design : "customer_id"
  identity_user_account |o--o{ quotes_system_design : "created_by"
  identity_user_account |o--o{ quotes_system_design : "approved_by"
  identity_customer ||--o{ quotes_quote : "customer_id"
  identity_user_account |o--o{ quotes_quote : "owner_id"
  identity_user_account |o--o{ quotes_quote_version : "discount_approved_by"
  identity_user_account |o--o{ quotes_quote_version : "created_by"
  identity_user_account |o--o{ sales_cart : "user_id"
  identity_customer ||--o{ sales_sales_order : "customer_id"
  identity_customer ||--o{ projects_project : "customer_id"
  identity_user_account |o--o{ projects_project : "manager_id"
  identity_user_account |o--o{ projects_task : "assigned_to"
  identity_user_account |o--o{ projects_crew : "lead_user_id"
  identity_user_account ||--o{ projects_crew_member : "user_id"
  identity_user_account |o--o{ projects_checklist_response : "answered_by"
  identity_user_account |o--o{ projects_commissioning_record : "commissioned_by"
  identity_customer ||--o{ maintenance_asset : "customer_id"
  identity_customer ||--o{ maintenance_service_contract : "customer_id"
  identity_customer ||--o{ maintenance_ticket : "customer_id"
  identity_user_account |o--o{ maintenance_ticket : "assigned_to"
  identity_user_account |o--o{ maintenance_ticket : "opened_by"
  identity_customer ||--o{ maintenance_work_order : "customer_id"
  identity_user_account |o--o{ maintenance_work_order : "assigned_to"
  identity_user_account |o--o{ maintenance_visit_report : "submitted_by"
  identity_customer ||--o{ consulting_booking : "customer_id"
  identity_user_account |o--o{ consulting_booking : "consultant_id"
  identity_customer ||--o{ consulting_engagement : "customer_id"
  identity_customer ||--o{ billing_invoice : "customer_id"
  identity_user_account |o--o{ billing_invoice : "created_by"
  identity_customer ||--o{ billing_payment_attempt : "customer_id"
  identity_customer ||--o{ billing_payment : "customer_id"
  identity_user_account |o--o{ billing_payment : "recorded_by"
  identity_customer ||--o{ billing_payment_plan : "customer_id"
  identity_user_account |o--o{ billing_credit_note : "approved_by"
  identity_user_account |o--o{ billing_credit_note : "created_by"
  identity_user_account ||--o{ platform_signatory : "user_id"
  identity_customer |o--o{ billing_receipt : "customer_id"
  identity_user_account |o--o{ billing_receipt : "issued_by"
  identity_user_account ||--o{ billing_payment_voucher : "prepared_by"
  identity_user_account |o--o{ billing_payment_voucher : "approved_by"
  identity_customer |o--o{ sales_delivery_note : "customer_id"
  identity_user_account |o--o{ sales_delivery_note : "delivered_by_user"
  identity_customer |o--o{ platform_letter : "customer_id"
  identity_user_account |o--o{ platform_letter : "issued_by"
```

## crm (5 tables)

lead_source, customer_site, lead, opportunity, activity

```mermaid
erDiagram
  crm_lead_source {
    uuid id PK
    text code
    text name
  }
  crm_customer_site {
    uuid id PK
    uuid customer_id FK
    text name
    text address_line
    text district
  }
  crm_lead {
    uuid id PK
    text lead_no
    uuid source_id FK
    text campaign
    uuid customer_id FK
    text full_name
    uuid assigned_to FK
    uuid branch_id FK
  }
  crm_opportunity {
    uuid id PK
    text opp_no
    uuid lead_id FK
    uuid customer_id FK
    uuid site_id FK
    text title
    text service_line
    char currency FK
    uuid owner_id FK
  }
  crm_activity {
    uuid id PK
    text subject_type
    uuid subject_id
    text activity_type
    uuid assigned_to FK
    uuid created_by FK
  }
  identity_customer {
    uuid id PK
  }
  identity_organization {
    uuid id PK
  }
  identity_user_account {
    uuid id PK
  }
  platform_currency {
    char code PK
  }
  identity_customer ||--o{ crm_customer_site : "customer_id"
  crm_lead_source |o--o{ crm_lead : "source_id"
  identity_customer |o--o{ crm_lead : "customer_id"
  identity_user_account |o--o{ crm_lead : "assigned_to"
  identity_organization |o--o{ crm_lead : "branch_id"
  crm_lead |o--o{ crm_opportunity : "lead_id"
  identity_customer ||--o{ crm_opportunity : "customer_id"
  crm_customer_site |o--o{ crm_opportunity : "site_id"
  platform_currency ||--o{ crm_opportunity : "currency"
  identity_user_account |o--o{ crm_opportunity : "owner_id"
  identity_user_account |o--o{ crm_activity : "assigned_to"
  identity_user_account |o--o{ crm_activity : "created_by"
```

## catalog (5 tables)

category, product, variant, price_list, price_list_item

```mermaid
erDiagram
  catalog_category {
    uuid id PK
    uuid parent_id FK
    text slug
    text name
    integer sort_order
  }
  catalog_product {
    uuid id PK
    uuid category_id FK
    text product_type
    text brand
    text model
  }
  catalog_variant {
    uuid id PK
    uuid product_id FK
    text sku
    text name
    jsonb attributes
    char cost_currency FK
  }
  catalog_price_list {
    uuid id PK
    text code
    text name
    char currency FK
    text customer_type
  }
  catalog_price_list_item {
    uuid id PK
    uuid price_list_id FK
    uuid variant_id FK
    numeric unit_price
    numeric min_qty
    timestamptz created_at
  }
  billing_invoice_line {
    uuid id PK
  }
  billing_receipt_line {
    uuid id PK
  }
  inventory_goods_receipt_line {
    uuid id PK
  }
  inventory_po_line {
    uuid id PK
  }
  inventory_serial_unit {
    uuid id PK
  }
  inventory_stock_level {
    uuid variant_id PK
    uuid warehouse_id PK
  }
  inventory_stock_movement {
    uuid id PK
  }
  inventory_stock_reservation {
    uuid id PK
  }
  maintenance_asset {
    uuid id PK
  }
  maintenance_work_order_part {
    uuid id PK
  }
  platform_currency {
    char code PK
  }
  quotes_design_bom_item {
    uuid id PK
  }
  quotes_quote_line {
    uuid id PK
  }
  sales_cart_item {
    uuid id PK
  }
  sales_delivery_note_line {
    uuid id PK
  }
  sales_order_line {
    uuid id PK
  }
  catalog_category |o--o{ catalog_category : "parent_id"
  catalog_category ||--o{ catalog_product : "category_id"
  catalog_product ||--o{ catalog_variant : "product_id"
  platform_currency |o--o{ catalog_variant : "cost_currency"
  platform_currency ||--o{ catalog_price_list : "currency"
  catalog_price_list ||--o{ catalog_price_list_item : "price_list_id"
  catalog_variant ||--o{ catalog_price_list_item : "variant_id"
  catalog_variant ||--o{ inventory_po_line : "variant_id"
  catalog_variant ||--o{ inventory_goods_receipt_line : "variant_id"
  catalog_variant ||--o{ inventory_serial_unit : "variant_id"
  catalog_variant ||--o{ inventory_stock_level : "variant_id"
  catalog_variant ||--o{ inventory_stock_movement : "variant_id"
  catalog_variant ||--o{ inventory_stock_reservation : "variant_id"
  catalog_variant ||--o{ quotes_design_bom_item : "variant_id"
  catalog_variant |o--o{ quotes_quote_line : "variant_id"
  catalog_variant ||--o{ sales_cart_item : "variant_id"
  catalog_variant ||--o{ sales_order_line : "variant_id"
  catalog_variant |o--o{ maintenance_asset : "variant_id"
  catalog_variant ||--o{ maintenance_work_order_part : "variant_id"
  catalog_variant |o--o{ billing_invoice_line : "variant_id"
  catalog_variant |o--o{ billing_receipt_line : "variant_id"
  catalog_variant |o--o{ sales_delivery_note_line : "variant_id"
```

## inventory (10 tables)

warehouse, supplier, purchase_order, po_line, goods_receipt, goods_receipt_line, serial_unit, stock_level, stock_movement, stock_reservation

```mermaid
erDiagram
  inventory_warehouse {
    uuid id PK
    text code
    text name
    text kind
    uuid branch_id FK
  }
  inventory_supplier {
    uuid id PK
    text code
    text name
    jsonb contact
    char currency FK
  }
  inventory_purchase_order {
    uuid id PK
    text po_no
    uuid supplier_id FK
    text status
    char currency FK
    date expected_date
    uuid created_by FK
    uuid approved_by FK
  }
  inventory_po_line {
    uuid id PK
    uuid po_id FK
    uuid variant_id FK
    numeric quantity
    numeric unit_cost
    numeric received_qty
  }
  inventory_goods_receipt {
    uuid id PK
    text grn_no
    uuid po_id FK
    uuid warehouse_id FK
    text delivery_note_no
    numeric freight_cost
    uuid received_by FK
  }
  inventory_goods_receipt_line {
    uuid id PK
    uuid grn_id FK
    uuid po_line_id FK
    uuid variant_id FK
    numeric quantity
    numeric landed_unit_cost
  }
  inventory_serial_unit {
    uuid id PK
    uuid variant_id FK
    text serial_no
    text status
    uuid warehouse_id FK
    uuid grn_line_id FK
    uuid installed_asset_id
  }
  inventory_stock_level {
    uuid variant_id PK
    uuid warehouse_id PK
    numeric on_hand
    timestamptz updated_at
  }
  inventory_stock_movement {
    uuid id PK
    uuid variant_id FK
    uuid warehouse_id FK
    text movement_type
    numeric quantity
    numeric unit_cost
    uuid serial_unit_id FK
    uuid created_by FK
  }
  inventory_stock_reservation {
    uuid id PK
    uuid variant_id FK
    uuid warehouse_id FK
    numeric quantity
    text ref_type
    uuid ref_id
  }
  catalog_variant {
    uuid id PK
  }
  identity_organization {
    uuid id PK
  }
  identity_user_account {
    uuid id PK
  }
  platform_currency {
    char code PK
  }
  projects_crew_assignment {
    uuid id PK
  }
  identity_organization |o--o{ inventory_warehouse : "branch_id"
  platform_currency |o--o{ inventory_supplier : "currency"
  inventory_supplier ||--o{ inventory_purchase_order : "supplier_id"
  platform_currency ||--o{ inventory_purchase_order : "currency"
  identity_user_account |o--o{ inventory_purchase_order : "created_by"
  identity_user_account |o--o{ inventory_purchase_order : "approved_by"
  inventory_purchase_order ||--o{ inventory_po_line : "po_id"
  catalog_variant ||--o{ inventory_po_line : "variant_id"
  inventory_purchase_order |o--o{ inventory_goods_receipt : "po_id"
  inventory_warehouse ||--o{ inventory_goods_receipt : "warehouse_id"
  identity_user_account |o--o{ inventory_goods_receipt : "received_by"
  inventory_goods_receipt ||--o{ inventory_goods_receipt_line : "grn_id"
  inventory_po_line |o--o{ inventory_goods_receipt_line : "po_line_id"
  catalog_variant ||--o{ inventory_goods_receipt_line : "variant_id"
  catalog_variant ||--o{ inventory_serial_unit : "variant_id"
  inventory_warehouse |o--o{ inventory_serial_unit : "warehouse_id"
  inventory_goods_receipt_line |o--o{ inventory_serial_unit : "grn_line_id"
  catalog_variant ||--o{ inventory_stock_level : "variant_id"
  inventory_warehouse ||--o{ inventory_stock_level : "warehouse_id"
  catalog_variant ||--o{ inventory_stock_movement : "variant_id"
  inventory_warehouse ||--o{ inventory_stock_movement : "warehouse_id"
  inventory_serial_unit |o--o{ inventory_stock_movement : "serial_unit_id"
  identity_user_account |o--o{ inventory_stock_movement : "created_by"
  catalog_variant ||--o{ inventory_stock_reservation : "variant_id"
  inventory_warehouse ||--o{ inventory_stock_reservation : "warehouse_id"
  inventory_warehouse |o--o{ projects_crew_assignment : "vehicle_warehouse_id"
```

## quotes (8 tables)

site_survey, energy_profile, energy_profile_item, system_design, design_bom_item, quote, quote_version, quote_line

```mermaid
erDiagram
  quotes_site_survey {
    uuid id PK
    text survey_no
    uuid customer_id FK
    uuid opportunity_id
    uuid site_id
    uuid surveyor_id FK
  }
  quotes_energy_profile {
    uuid id PK
    uuid customer_id FK
    uuid survey_id FK
    text name
    text source
    jsonb monthly_kwh
  }
  quotes_energy_profile_item {
    uuid id PK
    uuid profile_id FK
    text name
    numeric watts
    integer quantity
  }
  quotes_system_design {
    uuid id PK
    text design_no
    uuid customer_id FK
    uuid survey_id FK
    uuid profile_id FK
    text system_type
    text status
    uuid created_by FK
    uuid approved_by FK
  }
  quotes_design_bom_item {
    uuid id PK
    uuid design_id FK
    uuid variant_id FK
    numeric quantity
    text role
    text notes
  }
  quotes_quote {
    uuid id PK
    text quote_no
    uuid customer_id FK
    uuid opportunity_id
    uuid design_id FK
    integer current_version
    char currency FK
    uuid owner_id FK
    uuid signatory_id FK
  }
  quotes_quote_version {
    uuid id PK
    uuid quote_id FK
    integer version_no
    numeric subtotal
    numeric discount_amount
    uuid discount_approved_by FK
    uuid created_by FK
  }
  quotes_quote_line {
    uuid id PK
    uuid version_id FK
    integer line_no
    uuid variant_id FK
    text description
    numeric quantity
  }
  catalog_variant {
    uuid id PK
  }
  identity_customer {
    uuid id PK
  }
  identity_user_account {
    uuid id PK
  }
  platform_currency {
    char code PK
  }
  platform_signatory {
    uuid id PK
  }
  identity_customer ||--o{ quotes_site_survey : "customer_id"
  identity_user_account |o--o{ quotes_site_survey : "surveyor_id"
  identity_customer |o--o{ quotes_energy_profile : "customer_id"
  quotes_site_survey |o--o{ quotes_energy_profile : "survey_id"
  quotes_energy_profile ||--o{ quotes_energy_profile_item : "profile_id"
  identity_customer ||--o{ quotes_system_design : "customer_id"
  quotes_site_survey |o--o{ quotes_system_design : "survey_id"
  quotes_energy_profile |o--o{ quotes_system_design : "profile_id"
  identity_user_account |o--o{ quotes_system_design : "created_by"
  identity_user_account |o--o{ quotes_system_design : "approved_by"
  quotes_system_design ||--o{ quotes_design_bom_item : "design_id"
  catalog_variant ||--o{ quotes_design_bom_item : "variant_id"
  identity_customer ||--o{ quotes_quote : "customer_id"
  quotes_system_design |o--o{ quotes_quote : "design_id"
  platform_currency ||--o{ quotes_quote : "currency"
  identity_user_account |o--o{ quotes_quote : "owner_id"
  quotes_quote ||--o{ quotes_quote_version : "quote_id"
  identity_user_account |o--o{ quotes_quote_version : "discount_approved_by"
  identity_user_account |o--o{ quotes_quote_version : "created_by"
  quotes_quote_version ||--o{ quotes_quote_line : "version_id"
  catalog_variant |o--o{ quotes_quote_line : "variant_id"
  platform_signatory |o--o{ quotes_quote : "signatory_id"
```

## sales (8 tables)

cart, cart_item, sales_order, order_line, shipment, return_request, delivery_note, delivery_note_line

```mermaid
erDiagram
  sales_cart {
    uuid id PK
    uuid user_id FK
    text session_id
    char currency FK
    timestamptz created_at
    timestamptz updated_at
  }
  sales_cart_item {
    uuid id PK
    uuid cart_id FK
    uuid variant_id FK
    integer quantity
  }
  sales_sales_order {
    uuid id PK
    text order_no
    uuid customer_id FK
    text status
    char currency FK
    numeric subtotal
  }
  sales_order_line {
    uuid id PK
    uuid order_id FK
    uuid variant_id FK
    text description
    integer quantity
    numeric unit_price
  }
  sales_shipment {
    uuid id PK
    uuid order_id FK
    text carrier
    text tracking_no
    text status
  }
  sales_return_request {
    uuid id PK
    uuid order_id FK
    uuid order_line_id FK
    integer quantity
    text reason
    text status
  }
  sales_delivery_note {
    uuid id PK
    text dn_no
    text division_code
    date dn_date
    uuid customer_id FK
    uuid delivered_by_user FK
  }
  sales_delivery_note_line {
    uuid id PK
    uuid delivery_note_id FK
    integer line_no
    numeric quantity
    text item_no
    uuid variant_id FK
  }
  catalog_variant {
    uuid id PK
  }
  identity_customer {
    uuid id PK
  }
  identity_user_account {
    uuid id PK
  }
  platform_currency {
    char code PK
  }
  identity_user_account |o--o{ sales_cart : "user_id"
  platform_currency ||--o{ sales_cart : "currency"
  sales_cart ||--o{ sales_cart_item : "cart_id"
  catalog_variant ||--o{ sales_cart_item : "variant_id"
  identity_customer ||--o{ sales_sales_order : "customer_id"
  platform_currency ||--o{ sales_sales_order : "currency"
  sales_sales_order ||--o{ sales_order_line : "order_id"
  catalog_variant ||--o{ sales_order_line : "variant_id"
  sales_sales_order ||--o{ sales_shipment : "order_id"
  sales_sales_order ||--o{ sales_return_request : "order_id"
  sales_order_line ||--o{ sales_return_request : "order_line_id"
  identity_customer |o--o{ sales_delivery_note : "customer_id"
  identity_user_account |o--o{ sales_delivery_note : "delivered_by_user"
  sales_delivery_note ||--o{ sales_delivery_note_line : "delivery_note_id"
  catalog_variant |o--o{ sales_delivery_note_line : "variant_id"
```

## projects (12 tables)

project_template, project, milestone, task, crew, crew_member, crew_assignment, checklist_template, checklist_item_template, checklist_response, commissioning_record, project_cost

```mermaid
erDiagram
  projects_project_template {
    uuid id PK
    text code
    text name
    text system_type
  }
  projects_project {
    uuid id PK
    text project_no
    uuid customer_id FK
    uuid quote_id
    uuid design_id
    uuid template_id FK
    uuid manager_id FK
    char currency FK
  }
  projects_milestone {
    uuid id PK
    uuid project_id FK
    integer seq
    text name
    date due_date
  }
  projects_task {
    uuid id PK
    uuid project_id FK
    uuid milestone_id FK
    text title
    text description
    text status
    uuid assigned_to FK
  }
  projects_crew {
    uuid id PK
    text name
    uuid lead_user_id FK
    boolean is_active
  }
  projects_crew_member {
    uuid crew_id PK
    uuid user_id PK
  }
  projects_crew_assignment {
    uuid id PK
    uuid project_id FK
    uuid crew_id FK
    uuid task_id FK
    timestamptz starts_at
    timestamptz ends_at
    uuid vehicle_warehouse_id FK
    timestamptz created_at
  }
  projects_checklist_template {
    uuid id PK
    text code
    text name
    text applies_to
  }
  projects_checklist_item_template {
    uuid id PK
    uuid template_id FK
    integer seq
    text text
    text item_type
  }
  projects_checklist_response {
    uuid id PK
    uuid project_id FK
    uuid work_order_id
    uuid template_id FK
    uuid item_id FK
    jsonb answer
    uuid_array photo_document_ids
    uuid answered_by FK
  }
  projects_commissioning_record {
    uuid id PK
    uuid project_id FK
    numeric voc_v
    numeric isc_a
    numeric insulation_mohm
    uuid commissioned_by FK
  }
  projects_project_cost {
    uuid id PK
    uuid project_id FK
    text cost_type
    text description
    numeric amount
    char currency FK
  }
  identity_customer {
    uuid id PK
  }
  identity_user_account {
    uuid id PK
  }
  inventory_warehouse {
    uuid id PK
  }
  platform_currency {
    char code PK
  }
  identity_customer ||--o{ projects_project : "customer_id"
  projects_project_template |o--o{ projects_project : "template_id"
  identity_user_account |o--o{ projects_project : "manager_id"
  platform_currency ||--o{ projects_project : "currency"
  projects_project ||--o{ projects_milestone : "project_id"
  projects_project ||--o{ projects_task : "project_id"
  projects_milestone |o--o{ projects_task : "milestone_id"
  identity_user_account |o--o{ projects_task : "assigned_to"
  identity_user_account |o--o{ projects_crew : "lead_user_id"
  projects_crew ||--o{ projects_crew_member : "crew_id"
  identity_user_account ||--o{ projects_crew_member : "user_id"
  projects_project ||--o{ projects_crew_assignment : "project_id"
  projects_crew ||--o{ projects_crew_assignment : "crew_id"
  projects_task |o--o{ projects_crew_assignment : "task_id"
  inventory_warehouse |o--o{ projects_crew_assignment : "vehicle_warehouse_id"
  projects_checklist_template ||--o{ projects_checklist_item_template : "template_id"
  projects_project |o--o{ projects_checklist_response : "project_id"
  projects_checklist_template ||--o{ projects_checklist_response : "template_id"
  projects_checklist_item_template ||--o{ projects_checklist_response : "item_id"
  identity_user_account |o--o{ projects_checklist_response : "answered_by"
  projects_project ||--o{ projects_commissioning_record : "project_id"
  identity_user_account |o--o{ projects_commissioning_record : "commissioned_by"
  projects_project ||--o{ projects_project_cost : "project_id"
  platform_currency ||--o{ projects_project_cost : "currency"
```

## maintenance (10 tables)

asset, warranty, service_contract, contract_asset, maintenance_schedule, ticket, warranty_claim, work_order, work_order_part, visit_report

```mermaid
erDiagram
  maintenance_asset {
    uuid id PK
    text asset_no
    uuid parent_asset_id FK
    uuid customer_id FK
    uuid site_id
    uuid project_id
    uuid variant_id FK
  }
  maintenance_warranty {
    uuid id PK
    uuid asset_id FK
    text coverage_type
    date starts_on
    date ends_on
  }
  maintenance_service_contract {
    uuid id PK
    text contract_no
    uuid customer_id FK
    text plan_name
    jsonb scope
    char currency FK
  }
  maintenance_contract_asset {
    uuid contract_id PK
    uuid asset_id PK
  }
  maintenance_maintenance_schedule {
    uuid id PK
    uuid contract_id FK
    uuid asset_id FK
    integer frequency_months
    date next_due_on
    uuid last_work_order_id
  }
  maintenance_ticket {
    uuid id PK
    text ticket_no
    uuid customer_id FK
    uuid asset_id FK
    text channel
    text category
    uuid assigned_to FK
    uuid opened_by FK
  }
  maintenance_warranty_claim {
    uuid id PK
    uuid warranty_id FK
    uuid ticket_id FK
    timestamptz claimed_at
    text supplier_ref
    text status
  }
  maintenance_work_order {
    uuid id PK
    text wo_no
    uuid ticket_id FK
    uuid asset_id FK
    uuid customer_id FK
    text wo_type
    text status
    uuid assigned_to FK
  }
  maintenance_work_order_part {
    uuid id PK
    uuid work_order_id FK
    uuid variant_id FK
    numeric quantity
    uuid serial_unit_id
    uuid from_warehouse_id
  }
  maintenance_visit_report {
    uuid id PK
    uuid work_order_id FK
    text summary
    text findings
    text recommendations
    uuid submitted_by FK
  }
  catalog_variant {
    uuid id PK
  }
  identity_customer {
    uuid id PK
  }
  identity_user_account {
    uuid id PK
  }
  platform_currency {
    char code PK
  }
  maintenance_asset |o--o{ maintenance_asset : "parent_asset_id"
  identity_customer ||--o{ maintenance_asset : "customer_id"
  catalog_variant |o--o{ maintenance_asset : "variant_id"
  maintenance_asset ||--o{ maintenance_warranty : "asset_id"
  identity_customer ||--o{ maintenance_service_contract : "customer_id"
  platform_currency ||--o{ maintenance_service_contract : "currency"
  maintenance_service_contract ||--o{ maintenance_contract_asset : "contract_id"
  maintenance_asset ||--o{ maintenance_contract_asset : "asset_id"
  maintenance_service_contract ||--o{ maintenance_maintenance_schedule : "contract_id"
  maintenance_asset ||--o{ maintenance_maintenance_schedule : "asset_id"
  identity_customer ||--o{ maintenance_ticket : "customer_id"
  maintenance_asset |o--o{ maintenance_ticket : "asset_id"
  identity_user_account |o--o{ maintenance_ticket : "assigned_to"
  identity_user_account |o--o{ maintenance_ticket : "opened_by"
  maintenance_warranty ||--o{ maintenance_warranty_claim : "warranty_id"
  maintenance_ticket |o--o{ maintenance_warranty_claim : "ticket_id"
  maintenance_ticket |o--o{ maintenance_work_order : "ticket_id"
  maintenance_asset |o--o{ maintenance_work_order : "asset_id"
  identity_customer ||--o{ maintenance_work_order : "customer_id"
  identity_user_account |o--o{ maintenance_work_order : "assigned_to"
  maintenance_work_order ||--o{ maintenance_work_order_part : "work_order_id"
  catalog_variant ||--o{ maintenance_work_order_part : "variant_id"
  maintenance_work_order ||--o{ maintenance_visit_report : "work_order_id"
  identity_user_account |o--o{ maintenance_visit_report : "submitted_by"
```

## consulting (4 tables)

consultation_service, booking, engagement, deliverable

```mermaid
erDiagram
  consulting_consultation_service {
    uuid id PK
    text code
    text name
    text description
    char currency FK
  }
  consulting_booking {
    uuid id PK
    text booking_no
    uuid service_id FK
    uuid customer_id FK
    uuid consultant_id FK
    timestamptz starts_at
    timestamptz ends_at
    char currency FK
  }
  consulting_engagement {
    uuid id PK
    uuid booking_id FK
    uuid customer_id FK
    text title
    text scope
    text status
  }
  consulting_deliverable {
    uuid id PK
    uuid engagement_id FK
    text title
    uuid document_id
    text status
  }
  identity_customer {
    uuid id PK
  }
  identity_user_account {
    uuid id PK
  }
  platform_currency {
    char code PK
  }
  platform_currency ||--o{ consulting_consultation_service : "currency"
  consulting_consultation_service ||--o{ consulting_booking : "service_id"
  identity_customer ||--o{ consulting_booking : "customer_id"
  identity_user_account |o--o{ consulting_booking : "consultant_id"
  platform_currency ||--o{ consulting_booking : "currency"
  consulting_booking |o--o{ consulting_engagement : "booking_id"
  identity_customer ||--o{ consulting_engagement : "customer_id"
  consulting_engagement ||--o{ consulting_deliverable : "engagement_id"
```

## billing (13 tables)

tax_rate, invoice, invoice_line, payment_attempt, payment, payment_allocation, payment_plan, payment_plan_installment, credit_note, receipt, receipt_line, payment_voucher, payment_voucher_line

```mermaid
erDiagram
  billing_tax_rate {
    uuid id PK
    text code
    text name
    numeric rate_percent
  }
  billing_invoice {
    uuid id PK
    text invoice_no
    uuid customer_id FK
    text source_type
    uuid source_id
    char currency FK
    uuid created_by FK
  }
  billing_invoice_line {
    uuid id PK
    uuid invoice_id FK
    integer line_no
    text description
    uuid variant_id FK
    numeric quantity
  }
  billing_payment_attempt {
    uuid id PK
    uuid invoice_id FK
    uuid customer_id FK
    text provider
    text method
    numeric amount
    char currency FK
  }
  billing_payment {
    uuid id PK
    text payment_no
    uuid customer_id FK
    uuid attempt_id FK
    text method
    text provider
    char currency FK
    uuid recorded_by FK
  }
  billing_payment_allocation {
    uuid id PK
    uuid payment_id FK
    uuid invoice_id FK
    numeric amount
    timestamptz created_at
  }
  billing_payment_plan {
    uuid id PK
    uuid customer_id FK
    uuid invoice_id FK
    numeric total
    char currency FK
    text status
    timestamptz created_at
  }
  billing_payment_plan_installment {
    uuid id PK
    uuid plan_id FK
    integer seq
    date due_date
    numeric amount
    uuid payment_id FK
  }
  billing_credit_note {
    uuid id PK
    text cn_no
    uuid invoice_id FK
    text reason
    numeric amount
    char currency FK
    uuid approved_by FK
    uuid created_by FK
  }
  billing_receipt {
    uuid id PK
    text receipt_no
    text receipt_type
    text division_code
    uuid customer_id FK
    char currency FK
    uuid signatory_id FK
    uuid issued_by FK
  }
  billing_receipt_line {
    uuid id PK
    uuid receipt_id FK
    integer line_no
    numeric quantity
    text particulars
    uuid variant_id FK
  }
  billing_payment_voucher {
    uuid id PK
    text voucher_no
    text division_code
    date voucher_date
    char currency FK
    uuid prepared_by FK
    uuid approved_by FK
  }
  billing_payment_voucher_line {
    uuid id PK
    uuid voucher_id FK
    integer serial_no
    text ref_no
    text description
  }
  catalog_variant {
    uuid id PK
  }
  identity_customer {
    uuid id PK
  }
  identity_user_account {
    uuid id PK
  }
  platform_currency {
    char code PK
  }
  platform_signatory {
    uuid id PK
  }
  identity_customer ||--o{ billing_invoice : "customer_id"
  platform_currency ||--o{ billing_invoice : "currency"
  identity_user_account |o--o{ billing_invoice : "created_by"
  billing_invoice ||--o{ billing_invoice_line : "invoice_id"
  catalog_variant |o--o{ billing_invoice_line : "variant_id"
  billing_invoice ||--o{ billing_payment_attempt : "invoice_id"
  identity_customer ||--o{ billing_payment_attempt : "customer_id"
  platform_currency ||--o{ billing_payment_attempt : "currency"
  identity_customer ||--o{ billing_payment : "customer_id"
  billing_payment_attempt |o--o{ billing_payment : "attempt_id"
  platform_currency ||--o{ billing_payment : "currency"
  identity_user_account |o--o{ billing_payment : "recorded_by"
  billing_payment ||--o{ billing_payment_allocation : "payment_id"
  billing_invoice ||--o{ billing_payment_allocation : "invoice_id"
  identity_customer ||--o{ billing_payment_plan : "customer_id"
  billing_invoice ||--o{ billing_payment_plan : "invoice_id"
  platform_currency ||--o{ billing_payment_plan : "currency"
  billing_payment_plan ||--o{ billing_payment_plan_installment : "plan_id"
  billing_payment |o--o{ billing_payment_plan_installment : "payment_id"
  billing_invoice ||--o{ billing_credit_note : "invoice_id"
  platform_currency ||--o{ billing_credit_note : "currency"
  identity_user_account |o--o{ billing_credit_note : "approved_by"
  identity_user_account |o--o{ billing_credit_note : "created_by"
  identity_customer |o--o{ billing_receipt : "customer_id"
  platform_currency ||--o{ billing_receipt : "currency"
  platform_signatory |o--o{ billing_receipt : "signatory_id"
  identity_user_account |o--o{ billing_receipt : "issued_by"
  billing_receipt ||--o{ billing_receipt_line : "receipt_id"
  catalog_variant |o--o{ billing_receipt_line : "variant_id"
  platform_currency ||--o{ billing_payment_voucher : "currency"
  identity_user_account ||--o{ billing_payment_voucher : "prepared_by"
  identity_user_account |o--o{ billing_payment_voucher : "approved_by"
  billing_payment_voucher ||--o{ billing_payment_voucher_line : "voucher_id"
```
