-- Automated Alerts & Notifications
-- Migration: alerts, alert_history, alert_settings

-- Alerts table: Alert definitions
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan_id UUID NULL, -- NULL for manual alerts, references auction_plans if linked
  name TEXT NOT NULL,
  instrument TEXT NOT NULL, -- 'NQ', 'ES', 'YM', 'RTY'
  condition_type TEXT NOT NULL DEFAULT 'price', -- 'price', 'structure', 'scenario'
  condition_direction TEXT NOT NULL, -- 'above', 'below', 'crosses'
  condition_value DECIMAL NOT NULL, -- Price level
  priority TEXT NOT NULL DEFAULT 'important', -- 'critical', 'important', 'informational'
  behavior TEXT NOT NULL DEFAULT 'fire_once_disable', -- 'fire_once_dismiss', 'fire_once_disable', 'repeating'
  persist_after_session BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_scenario_alert BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert history: Log of triggered alerts
CREATE TABLE IF NOT EXISTS alert_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_id UUID REFERENCES alerts(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  alert_name TEXT NOT NULL, -- Denormalized for history
  instrument TEXT NOT NULL,
  condition_direction TEXT NOT NULL,
  condition_value DECIMAL NOT NULL,
  priority TEXT NOT NULL,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  trigger_price DECIMAL NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  coaching_insight TEXT NULL, -- AI-generated insight
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert settings: User notification preferences
CREATE TABLE IF NOT EXISTS alert_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  sounds_enabled BOOLEAN DEFAULT true,
  browser_notifications_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_alerts_user_active ON alerts(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_instrument ON alerts(instrument);
CREATE INDEX IF NOT EXISTS idx_alerts_priority ON alerts(priority);
CREATE INDEX IF NOT EXISTS idx_alert_history_user_session ON alert_history(user_id, session_date);
CREATE INDEX IF NOT EXISTS idx_alert_history_alert ON alert_history(alert_id);

-- Row Level Security
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for alerts
CREATE POLICY "Users can view own alerts"
  ON alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts"
  ON alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts"
  ON alerts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for alert_history
CREATE POLICY "Users can view own alert history"
  ON alert_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alert history"
  ON alert_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for alert_settings
CREATE POLICY "Users can view own alert settings"
  ON alert_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alert settings"
  ON alert_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alert settings"
  ON alert_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER alerts_updated_at_trigger
  BEFORE UPDATE ON alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_alerts_updated_at();

CREATE TRIGGER alert_settings_updated_at_trigger
  BEFORE UPDATE ON alert_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_alerts_updated_at();
