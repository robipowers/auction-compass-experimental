// Scenario State Types for AMT Trading

export type ScenarioState = 'inactive' | 'triggered' | 'accepted' | 'rejected' | 'validated' | 'invalidated';

export interface ScenarioTrigger {
  level: number;
  direction: 'above' | 'below';
  triggeredAt: Date | null;
  acceptedAt: Date | null;
  rejectedAt: Date | null;
}

export interface Scenario {
  id: string;
  planId: string;
  name: string;
  description: string;
  instrument: string;
  trigger: ScenarioTrigger;
  state: ScenarioState;
  priority: 'primary' | 'secondary' | 'alternate';
  targets: number[];
  stopLoss: number | null;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScenarioWithProximity extends Scenario {
  proximityPoints: number;
  proximityPercent: number;
  isApproaching: boolean; // Within 10 points
  holdTimeMinutes: number | null; // If triggered, how long has it been held
}

export interface ScenarioStateChange {
  scenarioId: string;
  previousState: ScenarioState;
  newState: ScenarioState;
  timestamp: Date;
  triggerPrice: number;
  reason: string;
}

// Constants
export const ACCEPTANCE_TIME_MINUTES = 5; // Price must hold for 5 minutes
export const PROXIMITY_ALERT_POINTS = 10; // Alert when within 10 points

export const SCENARIO_STATE_LABELS: Record<ScenarioState, string> = {
  inactive: 'Inactive',
  triggered: 'Triggered',
  accepted: 'Accepted',
  rejected: 'Rejected',
  validated: 'Validated',
  invalidated: 'Invalidated',
};

export const SCENARIO_STATE_COLORS: Record<ScenarioState, { bg: string; text: string; border: string }> = {
  inactive: { bg: 'bg-secondary', text: 'text-muted-foreground', border: 'border-border' },
  triggered: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  accepted: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' },
  rejected: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
  validated: { bg: 'bg-green-500/30', text: 'text-green-400', border: 'border-green-500' },
  invalidated: { bg: 'bg-red-500/30', text: 'text-red-400', border: 'border-red-500' },
};
