# Screen map

Every route, the page that renders it, and the screen design board it implements (see the published Screen designs). Generated at scaffold time; keep it updated when routes change.

| Area    | Route                                  | Page                               | Screen design                     | Permission              | Status |
| ------- | -------------------------------------- | ---------------------------------- | --------------------------------- | ----------------------- | ------ |
| public  | `/`                                    | `public-site/Home`                 | Main (public home and calculator) |                         | Built  |
| public  | `/services/design`                     | `public-site/ServiceDesign`        | SvcDesign                         |                         | Built  |
| public  | `/services/installation`               | `public-site/ServiceInstall`       | SvcInstall                        |                         | Built  |
| public  | `/services/maintenance`                | `public-site/ServiceMaintenance`   | SvcMaint                          |                         | Built  |
| public  | `/services/consultancy`                | `public-site/ServiceConsultancy`   | SvcConsult                        |                         | Built  |
| public  | `/projects`                            | `public-site/Portfolio`            | Portfolio                         |                         | Stub   |
| public  | `/about`                               | `public-site/About`                | About                             |                         | Built  |
| public  | `/faq`                                 | `public-site/Faq`                  | Faq                               |                         | Built  |
| public  | `/learn`                               | `public-site/Learn`                | Learn                             |                         | Stub   |
| public  | `/contact`                             | `public-site/Contact`              | Contact                           |                         | Built  |
| public  | `/legal`                               | `public-site/Legal`                |                                   |                         | Stub   |
| public  | `/calculator`                          | `calculator/CalculatorSteps`       |                                   |                         | Built  |
| public  | `/calculator/results`                  | `calculator/CalculatorResults`     | CalcResult                        |                         | Built  |
| public  | `/store`                               | `store/StoreListing`               | StoreList                         |                         | Stub   |
| public  | `/store/:slug`                         | `store/ProductDetail`              | Product                           |                         | Stub   |
| public  | `/cart`                                | `store/Cart`                       | Cart                              |                         | Stub   |
| public  | `/checkout`                            | `store/Checkout`                   | Checkout                          |                         | Stub   |
| public  | `/orders/:id/confirmation`             | `store/OrderConfirmation`          | OrderDone                         |                         | Stub   |
| public  | `/orders/:id/tracking`                 | `store/OrderTracking`              |                                   |                         | Stub   |
| public  | `/verify/:code`                        | `documents/VerifyDocument`         |                                   |                         | Stub   |
| auth    | `/login`                               | `auth/Login`                       |                                   |                         | Built  |
| auth    | `/otp`                                 | `auth/OtpVerify`                   |                                   |                         | Built  |
| auth    | `/mfa`                                 | `auth/MfaVerify`                   |                                   |                         | Built  |
| auth    | `/forgot-password`                     | `auth/ForgotPassword`              |                                   |                         | Built  |
| portal  | `/portal`                              | `portal/Dashboard`                 | Portal                            |                         | Stub   |
| portal  | `/portal/quotes`                       | `portal/Quotes`                    |                                   |                         | Stub   |
| portal  | `/portal/quotes/:id`                   | `portal/QuoteViewer`               | PQuote                            |                         | Stub   |
| portal  | `/portal/projects`                     | `portal/Projects`                  |                                   |                         | Stub   |
| portal  | `/portal/projects/:id`                 | `portal/ProjectTimeline`           | PTimeline                         |                         | Stub   |
| portal  | `/portal/systems`                      | `portal/MySystems`                 | PSystems                          |                         | Stub   |
| portal  | `/portal/warranties`                   | `portal/Warranties`                |                                   |                         | Stub   |
| portal  | `/portal/billing`                      | `portal/Billing`                   | PBilling                          |                         | Stub   |
| portal  | `/portal/orders`                       | `portal/Orders`                    |                                   |                         | Stub   |
| portal  | `/portal/support/new`                  | `portal/RaiseTicket`               | PTicket                           |                         | Stub   |
| portal  | `/portal/support/:id`                  | `portal/TicketThread`              |                                   |                         | Stub   |
| portal  | `/portal/account`                      | `portal/Account`                   | PAccount                          |                         | Stub   |
| portal  | `/portal/privacy`                      | `portal/Privacy`                   |                                   |                         | Stub   |
| console | `/console`                             | `reports/ReportsDashboard`         | SReports                          | reports.read            | Built  |
| console | `/console/reports/:name`               | `reports/ReportViewer`             |                                   | reports.read            | Stub   |
| console | `/console/leads`                       | `crm/LeadsBoard`                   | SLeads                            | leads.read              | Built  |
| console | `/console/leads/:id`                   | `crm/LeadDetail`                   |                                   | leads.read              | Stub   |
| console | `/console/customers/:id`               | `crm/Customer360`                  | Customer360                       | leads.read              | Stub   |
| console | `/console/opportunities`               | `crm/Opportunities`                |                                   | leads.read              | Stub   |
| console | `/console/surveys`                     | `design/SiteSurveys`               |                                   | designs.write           | Stub   |
| console | `/console/surveys/new`                 | `design/SiteSurveyForm`            |                                   | designs.write           | Stub   |
| console | `/console/designs/:id`                 | `design/DesignWorkspace`           | SDesign                           | designs.write           | Stub   |
| console | `/console/quotes`                      | `quotes/QuoteList`                 |                                   | quotes.write            | Built  |
| console | `/console/quotes/:id`                  | `quotes/QuoteBuilder`              | Quote                             | quotes.write            | Built  |
| console | `/console/quotes/:id/versions`         | `quotes/VersionHistory`            |                                   | quotes.write            | Stub   |
| console | `/console/projects`                    | `projects/ProjectList`             | ProjectList                       | projects.write          | Stub   |
| console | `/console/projects/:id`                | `projects/ProjectDashboard`        | Project                           | projects.write          | Stub   |
| console | `/console/schedule`                    | `projects/CrewSchedule`            | Schedule                          | projects.write          | Stub   |
| console | `/console/projects/:id/commissioning`  | `projects/Commissioning`           |                                   | projects.write          | Stub   |
| console | `/console/projects/:id/handover`       | `projects/Handover`                |                                   | projects.write          | Stub   |
| console | `/console/stock`                       | `inventory/StockRegister`          | Inventory                         | inventory.write         | Stub   |
| console | `/console/stock/transfer`              | `inventory/StockTransfer`          | StockTransfer                     | inventory.write         | Stub   |
| console | `/console/stock/movements`             | `inventory/Movements`              |                                   | inventory.write         | Stub   |
| console | `/console/serials`                     | `inventory/SerialLookup`           |                                   | inventory.write         | Stub   |
| console | `/console/warehouses`                  | `inventory/Warehouses`             |                                   | inventory.write         | Stub   |
| console | `/console/purchase-orders`             | `purchasing/PurchaseOrders`        |                                   | po.write                | Stub   |
| console | `/console/purchase-orders/new`         | `purchasing/PurchaseOrderForm`     | SPO                               | po.write                | Stub   |
| console | `/console/goods-receipts`              | `purchasing/GoodsReceipt`          |                                   | inventory.write         | Stub   |
| console | `/console/suppliers`                   | `purchasing/Suppliers`             |                                   | po.write                | Stub   |
| console | `/console/invoices`                    | `finance/Invoices`                 |                                   | billing.write           | Stub   |
| console | `/console/invoices/:id`                | `finance/InvoiceDetail`            | InvoiceDetail                     | billing.write           | Stub   |
| console | `/console/payments`                    | `finance/Payments`                 |                                   | billing.write           | Stub   |
| console | `/console/reconciliation`              | `finance/Reconciliation`           | SRecon                            | billing.write           | Stub   |
| console | `/console/receivables`                 | `finance/Receivables`              |                                   | billing.write           | Stub   |
| console | `/console/credit-notes`                | `finance/CreditNotes`              |                                   | billing.refund          | Stub   |
| console | `/console/documents`                   | `documents/DocumentsCentre`        | DocCenter                         |                         | Built  |
| console | `/console/documents/proforma/new`      | `documents/NewProforma`            |                                   | quotes.write            | Stub   |
| console | `/console/documents/receipt/new`       | `documents/NewReceipt`             |                                   | receipts.issue          | Built  |
| console | `/console/documents/voucher/new`       | `documents/NewVoucher`             |                                   | vouchers.write          | Stub   |
| console | `/console/documents/delivery-note/new` | `documents/NewDeliveryNote`        |                                   | delivery_notes.write    | Stub   |
| console | `/console/documents/letter/new`        | `documents/NewLetter`              |                                   | letters.write           | Stub   |
| console | `/console/tickets`                     | `maintenance/TicketQueue`          | TicketQueue                       | tickets.write           | Stub   |
| console | `/console/tickets/:id`                 | `maintenance/TicketDetail`         | Ticket                            | tickets.write           | Stub   |
| console | `/console/work-orders`                 | `maintenance/WorkOrders`           |                                   | tickets.write           | Stub   |
| console | `/console/assets`                      | `maintenance/Assets`               |                                   | tickets.write           | Stub   |
| console | `/console/contracts`                   | `maintenance/ServiceContracts`     |                                   | tickets.write           | Stub   |
| console | `/console/maintenance-calendar`        | `maintenance/MaintenanceCalendar`  |                                   | tickets.write           | Stub   |
| console | `/console/consultancy/services`        | `consultancy/ConsultationServices` |                                   |                         | Stub   |
| console | `/console/consultancy/bookings`        | `consultancy/Bookings`             | SBookings                         |                         | Stub   |
| console | `/console/consultancy/engagements`     | `consultancy/Engagements`          |                                   |                         | Stub   |
| console | `/console/admin/users`                 | `admin/Users`                      | SAdmin                            | admin.users             | Stub   |
| console | `/console/admin/roles`                 | `admin/Roles`                      |                                   | admin.users             | Stub   |
| console | `/console/admin/catalog`               | `admin/CatalogAdmin`               | SCatalog                          | catalog.write           | Stub   |
| console | `/console/admin/price-lists`           | `admin/PriceLists`                 |                                   | catalog.write           | Stub   |
| console | `/console/admin/templates`             | `admin/Templates`                  |                                   | documents.template_edit | Stub   |
| console | `/console/admin/number-series`         | `admin/NumberSeries`               |                                   | admin.settings          | Stub   |
| console | `/console/admin/settings`              | `admin/Settings`                   | Settings                          | admin.settings          | Stub   |
| console | `/console/admin/audit-log`             | `admin/AuditLog`                   |                                   | admin.settings          | Stub   |
| console | `/console/notifications`               | `notifications/Inbox`              |                                   |                         | Stub   |
| console | `/console/notifications/preferences`   | `notifications/Preferences`        |                                   |                         | Stub   |
| field   | `/field`                               | `field/Today`                      | TToday                            | field.execute           | Stub   |
| field   | `/field/jobs/:id`                      | `field/JobDetail`                  | Tech                              | field.execute           | Stub   |
| field   | `/field/jobs/:id/checklist`            | `field/Checklist`                  |                                   | field.execute           | Stub   |
| field   | `/field/jobs/:id/parts`                | `field/Parts`                      | TParts                            | field.execute           | Stub   |
| field   | `/field/jobs/:id/commissioning`        | `field/Commissioning`              |                                   | field.execute           | Stub   |
| field   | `/field/jobs/:id/sign-off`             | `field/SignOff`                    | TSign                             | field.execute           | Stub   |
| field   | `/field/sync`                          | `field/SyncStatus`                 |                                   | field.execute           | Stub   |

| print | `/print/proforma/:id` | `documents/ProformaPrint` | Print: Proforma Invoice | staff | Built |
| print | `/print/receipt/:id` | `documents/ReceiptPrint` | Print: Corporate and Cash / Sales Receipt | staff | Built |
