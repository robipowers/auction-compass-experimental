// Scenario Acceptance Engine
// Implements 5-minute time-based acceptance logic from MVP Scope

import { 
  Scenario, 
  ScenarioState, 
  ScenarioWithProximity, 
  ScenarioStateChange,
  ACCEPTANCE_TIME_MINUTES,
  PROXIMITY_ALERT_POINTS 
} from '@/types/scenarios';

export class ScenarioEngine {
  private scenarios: Map<string, Scenario> = new Map();
  private stateChangeListeners: ((change: ScenarioStateChange) => void)[] = [];

  constructor(initialScenarios: Scenario[] = []) {
    initialScenarios.forEach(s => this.scenarios.set(s.id, s));
  }

  /**
   * Add a listener for scenario state changes
   */
  onStateChange(listener: (change: ScenarioStateChange) => void): () => void {
    this.stateChangeListeners.push(listener);
    return () => {
      this.stateChangeListeners = this.stateChangeListeners.filter(l => l !== listener);
    };
  }

  private notifyStateChange(change: ScenarioStateChange): void {
    this.stateChangeListeners.forEach(listener => listener(change));
  }

  /**
   * Check if price is on the correct side of the trigger level
   */
  private isPriceTriggered(trigger: { level: number; direction: 'above' | 'below' }, currentPrice: number): boolean {
    return trigger.direction === 'above' 
      ? currentPrice > trigger.level 
      : currentPrice < trigger.level;
  }

  /**
   * Calculate minutes since a given date
   */
  private minutesSince(date: Date): number {
    return (Date.now() - date.getTime()) / (1000 * 60);
  }

  /**
   * Core acceptance logic - updates scenario state based on current price
   * Returns the new state
   */
  checkAcceptance(scenarioId: string, currentPrice: number): ScenarioState {
    const scenario = this.scenarios.get(scenarioId);
    if (!scenario) return 'inactive';

    const { trigger, state: previousState } = scenario;
    const isTriggered = this.isPriceTriggered(trigger, currentPrice);
    let newState: ScenarioState = previousState;
    let reason = '';

    // State machine logic
    if (previousState === 'inactive') {
      if (isTriggered) {
        // First trigger - start the clock
        scenario.trigger.triggeredAt = new Date();
        newState = 'triggered';
        reason = `Price crossed ${trigger.direction} ${trigger.level}`;
      }
    } else if (previousState === 'triggered') {
      if (!isTriggered) {
        // Price reversed before acceptance
        scenario.trigger.rejectedAt = new Date();
        scenario.trigger.triggeredAt = null;
        newState = 'rejected';
        reason = 'Price reversed before 5-minute acceptance';
      } else if (trigger.triggeredAt) {
        // Check if 5 minutes have passed
        const minutesHeld = this.minutesSince(trigger.triggeredAt);
        if (minutesHeld >= ACCEPTANCE_TIME_MINUTES) {
          scenario.trigger.acceptedAt = new Date();
          newState = 'accepted';
          reason = `Price held ${trigger.direction} ${trigger.level} for ${ACCEPTANCE_TIME_MINUTES} minutes`;
        }
      }
    } else if (previousState === 'rejected') {
      // Can re-trigger after rejection
      if (isTriggered) {
        scenario.trigger.triggeredAt = new Date();
        scenario.trigger.rejectedAt = null;
        newState = 'triggered';
        reason = `Re-triggered: Price crossed ${trigger.direction} ${trigger.level}`;
      }
    }
    // 'accepted', 'validated', 'invalidated' are terminal states until manually reset

    // Update state if changed
    if (newState !== previousState) {
      scenario.state = newState;
      scenario.updatedAt = new Date();
      this.scenarios.set(scenarioId, scenario);

      const change: ScenarioStateChange = {
        scenarioId,
        previousState,
        newState,
        timestamp: new Date(),
        triggerPrice: currentPrice,
        reason,
      };
      this.notifyStateChange(change);
    }

    return newState;
  }

  /**
   * Get scenario with proximity information
   */
  getScenarioWithProximity(scenarioId: string, currentPrice: number): ScenarioWithProximity | null {
    const scenario = this.scenarios.get(scenarioId);
    if (!scenario) return null;

    const { trigger } = scenario;
    const distance = Math.abs(currentPrice - trigger.level);
    const proximityPercent = Math.max(0, 100 - (distance / trigger.level) * 100 * 10);
    
    let holdTimeMinutes: number | null = null;
    if (scenario.state === 'triggered' && trigger.triggeredAt) {
      holdTimeMinutes = this.minutesSince(trigger.triggeredAt);
    }

    return {
      ...scenario,
      proximityPoints: distance,
      proximityPercent,
      isApproaching: distance <= PROXIMITY_ALERT_POINTS,
      holdTimeMinutes,
    };
  }

  /**
   * Process all scenarios with current price
   */
  processAllScenarios(currentPrice: number): ScenarioWithProximity[] {
    const results: ScenarioWithProximity[] = [];
    
    this.scenarios.forEach((scenario) => {
      this.checkAcceptance(scenario.id, currentPrice);
      const withProximity = this.getScenarioWithProximity(scenario.id, currentPrice);
      if (withProximity) results.push(withProximity);
    });

    return results;
  }

  /**
   * Manually override scenario state
   */
  overrideState(scenarioId: string, newState: ScenarioState, reason: string = 'Manual override'): void {
    const scenario = this.scenarios.get(scenarioId);
    if (!scenario) return;

    const previousState = scenario.state;
    scenario.state = newState;
    scenario.updatedAt = new Date();
    this.scenarios.set(scenarioId, scenario);

    this.notifyStateChange({
      scenarioId,
      previousState,
      newState,
      timestamp: new Date(),
      triggerPrice: 0, // Not applicable for manual override
      reason,
    });
  }

  /**
   * Reset scenario to inactive
   */
  resetScenario(scenarioId: string): void {
    const scenario = this.scenarios.get(scenarioId);
    if (!scenario) return;

    scenario.state = 'inactive';
    scenario.trigger.triggeredAt = null;
    scenario.trigger.acceptedAt = null;
    scenario.trigger.rejectedAt = null;
    scenario.updatedAt = new Date();
    this.scenarios.set(scenarioId, scenario);
  }

  /**
   * Add or update a scenario
   */
  upsertScenario(scenario: Scenario): void {
    this.scenarios.set(scenario.id, scenario);
  }

  /**
   * Get all scenarios
   */
  getAllScenarios(): Scenario[] {
    return Array.from(this.scenarios.values());
  }

  /**
   * Get a single scenario
   */
  getScenario(scenarioId: string): Scenario | undefined {
    return this.scenarios.get(scenarioId);
  }
}

// Singleton instance
let engineInstance: ScenarioEngine | null = null;

export function getScenarioEngine(initialScenarios?: Scenario[]): ScenarioEngine {
  if (!engineInstance) {
    engineInstance = new ScenarioEngine(initialScenarios);
  }
  return engineInstance;
}

export function resetScenarioEngine(): void {
  engineInstance = null;
}
