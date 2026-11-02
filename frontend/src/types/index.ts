export type UserRole = 'SYSTEM_ADMIN' | 'COMPANY_MANAGER' | 'DATA_AUDITOR';

export type ResourceType = 'ELECTRICITY' | 'NATURAL_GAS' | 'WATER' | 'WASTE';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  company_id?: string;
  is_active: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  companyName: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface EnergyMetric {
  id: string;
  company_id: string;
  recorded_by?: string;
  type: ResourceType;
  value_kwh_or_m3: number;
  unit: string;
  co2_emissions_kg: number;
  billing_period_start: string;
  billing_period_end: string;
  created_at: string;
}

export interface ResourceSummaryItem {
  type: ResourceType;
  total_raw: number;
  unit: string;
  total_co2_kg: number;
  percentage_of_total: number;
  factor_used: number;
}

export interface MonthlyResourceBreakdown {
  month: string;
  electricity_kwh: number;
  electricity_co2: number;
  gas_kwh: number;
  gas_co2: number;
  water_m3: number;
  water_co2: number;
  waste_kg: number;
  waste_co2: number;
  total_co2_kg: number;
}

export interface DashboardSummary {
  company_name: string;
  year_to_date_co2_kg: number;
  carbon_budget_limit_kg: number;
  carbon_budget_usage_percent: number;
  current_status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  total_logs_count: number;
  by_resource: ResourceSummaryItem[];
  monthly_trend: MonthlyResourceBreakdown[];
}

export interface PredictionResult {
  next_month: string;
  predicted_co2_kg: number;
  predicted_electricity_kwh: number;
  predicted_gas_kwh: number;
  trend_direction: 'UPWARD' | 'DOWNWARD' | 'STABLE';
  confidence_score: number;
  reduction_advice_de: string;
  reduction_advice_en: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  company_id?: string;
  action: string;
  details?: string;
  ip_address?: string;
  timestamp: string;
}
