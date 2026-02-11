import { useState, useEffect, useCallback, useRef } from "react";
import { useMarketData } from "@/contexts/MarketDataContext";
import { Scenario, ScenarioValidation, ValidationStatus } from "@/types/auction";
import { toast } from "sonner";

interface ScenarioTrigger {
  level: number;
  direction: "above" | "below" | "cross";
  scenarioIndex: number;
  scenarioName: string;
}

interface UseScenarioAutomationOptions {
  scenarios: Scenario[];
  initialValidations: ScenarioValidation[];
  onValidationUpdate?: (validations: ScenarioValidation[]) => void;
  audioEnabled?: boolean;
  visualNotificationsEnabled?: boolean;
}

// Parse price level from string like "18,450" or "18450.25"
function parsePriceLevel(levelStr: string): number | null {
  const cleaned = levelStr.replace(/[,\s]/g, "");
  const match = cleaned.match(/[\d.]+/);
  if (!match) return null;
  return parseFloat(match[0]);
}

// Extract trigger level from scenario inPlay string
function extractTriggerLevel(inPlay: string): number | null {
  return parsePriceLevel(inPlay);
}

// Determine direction from scenario description
function inferDirection(scenario: Scenario): "above" | "below" | "cross" {
  const text = (scenario.name + " " + scenario.typeOfMove + " " + scenario.behavior).toLowerCase();
  
  if (text.includes("break") && text.includes("above")) return "above";
  if (text.includes("break") && text.includes("below")) return "below";
  if (text.includes("breakout") || text.includes("extension")) return "above";
  if (text.includes("breakdown") || text.includes("failed")) return "below";
  if (text.includes("rotation") || text.includes("fill")) return "cross";
  
  return "cross";
}

// Play notification sound
function playNotificationSound(type: "trigger" | "validated" | "invalidated") {
  if (typeof window === "undefined" || !window.AudioContext) return;
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different tones for different events
    switch (type) {
      case "trigger":
        oscillator.frequency.value = 880; // A5 - attention
        break;
      case "validated":
        oscillator.frequency.value = 1047; // C6 - positive
        break;
      case "invalidated":
        oscillator.frequency.value = 440; // A4 - neutral/negative
        break;
    }
    
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    console.warn("Could not play notification sound:", e);
  }
}

