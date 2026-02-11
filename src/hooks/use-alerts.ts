import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Alert, 
  AlertHistory, 
  AlertSettings,
  AlertFormData,
  AlertHistoryGrouped,
  AlertWithStatus
} from '@/types/alerts';
import { mockAlerts, mockAlertHistory, mockAlertSettings } from '@/data/alertsData';

// Use mock data until database is connected
const USE_MOCK_DATA = true;

// Storage keys for localStorage persistence
const STORAGE_KEYS = {
  alerts: 'auction_alerts',
  history: 'auction_alert_history',
  settings: 'auction_alert_settings',
};

// Helper to get alerts from localStorage or mock
function getStoredAlerts(): Alert[] {
  if (!USE_MOCK_DATA) return [];
  const stored = localStorage.getItem(STORAGE_KEYS.alerts);
  return stored ? JSON.parse(stored) : mockAlerts;
}

function saveAlerts(alerts: Alert[]) {
  localStorage.setItem(STORAGE_KEYS.alerts, JSON.stringify(alerts));
}

function getStoredHistory(): AlertHistory[] {
  if (!USE_MOCK_DATA) return [];
  const stored = localStorage.getItem(STORAGE_KEYS.history);
  return stored ? JSON.parse(stored) : mockAlertHistory;
}

function saveHistory(history: AlertHistory[]) {
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
}

// Fetch all alerts with optional filters
export function useAlerts(filters?: {
  status?: 'all' | 'active' | 'disabled';
  instrument?: string;
  priority?: string;
}) {
  return useQuery({
    queryKey: ['alerts', filters],
    queryFn: async (): Promise<AlertWithStatus[]> => {
      let alerts = getStoredAlerts();
      
      // Apply filters
      if (filters?.status === 'active') {
        alerts = alerts.filter(a => a.is_active);
      } else if (filters?.status === 'disabled') {
        alerts = alerts.filter(a => !a.is_active);
      }
      
      if (filters?.instrument && filters.instrument !== 'all') {
        alerts = alerts.filter(a => a.instrument === filters.instrument);
      }
      
      if (filters?.priority && filters.priority !== 'all') {
        alerts = alerts.filter(a => a.priority === filters.priority);
      }
      
      // Add status field
      return alerts.map(a => ({
        ...a,
        status: a.is_active ? 'active' : 'disabled',
      })) as AlertWithStatus[];
    },
  });
}

// Get single alert
export function useAlert(alertId: string) {
  return useQuery({
    queryKey: ['alert', alertId],
    queryFn: async (): Promise<Alert | null> => {
      const alerts = getStoredAlerts();
      return alerts.find(a => a.id === alertId) || null;
    },
    enabled: !!alertId,
  });
}

