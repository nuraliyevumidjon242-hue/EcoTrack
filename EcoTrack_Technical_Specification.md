# Software Requirements Specification (SRS)
## Project Name: EcoTrack – Smart Energy & Asset Management System
**Target Market:** Germany (SMEs – Small and Medium Enterprises)  
**Objective:** A portfolio-grade Full-Stack SaaS platform designed to monitor energy consumption, calculate CO2 footprints according to EU Green Taxonomy standards, and generate audit-ready reports. This project is structured to demonstrate enterprise-level coding practices (Clean Architecture, SOLID, CI/CD) for Germany's IT Ausbildung applications.

---

## 1. Tech Stack & Engineering Standards
To showcase maximum competency to German senior developers, the project implements strict production standards:

*   **Backend:** Java (Spring Boot) OR Python (FastAPI / Django) OR Node.js (NestJS / TypeScript)
*   **Frontend:** React.js / Vue.js / Angular with TypeScript and Tailwind CSS
*   **Database:** PostgreSQL (Relational data & ACID compliance) + Redis (Caching)
*   **DevOps & Infrastructure:** Docker & Docker Compose, GitHub Actions (CI/CD Pipeline)
*   **Design Principles:** SOLID, Clean Architecture, Layered/Hexagonal Patterns, DRY, and KISS

---

## 2. System Architecture & Database Schema
### 2.1 Database Schema (PostgreSQL)

```sql
-- Enums for Role-Based Access Control
CREATE TYPE user_role AS ENUM ('SYSTEM_ADMIN', 'COMPANY_MANAGER', 'DATA_AUDITOR');
CREATE TYPE resource_type AS ENUM ('ELECTRICITY', 'NATURAL_GAS', 'WATER', 'WASTE');

-- 1. Companies Table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    country VARCHAR(100) DEFAULT 'Germany',
    city VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'DATA_AUDITOR',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Energy Metrics Table
CREATE TABLE energy_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    recorded_by UUID REFERENCES users(id),
    type resource_type NOT NULL,
    value_kwh_or_m3 NUMERIC(12, 2) NOT NULL, -- Raw value (kWh for electricity/gas, m3 for water)
    co2_emissions_kg NUMERIC(12, 2) NOT NULL, -- Calculated automatically based on German grid factors
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Audit Logs Table (Crucial for German compliance/Datenschutz)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Core Modules & REST API Endpoints

### 3.1 Module 1: Authentication & RBAC (Role-Based Access Control)
Secured via JWT (JSON Web Tokens) with short expiration times and HttpOnly refresh cookies.
*   `POST /api/v1/auth/register` - Register a new company and manager account.
*   `POST /api/v1/auth/login` - Authenticate user and return JWT access token.
*   `GET /api/v1/auth/me` - Get current active user profile details.

### 3.2 Module 2: Resource Management & CO2 Calculation
Automated calculation engine utilizing Germany's Umweltbundesamt (UBA) conversion rates.
*   **Formula:** `Value (kWh) * Emission Factor (g CO2/kWh) / 1000 = CO2 (kg)`
    *   *German Electricity Grid Factor Example:* ~380g CO2/kWh
    *   *Natural Gas Factor Example:* ~201g CO2/kWh
*   `POST /api/v1/metrics` - Add a new metric entry (Auditor role minimum).
*   `GET /api/v1/metrics` - Fetch history of metrics with server-side pagination and filtering by date and resource type.
*   `PUT /api/v1/metrics/{id}` - Modify entries (Manager role only, triggers audit log).

### 3.3 Module 3: Advanced Visual Analytics Dashboard
Provides continuous stream-like telemetry simulations.
*   `GET /api/v1/dashboard/summary` - Provides aggregate year-to-date metrics, budget thresholds, and current target statuses.
*   `GET /api/v1/dashboard/predictions` - Basic machine learning or linear regression tracking predicting the company's next month's consumption based on historical data.

### 3.4 Module 4: European Compliance Reporting (PDF/CSV Export)
*   `GET /api/v1/reports/export/pdf` - Generates a highly stylized, print-ready PDF containing resource audits in German/English.
*   `GET /api/v1/reports/export/csv` - Downloads raw data matrices compatible with enterprise ERP environments.

---

## 4. Frontend Requirements & UI Architecture
*   **State Management:** Redux Toolkit or Zustand with explicit TypeScript type declarations for UI predictability.
*   **Internationalization (i18n):** Complete toggle support between German (`de`) and English (`en`) using `react-i18next` or similar ecosystem.
*   **Visualization:** Interactive, real-time charts mapping trends using `Chart.js`, `ApexCharts`, or `Recharts`.
*   **UX/UI Standards:** Clean, professional dashboard design with dark-mode support and custom warning modals for exceeded emissions alerts.

---

## 5. DevOps, CI/CD, and "German Quality" Enhancements
*   **Dockerization:** Multi-stage `Dockerfile` structures keeping imagery footprint small (<200MB) for production builds.
*   **CI/CD Pipeline:** GitHub Actions triggering on every pull request to verify unit tests (`JUnit` for Java, `pytest` for Python, `Jest` for JS) and formatting checks (`Prettier`, `ESLint`, or `Black`).
*   **Documentation:** Clean code adhering to standard docstrings, API interactivity auto-generated with `Swagger/OpenAPI`, and a structured `README.md` complete with an architectural overview block-diagram.
