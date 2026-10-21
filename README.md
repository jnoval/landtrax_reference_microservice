# Reference Microservice (NestJS)

Manages global reference data, service catalogs, processing requirements, system settings, and locations. Formerly referred to as the "Masterfile Module."

This microservice acts as the "source of truth" for the platform's configuration and available services. Because it is highly read-heavy and rarely updated, it requires aggressive caching strategies.

---

## 1. Folder Structure

_Note: In alignment with NestJS DDD best practices, related tables (e.g., `Category` and `ServiceCatalog`) have been merged into cohesive domain modules, and `Staging` and `PayType` have been moved to their respective operational microservices (Transaction and Payment)._

```text
/reference-microservice
├── /config
│   ├── redis.config.ts
│   └── app.config.ts
├── /domains
│   ├── /service-catalog       <-- Absorbs Category, ServiceCatalog, ServiceChecklist
│   │   ├── /controllers
│   │   ├── /entities          <-- category.entity.ts, service-catalog.entity.ts, checklist.entity.ts
│   │   ├── /services
│   │   └── service-catalog.module.ts
│   ├── /requirement           <-- Absorbs Requirement, RequirementMapping
│   │   ├── /controllers
│   │   ├── /entities
│   │   ├── /services
│   │   └── requirement.module.ts
│   ├── /system-settings
│   │   ├── /controllers
│   │   ├── /entities
│   │   ├── /services
│   │   └── system-settings.module.ts
│   ├── /location              <-- Absorbs RegistryOfDeed, LandtraxAddress
│   │   ├── /controllers
│   │   ├── /entities
│   │   ├── /services
│   │   └── location.module.ts
│   └── /faq                   <-- FrequentAskQuestion
│       ├── /controllers
│       ├── /entities
│       ├── /services
│       └── faq.module.ts
├── /shared
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── main.ts
└── /test
```

---

## 2. Dependencies Analysis

### Upstream Dependencies (Who depends on Reference Service)

Because this is a global configuration service, almost every operational service depends on it.

- **IAM Microservice:** Depends on `SystemSettings` to enforce security rules (e.g., password policies, dormancy thresholds).
- **Transaction Microservice:** Depends heavily on `ServiceCatalog` and `Requirement` to determine what documents to request from users when a transaction is created.
- **Document Intelligence (OCR) Microservice:** Needs `Requirement` logic to validate if an uploaded document matches the required checklist criteria.
- **Frontend / Client Apps:** Depends on `Location` and `FAQ` to render dropdown menus and help pages.

### Downstream Dependencies (What Reference Service depends on)

- **Database (PostgreSQL/MySQL):** **Shared Database (Phase 1)** - Shares the database with IAM and Transactions.
- **Redis (Cache):** **CRITICAL**. Because this microservice serves reference data that rarely changes but is queried constantly, Redis caching is mandatory.
- **Message Broker (RabbitMQ/Kafka/BullMQ):** Required for publishing cache invalidation events (e.g., `CatalogUpdatedEvent`).

---

## 3. Risk & Impact Analysis (Phase 1: Shared Database)

| Risk ID    | Category    | Description                                                                                                                                                                                                           | Impact       |
| ---------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| **RSK-01** | Performance | **The "God Service" Bottleneck:** Because nearly every downstream service needs to know system settings and catalogs to function, this microservice will be hit with an enormous volume of synchronous HTTP requests. | **HIGH**     |
| **RSK-02** | Database    | **Read Contention:** In the Phase 1 Shared Database, heavy read traffic for reference data competes directly with high-priority writes from IAM and Transactions, slowing down the entire system.                     | **MEDIUM**   |
| **RSK-03** | Reliability | **Transaction Blocker (SPoF):** If the Reference Service crashes, the Transaction Service cannot look up requirements, meaning no new transactions can be created.                                                    | **CRITICAL** |

---

## 4. Mitigations

### MIT-01: Aggressive In-Memory Caching (Addresses RSK-01 & RSK-02)

- **Strategy:** Never hit the database for standard reference data reads.
- **Implementation:** Implement strict Redis caching at the controller level for all `GET` requests in `/location`, `/faq`, `/service-catalog`, and `/system-settings`.

### MIT-02: Event-Driven Cache Invalidation (Addresses RSK-01 & RSK-03)

- **Strategy:** Downstream services should keep local copies of necessary reference data.
- **Implementation:** When an administrator updates a System Setting or Service Catalog, the Reference Microservice publishes a `ReferenceDataUpdatedEvent` to the Message Broker. Other microservices (like IAM or Transaction) listen for this event and update their internal local cache. This completely removes the need for synchronous HTTP calls between microservices, mitigating the SPoF risk.

### MIT-03: Extract Static Data to Shared Code (Addresses RSK-01)

- **Strategy:** If data _never_ changes (e.g., hardcoded status types, static roles), it should not be stored in the Reference Microservice database.
- **Implementation:** Extract static lists into Enums within a shared NPM/Nx library (e.g., `/common`) that all microservices import directly into their code, eliminating unnecessary network trips entirely.

---

## 5. Microservice Cross-Domain Dependencies

This section strictly outlines what external Microservices the **Reference Service** relies upon, identifying the exact source and the Reference services consuming them to prevent architectural gaps.

### 1. AuditTrail Module

**Purpose:** Centralized compliance logging to track exactly which administrator modified global system settings or service catalogs.
**Source Required:** `AuditTrail Service` (`audit.service.ts` or via `@AuditDescription()` decorator)
**Used By Reference Services:**

- `system-settings.service.ts`: To log when critical platform configurations (like password rules) are altered.
- `service-catalog.service.ts`: To log modifications to the pricing or structure of the services offered.
- `requirement.service.ts`: To log changes to mandatory document checklists.
- `location.service.ts`: To log additions or modifications to the Registry of Deeds locations.
  **Method of Invocation:** Strictly Asynchronous (via Message Broker).

_(Note: The Reference Microservice is largely self-contained and typically does not require dependencies on the Alert Module or other operational services.)_