// Create new alert
export function useCreateAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: AlertFormData): Promise<Alert> => {
      const alerts = getStoredAlerts();
      const newAlert: Alert = {
        id: `alert-${Date.now()}`,
        user_id: 'local',
        plan_id: null,
        name: data.name,
        instrument: data.instrument,
        condition_type: 'price',
        condition_direction: data.condition_direction,
        condition_value: data.condition_value,
        priority: data.priority,
        behavior: data.behavior,
        persist_after_session: data.persist_after_session,
        is_active: true,
        is_scenario_alert: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      alerts.unshift(newAlert);
      saveAlerts(alerts);
      return newAlert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

// Update existing alert
export function useUpdateAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AlertFormData> }): Promise<Alert> => {
      const alerts = getStoredAlerts();
      const index = alerts.findIndex(a => a.id === id);
      if (index === -1) throw new Error('Alert not found');
      
      alerts[index] = {
        ...alerts[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      
      saveAlerts(alerts);
      return alerts[index];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

// Delete alert
export function useDeleteAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const alerts = getStoredAlerts();
      const filtered = alerts.filter(a => a.id !== id);
      saveAlerts(filtered);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

// Toggle alert status
export function useToggleAlertStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }): Promise<void> => {
      const alerts = getStoredAlerts();
      const index = alerts.findIndex(a => a.id === id);
      if (index === -1) throw new Error('Alert not found');
      
      alerts[index].is_active = isActive;
      alerts[index].updated_at = new Date().toISOString();
      saveAlerts(alerts);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

// Bulk operations
export function useBulkAlertAction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ ids, action }: { ids: string[]; action: 'enable' | 'disable' | 'delete' }): Promise<void> => {
      let alerts = getStoredAlerts();
      
      if (action === 'delete') {
        alerts = alerts.filter(a => !ids.includes(a.id));
      } else {
        alerts = alerts.map(a => {
          if (ids.includes(a.id)) {
            return {
              ...a,
              is_active: action === 'enable',
              updated_at: new Date().toISOString(),
            };
          }
          return a;
        });
      }
      
      saveAlerts(alerts);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

// Fetch alert history grouped by session
export function useAlertHistory(filters?: {
  dateFrom?: string;
  dateTo?: string;
  instrument?: string;
  priority?: string;
}) {
  return useQuery({
    queryKey: ['alert-history', filters],
    queryFn: async (): Promise<AlertHistoryGrouped[]> => {
      let history = getStoredHistory();
      
      // Apply filters
      if (filters?.dateFrom) {
        history = history.filter(h => h.session_date >= filters.dateFrom!);
      }
      if (filters?.dateTo) {
        history = history.filter(h => h.session_date <= filters.dateTo!);
      }
      if (filters?.instrument && filters.instrument !== 'all') {
        history = history.filter(h => h.instrument === filters.instrument);
      }
      if (filters?.priority && filters.priority !== 'all') {
        history = history.filter(h => h.priority === filters.priority);
      }
      
      // Group by session date
      const grouped: Record<string, AlertHistory[]> = {};
      history.forEach(h => {
        if (!grouped[h.session_date]) {
          grouped[h.session_date] = [];
        }
        grouped[h.session_date].push(h);
      });
      
      // Sort and format
      const today = new Date().toISOString().split('T')[0];
      return Object.entries(grouped)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([date, alerts]) => ({
          sessionDate: date,
          sessionLabel: date === today ? "Today's Session" : formatDate(date),
          alertCount: alerts.length,
          alerts: alerts.sort((a, b) => 
            new Date(b.triggered_at).getTime() - new Date(a.triggered_at).getTime()
          ),
        }));
    },
  });
}

// Add to alert history
export function useAddAlertHistory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      alert: Alert;
      triggerPrice: number;
      coachingInsight?: string;
    }): Promise<AlertHistory> => {
      const history = getStoredHistory();
      const newEntry: AlertHistory = {
        id: `hist-${Date.now()}`,
        alert_id: data.alert.id,
        user_id: 'local',
        alert_name: data.alert.name,
        instrument: data.alert.instrument,
        condition_direction: data.alert.condition_direction,
        condition_value: data.alert.condition_value,
        priority: data.alert.priority,
        triggered_at: new Date().toISOString(),
        trigger_price: data.triggerPrice,
        session_date: new Date().toISOString().split('T')[0],
        coaching_insight: data.coachingInsight || null,
        created_at: new Date().toISOString(),
      };
      
      history.unshift(newEntry);
      saveHistory(history);
      return newEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-history'] });
    },
  });
}

// Alert settings
export function useAlertSettings() {
  return useQuery({
    queryKey: ['alert-settings'],
    queryFn: async (): Promise<AlertSettings> => {
      const stored = localStorage.getItem(STORAGE_KEYS.settings);
      return stored ? JSON.parse(stored) : mockAlertSettings;
    },
  });
}

export function useUpdateAlertSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: Partial<AlertSettings>): Promise<AlertSettings> => {
      const current = localStorage.getItem(STORAGE_KEYS.settings);
      const settings = current ? JSON.parse(current) : mockAlertSettings;
      const updated = {
        ...settings,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-settings'] });
    },
  });
}

// Count active alerts
export function useActiveAlertCount() {
  return useQuery({
    queryKey: ['active-alert-count'],
    queryFn: async (): Promise<number> => {
      const alerts = getStoredAlerts();
      return alerts.filter(a => a.is_active).length;
    },
  });
}

// Helper functions
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}
