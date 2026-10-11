[Use cases](#u)[Data flow](#f)[Site maps](#m)[Access](#r)[Infrastructure](#i)[Operations](#o)

# TCOIN SOLAR UG: Requirements and Operations Drawings

Companion to the diagram pack and ERD pack. TCOIN UG: We Plan and Do.

## 1. Use cases

### 1.1 Use case overview by actor

```mermaid
flowchart LR
V([Visitor]) --- U1(Estimate savings) & U2(Request quote) & U3(Book survey or consultation) & U4(Buy components)
C([Customer]) --- U5(Accept quote and pay) & U6(Track project) & U7(Raise ticket) & U8(View warranties and documents)
S([Sales officer]) --- U9(Manage leads) & U10(Issue proforma invoice) & U11(Issue receipts)
E([Engineer]) --- U12(Survey site) & U13(Size and design) & U14(Approve BOM)
P([Project manager]) --- U15(Schedule crews) & U16(Monitor margin) & U17(Hand over project)
T([Technician]) --- U18(Execute jobs offline) & U19(Record parts and serials) & U20(Commission system)
ST([Store officer]) --- U21(Receive stock) & U22(Raise purchase order) & U23(Issue delivery note)
F([Finance]) --- U24(Prepare and approve vouchers) & U25(Reconcile payments) & U26(Report receivables)
A([Administrator]) --- U27(Manage users and roles) & U28(Edit templates and prices) & U29(Review audit log)
```

## 2. Data flow

### 2.1 DFD level 0

```mermaid
flowchart LR
CU[Customer] -->|enquiry, acceptance, payment| SYS((TCOIN SOLAR UG platform))
SYS -->|quotes, receipts, delivery notes, updates| CU
SU[Suppliers] -->|price lists, goods, invoices| SYS
SYS -->|purchase orders, payment vouchers| SU
PG[Payment aggregator] <-->|payments, webhooks| SYS
MS[SMS, WhatsApp, email] <-->|messages, receipts| SYS
AC[Accounting, e-invoicing] <-->|invoices, payments| SYS
ST[Staff and technicians] <-->|work, records| SYS
```

### 2.2 DFD level 1

```mermaid
flowchart TB
P1((1 Capture and qualify leads)) --> D1[(D1 Customers and leads)]
D1 --> P2((2 Survey, design, quote))
D4[(D4 Catalog and prices)] --> P2
P2 --> D2[(D2 Quotes and designs)]
D2 --> P3((3 Deliver projects))
D3[(D3 Inventory and serials)] <--> P3
P3 --> D5[(D5 Projects and assets)]
D5 --> P4((4 Maintain and support))
P4 --> D6[(D6 Tickets and warranties)]
D2 --> P5((5 Bill and collect))
D5 --> P5
P5 --> D7[(D7 Invoices and payments)]
P6((6 Procure and pay suppliers)) --> D3
P6 --> D7
D1 & D2 & D5 & D7 --> P7((7 Report and audit))
```

## 3. Site maps and page maps

### 3.1 Public website and store

```mermaid
flowchart LR
H[Home] --> SV[Services] --> S1[Design] & S2[Installation] & S3[Maintenance plans] & S4[Consultancy]
H --> CA[Calculator] --> CR[Results] --> LQ[Quote request]
H --> ST[Store] --> PL[Listing] --> PD[Product] --> CT[Cart] --> CK[Checkout] --> OC[Order confirmation]
H --> PF[Projects] & LN[Learn: blog, FAQ] & AB[About, contact] & LG[Legal]
```

### 3.2 Customer portal

```mermaid
flowchart LR
D[Dashboard] --> Q[Quotes] --> QV[Quote viewer: accept and pay]
D --> PR[Projects] --> TL[Timeline, photos, handover pack]
D --> SY[My systems] --> WA[Warranties, service contract]
D --> SU[Support] --> TK[Raise or view ticket]
D --> BI[Billing] --> RC[Invoices, receipts, plans]
D --> OR[Orders] --> DL[Delivery notes]
D --> AC[Account] --> PV[Privacy and data export]
```

### 3.3 Staff console

```mermaid
flowchart LR
HM[Home inbox] --> SA[Sales] --> LB[Leads board] & QB[Quote builder] & PI[Proforma invoices]
HM --> DE[Design] --> SS[Site surveys] & DW[Design workspace and BOM]
HM --> PJ[Projects] --> PL[Project list] & PD[Project dashboard] & SC[Crew schedule] & CM[Commissioning]
HM --> SE[Service] --> TQ[Ticket queue] & WO[Work orders] & AS[Assets and warranties]
HM --> IN[Inventory] --> SR[Stock register] & TR[Transfers] & PO[Purchase orders] & GR[Goods receipts]
HM --> FI[Finance] --> RC[Receipts] & VO[Payment vouchers] & RE[Reconciliation] & AR[Receivables]
HM --> DC[Documents centre] --> DN[Delivery notes] & LT[Letters]
HM --> RP[Reports] & AD[Admin: users, roles, catalog, templates, settings, audit]
```

### 3.4 Technician app

```mermaid
flowchart LR
TD[Today] --> JD[Job detail] --> CL[Checklist] --> PT[Parts and serials] --> CO[Commissioning readings] --> SG[Sign-off and delivery note]
TD --> SN[Sync status]
```

## 4. Access control

### 4.1 Role by module (R read, W write, A approve, own = own records only)

| Module                            | Admin | Director | Sales | Engineer | Project mgr | Technician  | Store | Finance | Customer      |
| --------------------------------- | ----- | -------- | ----- | -------- | ----------- | ----------- | ----- | ------- | ------------- |
| Leads and CRM                     | RW    | R        | RW    | R        | R           |             |       |         |               |
| Design and BOM                    | RW    | R        | R     | RWA      | R           |             | R     |         | own R         |
| Quotes and proforma               | RW    | RA       | RW    | RW       | R           |             |       | R       | own R, accept |
| Projects and schedule             | RW    | R        | R     | R        | RWA         | assigned RW | R     | R       | own R         |
| Inventory and POs                 | RW    | RA       | R     | R        | R           | parts       | RW    | R       |               |
| Receipts and invoices             | RW    | R        | RW    |          | R           |             |       | RWA     | own R, pay    |
| Payment vouchers                  | RW    | RA       |       |          |             |             | W     | RWA     |               |
| Delivery notes                    | RW    | R        | R     |          | RW          | sign        | RW    | R       | own R         |
| Tickets and work orders           | RW    | R        | R     | R        | RW          | assigned RW | R     |         | own RW        |
| Reports                           | R     | R        | own   | own      | R           |             | R     | R       |               |
| Users, roles, templates, settings | RWA   | R        |       |          |             |             |       |         |               |

### 4.2 How a customer request is authorised

```mermaid
sequenceDiagram
participant B as Browser
participant API
participant DB as PostgreSQL
B->>API: GET /invoices (token)
API->>API: verify token, load role and permissions
API->>DB: set app.customer_id and app.is_staff for the transaction
DB->>DB: row-level security filters rows
DB-->>API: only this customer's invoices
API-->>B: 200 data
```

## 5. Infrastructure

### 5.1 Network zones

```mermaid
flowchart TB
INT((Internet)) --> CF["Cloudflare: DNS, CDN, WAF"]
subgraph Public["Public subnet"]
LB[Load balancer]
end
subgraph App["Private app subnet"]
A1[API 1]
A2[API 2]
W1[Next.js web]
WK[Worker]
end
subgraph Data["Private data subnet"]
PG[(PostgreSQL primary)]
SB[(Standby + PITR backups)]
RD[(Redis)]
end
OBJ[(Object storage)]
CF --> LB --> A1 & A2 & W1
A1 & A2 & WK --> PG --> SB
A1 & A2 & WK --> RD
A1 & WK --> OBJ
WK --> EXT[SMS, email, payments, accounting]
OPS[Admin VPN or bastion] -.-> App
OPS -.-> Data
```

### 5.2 Backup and recovery

```mermaid
flowchart LR
PG[(PostgreSQL)] -->|WAL archive, continuous| WL[(WAL store)]
PG -->|daily snapshot| SN[(Snapshots)]
OB[(Object storage versioned)] --> RP[(Replica bucket)]
WL & SN --> RT[Quarterly restore drill]
RT --> V{RPO 15 min and RTO 4 h met?}
V -- yes --> OK[Record evidence]
V -- no --> FX[Fix and retest]
```

## 6. Operations

### 6.1 Domain events and consumers

```mermaid
flowchart LR
E1[LeadCreated] --> N[Notifications] & A[Auto-assign]
E2[QuoteSent] --> N
E3[QuoteAccepted] --> B[Billing: deposit invoice] & PJ[Projects: create] & IV[Inventory: reserve]
E4[InvoicePaid] --> RC[Receipt + PDF] & PJ2[Unlock scheduling] & AC[Accounting sync]
E5[GoodsReceived] --> IV2[Stock + serials]
E6[WorkOrderCompleted] --> BI[Billing: if billable] & IV3[Stock decrement]
E7[WarrantyExpiring] --> N
E8[StockLow] --> PO[Suggest purchase order]
```

### 6.2 Procurement to payment

```mermaid
flowchart LR
SH[Shortage from project BOM] --> PO[Purchase order draft] --> AP{Approved by a different person?}
AP -- no --> PO
AP -- yes --> SN[Sent to supplier] --> GR[Goods receipt + serials] --> PV[Payment voucher: prepared]
PV --> PA{Approved?} --> PD[Paid: bank or cheque no] --> RV[Received by: name, signature, date]
```

### 6.3 Offline sync states on the technician device

```mermaid
stateDiagram-v2
[*] --> Online
Online --> Offline: connection lost
Offline --> Offline: work saved in queue
Offline --> Syncing: connection back
Syncing --> Online: all applied
Syncing --> Review: some rejected
Review --> Online: technician resolves
```

### 6.4 Ticket SLA timers

```mermaid
stateDiagram-v2
[*] --> Open: SLA clocks start
Open --> Responded: first response
Responded --> Resolving
Open --> ResponseBreached: response due passed
ResponseBreached --> Responded
Resolving --> Resolved
Resolving --> ResolutionBreached: resolution due passed
ResolutionBreached --> Resolved
Resolved --> Closed
```

### 6.5 Notification pipeline

```mermaid
flowchart LR
EV[Domain event] --> OB[(Outbox)] --> WK[Worker] --> TP[Template + preferences] --> CH{Channel}
CH --> SM[SMS] & WA[WhatsApp] & EM[Email] & IA[In-app]
SM & WA & EM --> DL[Delivery receipt webhook] --> LG[(Delivery log)]
WK -. retry with backoff .-> TP
```

### 6.6 Data retention

```mermaid
flowchart LR
L[Lead not converted] -->|configurable period| AN[Anonymise]
FN[Financial records] -->|at least 7 years| AR[Archive]
AU[Audit log] -->|3 years| PU[Purge]
CU[Customer erasure request] --> RV{Legal hold or open balance?}
RV -- no --> AN2[Anonymise personal data]
RV -- yes --> KP[Keep minimum records, tell customer]
```

### 6.7 Backend module layering

```mermaid
flowchart LR
CT[Controller: HTTP, validation] --> SV[Application service: use case, transaction] --> DM[Domain: rules, events] --> RP[Repository: SQL]
SV -.-> OX[(Outbox)]
SV -. other module .-> PUB[Public service interface]
```
