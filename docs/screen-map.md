# Screen map

Every route, the page that renders it, and the screen design board it implements (see the published Screen designs). Generated at scaffold time; keep it updated when routes change.

| Area | Route | Page | Screen design | Permission |
|---|---|---|---|---|
| public | `/` | `public-site/Home` | Main (public home and calculator) |  |
| public | `/services/design` | `public-site/ServiceDesign` | SvcDesign |  |
| public | `/services/installation` | `public-site/ServiceInstall` | SvcInstall |  |
| public | `/services/maintenance` | `public-site/ServiceMaintenance` | SvcMaint |  |
| public | `/services/consultancy` | `public-site/ServiceConsultancy` | SvcConsult |  |
| public | `/projects` | `public-site/Portfolio` | Portfolio |  |
| public | `/about` | `public-site/About` | About |  |
| public | `/faq` | `public-site/Faq` | Faq |  |
| public | `/learn` | `public-site/Learn` | Learn |  |
| public | `/contact` | `public-site/Contact` | Contact |  |
| public | `/legal` | `public-site/Legal` |  |  |
| public | `/calculator` | `calculator/CalculatorSteps` |  |  |
| public | `/calculator/results` | `calculator/CalculatorResults` | CalcResult |  |
| public | `/store` | `store/StoreListing` | StoreList |  |
| public | `/store/:slug` | `store/ProductDetail` | Product |  |
| public | `/cart` | `store/Cart` | Cart |  |
| public | `/checkout` | `store/Checkout` | Checkout |  |
| public | `/orders/:id/confirmation` | `store/OrderConfirmation` | OrderDone |  |
| public | `/orders/:id/tracking` | `store/OrderTracking` |  |  |
| public | `/verify/:code` | `documents/VerifyDocument` |  |  |
| auth | `/login` | `auth/Login` |  |  |
| auth | `/otp` | `auth/OtpVerify` |  |  |
| auth | `/mfa` | `auth/MfaVerify` |  |  |
| auth | `/forgot-password` | `auth/ForgotPassword` |  |  |
| portal | `/portal` | `portal/Dashboard` | Portal |  |
| portal | `/portal/quotes` | `portal/Quotes` |  |  |
| portal | `/portal/quotes/:id` | `portal/QuoteViewer` | PQuote |  |
| portal | `/portal/projects` | `portal/Projects` |  |  |
| portal | `/portal/projects/:id` | `portal/ProjectTimeline` | PTimeline |  |
| portal | `/portal/systems` | `portal/MySystems` | PSystems |  |
| portal | `/portal/warranties` | `portal/Warranties` |  |  |
| portal | `/portal/billing` | `portal/Billing` | PBilling |  |
| portal | `/portal/orders` | `portal/Orders` |  |  |
| portal | `/portal/support/new` | `portal/RaiseTicket` | PTicket |  |
| portal | `/portal/support/:id` | `portal/TicketThread` |  |  |
| portal | `/portal/account` | `portal/Account` | PAccount |  |
| portal | `/portal/privacy` | `portal/Privacy` |  |  |
| console | `/console` | `reports/ReportsDashboard` | SReports | reports.read |
| console | `/console/reports/:name` | `reports/ReportViewer` |  | reports.read |
| console | `/console/leads` | `crm/LeadsBoard` | SLeads | leads.read |
| console | `/console/leads/:id` | `crm/LeadDetail` |  | leads.read |
| console | `/console/customers/:id` | `crm/Customer360` | Customer360 | leads.read |
| console | `/console/opportunities` | `crm/Opportunities` |  | leads.read |
| console | `/console/surveys` | `design/SiteSurveys` |  | designs.write |
| console | `/console/surveys/new` | `design/SiteSurveyForm` |  | designs.write |
| console | `/console/designs/:id` | `design/DesignWorkspace` | SDesign | designs.write |
| console | `/console/quotes` | `quotes/QuoteList` |  | quotes.write |
| console | `/console/quotes/:id` | `quotes/QuoteBuilder` | Quote | quotes.write |
| console | `/console/quotes/:id/versions` | `quotes/VersionHistory` |  | quotes.write |
| console | `/console/projects` | `projects/ProjectList` | ProjectList | projects.write |
| console | `/console/projects/:id` | `projects/ProjectDashboard` | Project | projects.write |
| console | `/console/schedule` | `projects/CrewSchedule` | Schedule | projects.write |
| console | `/console/projects/:id/commissioning` | `projects/Commissioning` |  | projects.write |
| console | `/console/projects/:id/handover` | `projects/Handover` |  | projects.write |
| console | `/console/stock` | `inventory/StockRegister` | Inventory | inventory.write |
| console | `/console/stock/transfer` | `inventory/StockTransfer` | StockTransfer | inventory.write |
| console | `/console/stock/movements` | `inventory/Movements` |  | inventory.write |
| console | `/console/serials` | `inventory/SerialLookup` |  | inventory.write |
| console | `/console/warehouses` | `inventory/Warehouses` |  | inventory.write |
| console | `/console/purchase-orders` | `purchasing/PurchaseOrders` |  | po.write |
| console | `/console/purchase-orders/new` | `purchasing/PurchaseOrderForm` | SPO | po.write |
| console | `/console/goods-receipts` | `purchasing/GoodsReceipt` |  | inventory.write |
| console | `/console/suppliers` | `purchasing/Suppliers` |  | po.write |
| console | `/console/invoices` | `finance/Invoices` |  | billing.write |
| console | `/console/invoices/:id` | `finance/InvoiceDetail` | InvoiceDetail | billing.write |
| console | `/console/payments` | `finance/Payments` |  | billing.write |
| console | `/console/reconciliation` | `finance/Reconciliation` | SRecon | billing.write |
| console | `/console/receivables` | `finance/Receivables` |  | billing.write |
| console | `/console/credit-notes` | `finance/CreditNotes` |  | billing.refund |
| console | `/console/documents` | `documents/DocumentsCentre` | DocCenter |  |
| console | `/console/documents/proforma/new` | `documents/NewProforma` |  | quotes.write |
| console | `/console/documents/receipt/new` | `documents/NewReceipt` |  | receipts.issue |
| console | `/console/documents/voucher/new` | `documents/NewVoucher` |  | vouchers.write |
| console | `/console/documents/delivery-note/new` | `documents/NewDeliveryNote` |  | delivery_notes.write |
| console | `/console/documents/letter/new` | `documents/NewLetter` |  | letters.write |
| console | `/console/tickets` | `maintenance/TicketQueue` | TicketQueue | tickets.write |
| console | `/console/tickets/:id` | `maintenance/TicketDetail` | Ticket | tickets.write |
| console | `/console/work-orders` | `maintenance/WorkOrders` |  | tickets.write |
| console | `/console/assets` | `maintenance/Assets` |  | tickets.write |
| console | `/console/contracts` | `maintenance/ServiceContracts` |  | tickets.write |
| console | `/console/maintenance-calendar` | `maintenance/MaintenanceCalendar` |  | tickets.write |
| console | `/console/consultancy/services` | `consultancy/ConsultationServices` |  |  |
| console | `/console/consultancy/bookings` | `consultancy/Bookings` | SBookings |  |
| console | `/console/consultancy/engagements` | `consultancy/Engagements` |  |  |
| console | `/console/admin/users` | `admin/Users` | SAdmin | admin.users |
| console | `/console/admin/roles` | `admin/Roles` |  | admin.users |
| console | `/console/admin/catalog` | `admin/CatalogAdmin` | SCatalog | catalog.write |
| console | `/console/admin/price-lists` | `admin/PriceLists` |  | catalog.write |
| console | `/console/admin/templates` | `admin/Templates` |  | documents.template_edit |
| console | `/console/admin/number-series` | `admin/NumberSeries` |  | admin.settings |
| console | `/console/admin/settings` | `admin/Settings` | Settings | admin.settings |
| console | `/console/admin/audit-log` | `admin/AuditLog` |  | admin.settings |
| console | `/console/notifications` | `notifications/Inbox` |  |  |
| console | `/console/notifications/preferences` | `notifications/Preferences` |  |  |
| field | `/field` | `field/Today` | TToday | field.execute |
| field | `/field/jobs/:id` | `field/JobDetail` | Tech | field.execute |
| field | `/field/jobs/:id/checklist` | `field/Checklist` |  | field.execute |
| field | `/field/jobs/:id/parts` | `field/Parts` | TParts | field.execute |
| field | `/field/jobs/:id/commissioning` | `field/Commissioning` |  | field.execute |
| field | `/field/jobs/:id/sign-off` | `field/SignOff` | TSign | field.execute |
| field | `/field/sync` | `field/SyncStatus` |  | field.execute |
