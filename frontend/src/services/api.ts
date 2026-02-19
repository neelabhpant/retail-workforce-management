import axios from 'axios';
// Removed socket.io-client import - using native WebSocket

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// API Client for regular requests
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Client for AI/ML operations that take longer
// CrewAI agents make 5 sequential LLM calls, each can take 60-120 seconds
const aiApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 600000, // 10 minutes for AI operations (5 agents × ~90s each + buffer)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for regular client
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for regular client
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Request interceptor for AI client
aiApiClient.interceptors.request.use(
  (config) => {
    console.log(`AI API Request (long-running): ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for AI client
aiApiClient.interceptors.response.use(
  (response) => {
    console.log('AI API Response received');
    return response;
  },
  (error) => {
    console.error('AI API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Types
export interface Employee {
  employee_id: string;
  name: string;
  department: string;
  role: string;
  hire_date: string;
  hourly_wage: number;
  skill_level: number;
  availability_hours: number;
  location_id: string;
  manager_id: string;
  performance_score: number;
  satisfaction_score: number;
}

export interface Schedule {
  schedule_id: string;
  employee_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  department: string;
  status: string;
}

export interface DemandForecast {
  forecast_id: string;
  location_id: string;
  department: string;
  forecast_date: string;
  predicted_customers: number;
  required_staff: number;
  confidence_score: number;
}

export interface RetentionMetric {
  metric_id: string;
  employee_id: string;
  risk_score: number;
  factors: Record<string, number>;
  name?: string;
  department?: string;
}

export interface PlatformStatus {
  data_warehouse: string;
  ml_platform: string;
  data_flow: string;
  total_events: number;
  uptime: string;
  last_update: string;
}

export interface OptimizationResult {
  optimization_id: string;
  total_shifts: number;
  total_cost: number;
  coverage_score: number;
  employee_satisfaction: number;
  cost_savings: number;
  shifts: Array<{
    id: string;
    day: number;
    department: string;
    start_time: string;
    end_time: string;
    employee_id: string;
    confidence: number;
    reason: string;
  }>;
  recommendations: string[];
  risks: string[];
}

export interface RetentionAnalysis {
  analysis_id: string;
  employees: Array<{
    employee_id: string;
    name: string;
    risk_score: number;
    department: string;
    tenure_months: number;
    risk_factors: string[];
    interventions: string[];
    predicted_outcome?: number;
    satisfaction_score?: number;
    performance_score?: number;
    sentiment_trend?: string;
  }>;
  summary: {
    high_risk_count: number;
    medium_risk_count: number;
    low_risk_count: number;
    average_risk: number;
    total_employees?: number;
    average_risk_score?: number;
    top_risk_factors?: string[];
  };
  department_trends: Record<string, number>;
  recommendations?: string[];
  risk_factors?: string[];
}

export interface LearningPath {
  path_id: string;
  employee_id: string;
  total_duration_weeks: number;
  modules: Array<{
    id: string;
    name: string;
    duration_weeks: number;
    difficulty: string;
    skills: string[];
  }>;
  milestones: Array<{
    week: number;
    milestone: string;
    skills_gained: string[];
  }>;
  current_progress: number;
  target_role: string;
  skill_gaps: string[];
  recommended_actions: string[];
}

export interface DemandForecastResult {
  forecast_id: string;
  period_start: string;
  period_end: string;
  predictions: Array<{
    date: string;
    day_of_week: string;
    total_predicted_customers: number;
    total_required_staff: number;
    hourly_predictions: Array<{
      hour: number;
      predicted_customers: number;
      required_staff: number;
      confidence: number;
    }>;
    special_events: string[];
  }>;
  summary: {
    avg_daily_customers: number;
    peak_day: string;
    total_staff_hours_needed: number;
    confidence_score: number;
  };
  recommendations: string[];
}

// WebSocket Manager
class WebSocketManager {
  private socket: WebSocket | null = null;
  private listeners: Map<string, Array<(data: any) => void>> = new Map();

  connect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

    const wsUrl = API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws';
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket connection error:', error);
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.emit(message.type, message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.listeners.clear();
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  subscribe(topic: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'subscribe',
        topic: topic
      }));
    }
  }
}

export const wsManager = new WebSocketManager();

// API Functions
export const api = {
  // Platform endpoints
  async getPlatformStatus(): Promise<PlatformStatus> {
    const response = await apiClient.get('/api/platform/status');
    return response.data;
  },

  async getPlatformEvents(limit: number = 50) {
    const response = await apiClient.get(`/api/platform/events?limit=${limit}`);
    return response.data;
  },

  // Data endpoints
  async getEmployees(department?: string, limit: number = 100): Promise<{ employees: Employee[] }> {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    params.append('limit', limit.toString());

    const response = await apiClient.get(`/api/data/employees?${params}`);
    return response.data;
  },

  async getSchedules(employeeId?: string, dateRange: string = 'current_week') {
    const params = new URLSearchParams();
    if (employeeId) params.append('employee_id', employeeId);
    params.append('date_range', dateRange);

    const response = await apiClient.get(`/api/data/schedules?${params}`);
    return response.data;
  },

  async getDemandForecasts(locationId?: string, days: number = 14): Promise<{ forecasts: DemandForecast[] }> {
    const params = new URLSearchParams();
    if (locationId) params.append('location_id', locationId);
    params.append('days', days.toString());

    const response = await apiClient.get(`/api/data/demand-forecast?${params}`);
    return response.data;
  },

  async getRetentionMetrics(employeeId?: string): Promise<{ retention_metrics: RetentionMetric[] }> {
    const params = new URLSearchParams();
    if (employeeId) params.append('employee_id', employeeId);

    const response = await apiClient.get(`/api/data/retention-metrics?${params}`);
    return response.data;
  },

  // Agent endpoints
  async optimizeSchedule(request: {
    date_range: string;
    locations?: string[];
    departments?: string[];
    constraints?: string[];
  }): Promise<{ success: boolean; data: OptimizationResult }> {
    const response = await apiClient.post('/api/agents/optimize-schedule', request);
    return response.data;
  },

  async optimizeScheduleCrewAI(request: {
    date_range: string;
    locations?: string[];
    departments?: string[];
    constraints?: string[];
  }): Promise<{ success: boolean; data: OptimizationResult }> {
    const response = await aiApiClient.post('/api/agents/optimize-schedule-crewai', request);
    return response.data;
  },

  async analyzeRetention(request: {
    employee_id?: string;
    department?: string;
  }): Promise<{ success: boolean; data: RetentionAnalysis }> {
    const response = await aiApiClient.post('/api/agents/analyze-retention', request);
    return response.data;
  },

  async createLearningPath(request: {
    employee_id: string;
    career_goals?: Record<string, any>;
  }): Promise<{ success: boolean; data: LearningPath }> {
    const response = await aiApiClient.post('/api/agents/create-learning-path', request);
    return response.data;
  },

  async forecastDemand(request: {
    period?: string;
    locations?: string[];
    events?: string[];
    departments?: string[];
    use_prophet?: boolean;
  }): Promise<{ success: boolean; data: DemandForecastResult }> {
    // Try Prophet endpoint first if requested
    if (request.use_prophet !== false) {
      try {
        const response = await apiClient.post('/api/prophet/forecast', {
          ...request,
          departments: request.departments || ['Sales Floor', 'Customer Service']
        });
        return response.data;
      } catch (error) {
        console.warn('Prophet forecast failed, falling back to simple forecast:', error);
      }
    }
    
    // Fallback to simple forecast endpoint
    const response = await apiClient.post('/api/agents/forecast-demand', request);
    return response.data;
  },
  
  // Prophet-specific endpoints
  async getProphetStatus() {
    const response = await apiClient.get('/api/prophet/status');
    return response.data;
  },
  
  async trainProphetModels(departments: string[], days_back: number = 365) {
    const response = await apiClient.post('/api/prophet/train', {
      departments,
      days_back
    });
    return response.data;
  },
  
  async getProphetVisualization(department: string) {
    const response = await apiClient.post('/api/prophet/visualize', {
      department,
      include_history: false
    });
    return response.data;
  },
  
  async optimizeScheduleWithProphet(request: {
    date_range: string;
    locations?: string[];
    departments?: string[];
    constraints?: string[];
  }): Promise<{ success: boolean; data: OptimizationResult }> {
    const response = await apiClient.post('/api/agents/optimize-schedule-prophet', request);
    return response.data;
  },

  // Demo scenarios
  async runDemoScenario(scenarioType: string, parameters: Record<string, any> = {}) {
    const response = await apiClient.post('/api/demo/scenario', {
      scenario_type: scenarioType,
      parameters: parameters
    });
    return response.data;
  },

  // ML endpoints
  async predictRetentionRisk(employeeData: Record<string, any>) {
    const response = await apiClient.post('/api/ml/predict-retention', employeeData);
    return response.data;
  },

  async forecastCustomerDemand(dateFeatures: Record<string, any>) {
    const response = await apiClient.post('/api/ml/forecast-customer-demand', dateFeatures);
    return response.data;
  },

  // Data generation
  async generateSampleData(dataType: string = 'all', count: number = 10) {
    const response = await apiClient.post('/api/data/generate', {}, {
      params: { data_type: dataType, count }
    });
    return response.data;
  },
  
  // New Sentiment Dashboard endpoints
  async getSentimentHeatmap(timeframe: string = 'month') {
    const response = await apiClient.get('/api/sentiment/heatmap', {
      params: { timeframe }
    });
    return response.data;
  },
  
  async getActionQueue(limit: number = 5) {
    const response = await apiClient.get('/api/sentiment/action-queue', {
      params: { limit }
    });
    return response.data;
  },
  
  async getExecutiveSummary(timeframe: string = 'month') {
    const response = await apiClient.get('/api/sentiment/executive-summary', {
      params: { timeframe }
    });
    return response.data;
  },
  
  async exportExecutiveSummary(format: 'pdf' | 'ppt', timeframe: string = 'month') {
    const response = await apiClient.post('/api/sentiment/executive-summary/export', {
      format,
      timeframe
    });
    return response.data;
  },

  async analyzeSentimentCell(department: string, week: number, score: number) {
    console.log('AI API Request (long-running): POST /api/sentiment/analyze-cell');
    const response = await apiClient.post('/api/sentiment/analyze-cell', {
      department,
      week,
      score
    }, { timeout: 300000 });
    console.log('AI API Response received');
    return response.data;
  }
};

export default api;