import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  JournalEntry, 
  JournalEntryWithDetails,
  JournalEntryFormData,
  JournalTag,
  JournalStats,
  JournalFilters,
  Emotion
} from '@/types/journal';

// Use mock data until database is connected
const USE_MOCK_DATA = true;

const STORAGE_KEYS = {
  entries: 'journal_entries',
  tags: 'journal_tags',
  screenshots: 'journal_screenshots',
};

// Helper to get entries from localStorage
function getStoredEntries(): JournalEntry[] {
  if (!USE_MOCK_DATA) return [];
  const stored = localStorage.getItem(STORAGE_KEYS.entries);
  return stored ? JSON.parse(stored) : [];
}

function saveEntries(entries: JournalEntry[]) {
  localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(entries));
}

function getStoredTags(): JournalTag[] {
  if (!USE_MOCK_DATA) return [];
  const stored = localStorage.getItem(STORAGE_KEYS.tags);
  return stored ? JSON.parse(stored) : [
    { id: 'tag-1', user_id: 'local', name: 'Breakout', color: '#22c55e' },
    { id: 'tag-2', user_id: 'local', name: 'Reversal', color: '#ef4444' },
    { id: 'tag-3', user_id: 'local', name: 'Range', color: '#3b82f6' },
  ];
}

function saveTags(tags: JournalTag[]) {
  localStorage.setItem(STORAGE_KEYS.tags, JSON.stringify(tags));
}

// Fetch all journal entries with optional filters
export function useJournalEntries(filters?: JournalFilters) {
  return useQuery({
    queryKey: ['journal-entries', filters],
    queryFn: async (): Promise<JournalEntryWithDetails[]> => {
      let entries = getStoredEntries();
      
      // Apply filters
      if (filters?.dateFrom) {
        entries = entries.filter(e => e.trade_date >= filters.dateFrom!);
      }
      if (filters?.dateTo) {
        entries = entries.filter(e => e.trade_date <= filters.dateTo!);
      }
      if (filters?.instruments?.length) {
        entries = entries.filter(e => filters.instruments!.includes(e.instrument));
      }
      if (filters?.direction) {
        entries = entries.filter(e => e.direction === filters.direction);
      }
      if (filters?.emotions?.length) {
        entries = entries.filter(e => 
          filters.emotions!.some(emotion => 
            e.pre_trade_emotion?.includes(emotion) ||
            e.during_trade_emotion?.includes(emotion) ||
            e.post_trade_emotion?.includes(emotion)
          )
        );
      }
      if (filters?.followedPlan !== undefined) {
        entries = entries.filter(e => e.followed_plan === filters.followedPlan);
      }
      if (filters?.pnlMin !== undefined) {
        entries = entries.filter(e => (e.pnl_dollars ?? 0) >= filters.pnlMin!);
      }
      if (filters?.pnlMax !== undefined) {
        entries = entries.filter(e => (e.pnl_dollars ?? 0) <= filters.pnlMax!);
      }
      
      // Sort by date descending
      return entries.sort((a, b) => 
        new Date(b.trade_date).getTime() - new Date(a.trade_date).getTime()
      );
    },
  });
}

// Get single journal entry
export function useJournalEntry(entryId: string) {
  return useQuery({
    queryKey: ['journal-entry', entryId],
    queryFn: async (): Promise<JournalEntryWithDetails | null> => {
      const entries = getStoredEntries();
      return entries.find(e => e.id === entryId) || null;
    },
    enabled: !!entryId,
  });
}

// Create new journal entry
export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: JournalEntryFormData): Promise<JournalEntry> => {
      const entries = getStoredEntries();
      const newEntry: JournalEntry = {
        id: `journal-${Date.now()}`,
        user_id: 'local',
        trade_date: data.trade_date,
        instrument: data.instrument,
        direction: data.direction,
        entry_price: data.entry_price ? parseFloat(data.entry_price) : null,
        exit_price: data.exit_price ? parseFloat(data.exit_price) : null,
        pnl_pips: data.pnl_pips ? parseFloat(data.pnl_pips) : null,
        pnl_dollars: data.pnl_dollars ? parseFloat(data.pnl_dollars) : null,
        pre_trade_emotion: data.pre_trade_emotion,
        during_trade_emotion: data.during_trade_emotion,
        post_trade_emotion: data.post_trade_emotion,
        what_went_well: data.what_went_well || null,
        what_to_improve: data.what_to_improve || null,
        lesson_learned: data.lesson_learned || null,
        auction_plan_id: data.auction_plan_id,
        scenario_traded: data.scenario_traded || null,
        followed_plan: data.followed_plan,
        plan_deviation_reason: data.plan_deviation_reason || null,
        scenario_validation_status: data.scenario_validation_status,
        entry_timing: data.entry_timing,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      entries.unshift(newEntry);
      saveEntries(entries);
      return newEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['journal-stats'] });
    },
  });
}

