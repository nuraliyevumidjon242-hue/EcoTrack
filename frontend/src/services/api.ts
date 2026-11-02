const API_BASE = '/api/v1';

export class ApiService {
  private static getToken(): string | null {
    return localStorage.getItem('ecotrack_token');
  }

  private static getHeaders(isFormData = false): HeadersInit {
    const headers: HeadersInit = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = { ...this.getHeaders(), ...(options.headers || {}) };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('ecotrack_token');
      localStorage.removeItem('ecotrack_user');
      window.dispatchEvent(new Event('auth_logout'));
    }

    if (!response.ok) {
      let errorMsg = 'An unexpected error occurred';
      try {
        const errJson = await response.json();
        errorMsg = errJson.detail || errJson.message || errorMsg;
      } catch {
        errorMsg = response.statusText;
      }
      throw new Error(errorMsg);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth
  static async login(data: any) {
    return this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async register(data: any) {
    return this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getMe() {
    return this.request<any>('/auth/me');
  }

  // Metrics
  static async getMetrics(params: { page?: number; size?: number; resource_type?: string }) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.size) query.append('size', params.size.toString());
    if (params.resource_type) query.append('resource_type', params.resource_type);
    return this.request<any>(`/metrics?${query.toString()}`);
  }

  static async createMetric(data: any) {
    return this.request<any>('/metrics', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateMetric(id: string, data: any) {
    return this.request<any>(`/metrics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteMetric(id: string) {
    return this.request<any>(`/metrics/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard & Predictions
  static async getDashboardSummary() {
    return this.request<any>('/dashboard/summary');
  }

  static async getPredictions() {
    return this.request<any>('/dashboard/predictions');
  }

  // Audit
  static async getAuditLogs(page = 1, size = 15) {
    return this.request<any>(`/audit?page=${page}&size=${size}`);
  }

  // Reports
  static getPdfUrl(lang = 'de') {
    return `${API_BASE}/reports/export/pdf?lang=${lang}`;
  }

  static getCsvUrl() {
    return `${API_BASE}/reports/export/csv`;
  }
}
