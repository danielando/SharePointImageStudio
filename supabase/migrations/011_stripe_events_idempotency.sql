-- Migration: Add Stripe events idempotency table
-- Prevents duplicate processing of webhook events

-- 1. Create table to track processed Stripe events
CREATE TABLE IF NOT EXISTS stripe_events (
  id TEXT PRIMARY KEY,  -- Stripe event ID (e.g., evt_xxx)
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  payload JSONB,  -- Store event data for debugging
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stripe_events_processed_at ON stripe_events(processed_at);
CREATE INDEX IF NOT EXISTS idx_stripe_events_event_type ON stripe_events(event_type);

-- 3. Create function to check and record processed event
CREATE OR REPLACE FUNCTION check_and_record_stripe_event(
  p_event_id TEXT,
  p_event_type TEXT,
  p_payload JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  -- Check if event already processed
  SELECT EXISTS(SELECT 1 FROM stripe_events WHERE id = p_event_id) INTO v_exists;

  IF v_exists THEN
    RAISE NOTICE 'Stripe event % already processed', p_event_id;
    RETURN FALSE;  -- Already processed
  END IF;

  -- Record the event
  INSERT INTO stripe_events (id, event_type, payload)
  VALUES (p_event_id, p_event_type, p_payload);

  RETURN TRUE;  -- New event, proceed with processing
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Grant permissions
GRANT SELECT, INSERT ON stripe_events TO service_role;
GRANT EXECUTE ON FUNCTION check_and_record_stripe_event(TEXT, TEXT, JSONB) TO service_role;

-- 5. Enable RLS (only service_role should access this)
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;

-- 6. Create policy for service_role
CREATE POLICY "Service role can manage stripe events"
  ON stripe_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 7. Add cleanup function for old events (optional, run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_stripe_events(p_days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM stripe_events
  WHERE processed_at < NOW() - (p_days_old || ' days')::INTERVAL;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION cleanup_old_stripe_events(INTEGER) TO service_role;

-- Comments
COMMENT ON TABLE stripe_events IS 'Tracks processed Stripe webhook events for idempotency';
COMMENT ON FUNCTION check_and_record_stripe_event IS 'Checks if event was processed, records it if new, returns true if should process';
COMMENT ON FUNCTION cleanup_old_stripe_events IS 'Removes old events older than specified days (default 90)';
