# Software Requirements Specification (SRS) & Portfolio Guide
## Project Name: EcoTrack – Smart Energy & Asset Management System
**Target Market:** Germany (SMEs / KMU - Kleine und mittlere Unternehmen)
**Compliance Standard:** EU Green Taxonomy & UBA (Umweltbundesamt) Guidelines
**Localization (i18n):** German (DE), English (EN)

---

## 1. Project Overview & Scope (Loyihaning Maqsadi)

### Problem Statement (Muammo)
German Small and Medium Enterprises (SMEs/KMU) are under strict regulatory pressure due to the **EU Green Taxonomy** and Corporate Sustainability Reporting Directive (CSRD). They must track and audit their carbon dioxide (CO2) emissions and energy footprints. However, existing enterprise carbon accounting software is prohibitively expensive for smaller businesses.

### Solution (Yechim)
**EcoTrack** is a lightweight, high-performance, and secure SaaS platform tailored for German SMEs. It allows companies to log utility metrics (electricity, natural gas, water, waste) and automatically converts these raw metrics into verifiable CO2 equivalent (\(CO_2e\)) kilograms based on official **Umweltbundesamt (UBA)** emission factors.

---

## 2. System Architecture & Tech Stack (Arxitektura va Texnologiyalar)

To impress senior German developers during your **Ausbildung Vorstellungsgespräch**, the system strictly follows **Clean Architecture** and **SOLID** principles.

### Tech Stack Blueprint
*   **Backend Options:** 
    *   *Option A (Recommended for Germany):* Java + Spring Boot (Domain-Driven Design).
    *   *Option B (Fast & AI-Friendly):* Python + FastAPI / Django (Clean Architecture layers).
*   **Frontend:** React.js / Angular + TypeScript + Tailwind CSS (Responsive Dashboard).
*   **Database:** PostgreSQL (Relational, ACID compliant, strictly typed).
*   **DevOps:** Docker, Docker Compose, GitHub Actions (CI/CD pipeline checking Linting & Tests).

---

## 3. Database Schema (PostgreSQL Blueprint)

```sql
-- Enable UUID extension for security
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPANIES TABLE
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    industry_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS TABLE (Role-Based Access Control - RBAC)
CREATE TYPE user_role AS ENUM ('SYSTEM_ADMIN', 'COMPANY_MANAGER', 'DATA_AUDITOR');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'DATA_AUDITOR',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. UTILITY METRICS (Energy Tracking Data)
CREATE TYPE utility_type AS ENUM ('ELECTRICITY', 'NATURAL_GAS', 'WATER', 'WASTE');

CREATE TABLE energy_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    recorded_by UUID REFERENCES users(id),
    type utility_type NOT NULL,
    raw_value NUMERIC(12, 2) NOT NULL, -- e.g., kWh or m3
    unit VARCHAR(10) NOT NULL,        -- kWh, m3, kg
    co2_emitted_kg NUMERIC(12, 2) NOT NULL, -- Calculated on backend via UBA factor
    log_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. SYSTEM AUDIT LOGS (Crucial for German Security & Compliance /ordnung/)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Backend REST API Endpoints

### Authentication & Users
*   `POST /api/v1/auth/login` -> Returns JWT Token & User Role.
*   `POST /api/v1/auth/register` -> System Admin registers a new company/manager.

### Energy & Resource Logs
*   `GET /api/v1/metrics` -> Fetch resource logs with pagination and filters (`type`, `date`).
*   `POST /api/v1/metrics` -> Input raw reading (Triggers UBA \(CO_2\) calculation engine).
*   `PUT /api/v1/metrics/{id}` -> Update reading (Creates record in `audit_logs`).

### Compliance & Analytics
*   `GET /api/v1/analytics/dashboard` -> Aggregated monthly data for chart visualization.
*   `GET /api/v1/compliance/export?format=pdf` -> Generates clean German-compliant report.

---

## 5. Core Algorithmic Feature: German \(CO_2\) Calculation Engine

The system handles conversion programmatically based on official German climate parameters:

```python
# Core Business Logic Layer (Domain Model Example)
def calculate_co2_emission(utility_type: str, raw_value: float) -> float:
    """
    Calculates CO2 equivalent in kilograms based on official German UBA constants.
    Values simulate official German energy mix metrics.
    """
    # Emission Factors (kg CO2 per unit)
    UBA_FACTORS = {
        "ELECTRICITY": 0.380,  # kg CO2 per kWh (German Energy Mix Grid)
        "NATURAL_GAS": 0.201,  # kg CO2 per kWh
        "WATER": 0.344,        # kg CO2 per m3 (Treatment & supply overhead)
        "WASTE": 0.450         # kg CO2 per kg
    }
    
    factor = UBA_FACTORS.get(utility_type.upper(), 0.0)
    return round(raw_value * factor, 2)