// Update journal entry
export function useUpdateJournalEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<JournalEntryFormData> }): Promise<JournalEntry> => {
      const entries = getStoredEntries();
      const index = entries.findIndex(e => e.id === id);
      if (index === -1) throw new Error('Entry not found');
      
      entries[index] = {
        ...entries[index],
        ...data,
        entry_price: data.entry_price ? parseFloat(data.entry_price) : entries[index].entry_price,
        exit_price: data.exit_price ? parseFloat(data.exit_price) : entries[index].exit_price,
        pnl_pips: data.pnl_pips ? parseFloat(data.pnl_pips) : entries[index].pnl_pips,
        pnl_dollars: data.pnl_dollars ? parseFloat(data.pnl_dollars) : entries[index].pnl_dollars,
        updated_at: new Date().toISOString(),
      };
      
      saveEntries(entries);
      return entries[index];
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['journal-entry', id] });
      queryClient.invalidateQueries({ queryKey: ['journal-stats'] });
    },
  });
}

// Delete journal entry
export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const entries = getStoredEntries();
      const filtered = entries.filter(e => e.id !== id);
      saveEntries(filtered);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['journal-stats'] });
    },
  });
}

// Get journal tags
export function useJournalTags() {
  return useQuery({
    queryKey: ['journal-tags'],
    queryFn: async (): Promise<JournalTag[]> => {
      return getStoredTags();
    },
  });
}

// Create tag
export function useCreateJournalTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { name: string; color: string }): Promise<JournalTag> => {
      const tags = getStoredTags();
      const newTag: JournalTag = {
        id: `tag-${Date.now()}`,
        user_id: 'local',
        name: data.name,
        color: data.color,
      };
      tags.push(newTag);
      saveTags(tags);
      return newTag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-tags'] });
    },
  });
}

// Get journal stats
export function useJournalStats(filters?: { dateFrom?: string; dateTo?: string }) {
  return useQuery({
    queryKey: ['journal-stats', filters],
    queryFn: async (): Promise<JournalStats> => {
      let entries = getStoredEntries();
      
      if (filters?.dateFrom) {
        entries = entries.filter(e => e.trade_date >= filters.dateFrom!);
      }
      if (filters?.dateTo) {
        entries = entries.filter(e => e.trade_date <= filters.dateTo!);
      }
      
      const totalTrades = entries.length;
      const winningTrades = entries.filter(e => (e.pnl_dollars ?? 0) > 0).length;
      const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
      const totalPnl = entries.reduce((sum, e) => sum + (e.pnl_dollars ?? 0), 0);
      
      // Plan adherence
      const plannedTrades = entries.filter(e => e.auction_plan_id !== null);
      const followedPlan = plannedTrades.filter(e => e.followed_plan === true);
      const planAdherence = plannedTrades.length > 0 
        ? (followedPlan.length / plannedTrades.length) * 100 
        : 0;
      
      // Emotion correlations
      const emotionMap = new Map<Emotion, { pnl: number; count: number; wins: number }>();
      entries.forEach(entry => {
        const allEmotions = [
          ...(entry.pre_trade_emotion || []),
          ...(entry.during_trade_emotion || []),
          ...(entry.post_trade_emotion || []),
        ];
        allEmotions.forEach(emotion => {
          const current = emotionMap.get(emotion) || { pnl: 0, count: 0, wins: 0 };
          current.pnl += entry.pnl_dollars ?? 0;
          current.count += 1;
          if ((entry.pnl_dollars ?? 0) > 0) current.wins += 1;
          emotionMap.set(emotion, current);
        });
      });
      
      const emotionCorrelations = Array.from(emotionMap.entries()).map(([emotion, data]) => ({
        emotion,
        avgPnl: data.count > 0 ? data.pnl / data.count : 0,
        frequency: data.count,
        winRate: data.count > 0 ? (data.wins / data.count) * 100 : 0,
      })).sort((a, b) => b.avgPnl - a.avgPnl);
      
      return {
        totalTrades,
        winRate,
        totalPnl,
        planAdherence,
        emotionCorrelations,
        weeklyTrend: [], // TODO: Implement weekly trend
      };
    },
  });
}

// Get unique instruments from entries
export function useJournalInstruments() {
  return useQuery({
    queryKey: ['journal-instruments'],
    queryFn: async (): Promise<string[]> => {
      const entries = getStoredEntries();
      const instruments = new Set(entries.map(e => e.instrument));
      return Array.from(instruments);
    },
  });
}