export function useScenarioAutomation({
  scenarios,
  initialValidations,
  onValidationUpdate,
  audioEnabled = true,
  visualNotificationsEnabled = true,
}: UseScenarioAutomationOptions) {
  const { marketData, connectionStatus } = useMarketData();
  const [validations, setValidations] = useState<ScenarioValidation[]>(initialValidations);
  const [triggers, setTriggers] = useState<ScenarioTrigger[]>([]);
  const [manualOverrides, setManualOverrides] = useState<Set<number>>(new Set());
  const previousPriceRef = useRef<number | null>(null);

  // Parse triggers from scenarios on mount/change
  useEffect(() => {
    const parsedTriggers: ScenarioTrigger[] = scenarios
      .map((scenario, index) => {
        const level = extractTriggerLevel(scenario.inPlay);
        if (level === null) return null;
        
        return {
          level,
          direction: inferDirection(scenario),
          scenarioIndex: index,
          scenarioName: scenario.name,
        };
      })
      .filter((t): t is ScenarioTrigger => t !== null);
    
    setTriggers(parsedTriggers);
  }, [scenarios]);

  // Check for trigger crossings
  useEffect(() => {
    if (!marketData || connectionStatus !== "connected") return;
    if (triggers.length === 0) return;

    const currentPrice = marketData.price;
    const prevPrice = previousPriceRef.current;

    if (prevPrice === null) {
      previousPriceRef.current = currentPrice;
      return;
    }

    // Check each trigger
    triggers.forEach((trigger) => {
      // Skip if manually overridden
      if (manualOverrides.has(trigger.scenarioIndex)) return;

      const currentValidation = validations[trigger.scenarioIndex];
      if (!currentValidation) return;

      // Skip if already validated or invalidated
      if (currentValidation.status === "validated" || currentValidation.status === "invalidated") {
        return;
      }

      let triggered = false;

      switch (trigger.direction) {
        case "above":
          triggered = prevPrice < trigger.level && currentPrice >= trigger.level;
          break;
        case "below":
          triggered = prevPrice > trigger.level && currentPrice <= trigger.level;
          break;
        case "cross":
          triggered =
            (prevPrice < trigger.level && currentPrice >= trigger.level) ||
            (prevPrice > trigger.level && currentPrice <= trigger.level);
          break;
      }

      if (triggered) {
        // Update validation status
        setValidations((prev) => {
          const updated = [...prev];
          const current = updated[trigger.scenarioIndex];
          
          if (current.status === "inactive" || current.status === "in_play") {
            updated[trigger.scenarioIndex] = {
              ...current,
              status: "partially_validated" as ValidationStatus,
              validatedConditions: [
                ...current.validatedConditions,
                `Trigger level ${trigger.level.toLocaleString()} reached at ${new Date().toLocaleTimeString()}`,
              ],
              pendingConditions: current.pendingConditions.filter(
                (c) => !c.toLowerCase().includes("trigger")
              ),
            };

            // Notifications
            if (audioEnabled) {
              playNotificationSound("trigger");
            }

            if (visualNotificationsEnabled) {
              toast.success(`🎯 ${trigger.scenarioName}`, {
                description: `Trigger level ${trigger.level.toLocaleString()} reached!`,
                duration: 5000,
              });
            }
          }
          
          return updated;
        });
      }
    });

    previousPriceRef.current = currentPrice;
  }, [marketData, triggers, validations, manualOverrides, audioEnabled, visualNotificationsEnabled, connectionStatus]);

  // Notify parent of validation updates
  useEffect(() => {
    onValidationUpdate?.(validations);
  }, [validations, onValidationUpdate]);

  // Calculate proximity to each trigger
  const getProximity = useCallback(
    (scenarioIndex: number): { distance: number; percentage: number; direction: "above" | "below" } | null => {
      if (!marketData) return null;
      
      const trigger = triggers.find((t) => t.scenarioIndex === scenarioIndex);
      if (!trigger) return null;

      const distance = marketData.price - trigger.level;
      const percentage = Math.abs(distance / trigger.level) * 100;
      const direction = distance >= 0 ? "above" : "below";

      return { distance, percentage, direction };
    },
    [marketData, triggers]
  );

  // Manual override functions
  const setManualStatus = useCallback(
    (scenarioIndex: number, status: ValidationStatus) => {
      setManualOverrides((prev) => new Set(prev).add(scenarioIndex));
      setValidations((prev) => {
        const updated = [...prev];
        updated[scenarioIndex] = {
          ...updated[scenarioIndex],
          status,
          validatedConditions: [
            ...updated[scenarioIndex].validatedConditions,
            `Manually set to ${status.replace("_", " ")} at ${new Date().toLocaleTimeString()}`,
          ],
        };
        return updated;
      });

      if (audioEnabled && (status === "validated" || status === "invalidated")) {
        playNotificationSound(status);
      }

      if (visualNotificationsEnabled) {
        toast.info(`📝 ${scenarios[scenarioIndex]?.name || `Scenario ${scenarioIndex + 1}`}`, {
          description: `Manually set to ${status.replace("_", " ").toUpperCase()}`,
        });
      }
    },
    [scenarios, audioEnabled, visualNotificationsEnabled]
  );

  const clearOverride = useCallback((scenarioIndex: number) => {
    setManualOverrides((prev) => {
      const next = new Set(prev);
      next.delete(scenarioIndex);
      return next;
    });
  }, []);

  return {
    validations,
    triggers,
    getProximity,
    setManualStatus,
    clearOverride,
    isOverridden: (index: number) => manualOverrides.has(index),
  };
}