```

---

## 6. Frontend Layout & Internationalization (i18n)

### UI Views Structure
1.  **Login View:** Minimalist card layout with language selector flag dropdown (DE/EN).
2.  **Manager Dashboard:** 
    *   KPI cards showing Total $CO_2$ Footprint vs Active Limits.
    *   Time-series Line Charts (**Chart.js** / **Recharts**) mapping electricity consumption spikes.
    *   Data tables showing recent additions with badging for automated audit tracking.

### Multi-language Configuration (i18next Sample)
All interface hardcoding is strictly banned. Strings are organized dynamically:

```json
// locales/de/translation.json
{
  "dashboard": {
    "title": "Energie- und Ressourcenmanagement Dashboard",
    "total_co2": "Gesamter CO2-Fußabdruck",
    "add_log": "Neuen Verbrauch erfassen"
  }
}
```

---

## 7. DevOps, CI/CD, & German Quality Control

### Dockerization (`docker-compose.yml`)
Your local development setup must start flawlessly with a single terminal command:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ecotrack_admin
      POSTGRES_PASSWORD: secret_secure_password_123
      POSTGRES_DB: ecotrack_prod
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgres://ecotrack_admin:secret_secure_password_123@db:5432/ecotrack_prod
    depends_on:
      - db

volumes:
  postgres_data:
```

### Git & Code Formatting Standards
*   **Git Commits:** Must follow standard formatting (`feat: ...`, `fix: ...`, `docs: ...`).
*   **Linter Checks:** GitHub actions running automatically on pushes to check code structure (`Black`/`Flake8` for Python, `ESLint`/`Prettier` for frontend).

---

## 8. Interview Presentation Script (Prezentatsiya Rejasi)
*(Use these slides to pitch the project smoothly in English/German)*

*   **Slide 1: Title** -> "EcoTrack: Sustainable Asset & Carbon Management Platform for German SMEs"
*   **Slide 2: Context & Regulatory Problem** -> Explain EU Green Taxonomy & why small businesses struggle to pay for carbon auditing tools.
*   **Slide 3: Business Solution** -> Present EcoTrack as an automated tool mapping kWh into validated carbon parameters.
*   **Slide 4: System Architecture** -> Show clean separation of layers, Database diagram with system level Auditing tables.
*   **Slide 5: Demonstration of High Technical Skills** -> Highlight i18n, Docker setups, Secure JWT management, and GitHub automated workflows.
*   **Slide 6: Conclusion** -> Close with: *"Vielen Dank für Ihre Aufmerksamkeit! Tizim haqida savollaringiz bo'lsa javob berishga tayyorman."*

---

## 9. Crucial Rules for Vibe Coding with AI Agents (Xatosiz ishlash qoidalari)

1.  **Zero hardcoding for Keys:** AI will try to print secrets into files. Ensure any database passwords, JWT tokens, and secret strings are kept inside a secure `.env` file, and ensure `.env` is added to your `.gitignore`.
2.  **Verify version deprecations:** Instruct your AI explicitly to use stable, modern library releases (e.g., Python 3.11+, PostgreSQL 15, React 18+ with TypeScript).
3.  **Step-by-step modular validation:** Write tests or verify endpoinds via Postman *after finishing each individual service table* before prompting AI to auto-generate adjacent files.
