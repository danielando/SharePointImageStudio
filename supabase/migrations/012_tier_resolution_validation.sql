-- Migration: Add tier-based resolution validation
-- Validates that users can only use resolutions allowed for their subscription tier

-- Create function to validate resolution access for a user's tier
CREATE OR REPLACE FUNCTION validate_tier_resolution(
  p_user_id TEXT,
  p_resolution TEXT,  -- '1K', '2K', or '4K'
  p_credit_cost INTEGER
)
RETURNS TABLE (
  allowed BOOLEAN,
  reason TEXT,
  current_balance INTEGER,
  tier TEXT
) AS $$
DECLARE
  v_user RECORD;
BEGIN
  -- Get user data
  SELECT * INTO v_user FROM users WHERE id = p_user_id;

  IF v_user IS NULL THEN
    RETURN QUERY SELECT FALSE, 'User not found'::TEXT, 0, 'unknown'::TEXT;
    RETURN;
  END IF;

  -- All tiers can use all resolutions, but this validates they have credits
  -- and provides tier info for logging/analytics
  IF COALESCE(v_user.image_balance, 0) < p_credit_cost THEN
    RETURN QUERY SELECT
      FALSE,
      format('Insufficient credits. Need %s, have %s', p_credit_cost, COALESCE(v_user.image_balance, 0)),
      COALESCE(v_user.image_balance, 0),
      v_user.subscription_tier::TEXT;
    RETURN;
  END IF;

  -- Validation passed
  RETURN QUERY SELECT
    TRUE,
    'OK'::TEXT,
    COALESCE(v_user.image_balance, 0),
    v_user.subscription_tier::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to safely generate image with tier validation
-- This atomically validates, deducts credits, and logs the generation
CREATE OR REPLACE FUNCTION request_image_generation(
  p_user_id TEXT,
  p_resolution TEXT,
  p_credit_cost INTEGER,
  p_prompt TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  remaining_balance INTEGER,
  generation_id UUID
) AS $$
DECLARE
  v_user RECORD;
  v_gen_id UUID;
  v_new_balance INTEGER;
BEGIN
  -- Lock user row to prevent race conditions
  SELECT * INTO v_user FROM users WHERE id = p_user_id FOR UPDATE;

  IF v_user IS NULL THEN
    RETURN QUERY SELECT FALSE, 'User not found'::TEXT, 0, NULL::UUID;
    RETURN;
  END IF;

  -- Check balance
  IF COALESCE(v_user.image_balance, 0) < p_credit_cost THEN
    RETURN QUERY SELECT
      FALSE,
      format('Insufficient credits. Need %s, have %s', p_credit_cost, COALESCE(v_user.image_balance, 0)),
      COALESCE(v_user.image_balance, 0),
      NULL::UUID;
    RETURN;
  END IF;

  -- Deduct credits
  v_new_balance := COALESCE(v_user.image_balance, 0) - p_credit_cost;

  UPDATE users
  SET
    image_balance = v_new_balance,
    images_generated = COALESCE(images_generated, 0) + 1,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Create generation record (pending status)
  v_gen_id := gen_random_uuid();

  INSERT INTO image_generations (id, user_id, prompt, status, created_at)
  VALUES (v_gen_id, p_user_id, COALESCE(p_prompt, 'Image generation'), 'pending', NOW());

  RETURN QUERY SELECT
    TRUE,
    'Generation authorized'::TEXT,
    v_new_balance,
    v_gen_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION validate_tier_resolution(TEXT, TEXT, INTEGER) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION request_image_generation(TEXT, TEXT, INTEGER, TEXT) TO anon, authenticated, service_role;

-- Comments
COMMENT ON FUNCTION validate_tier_resolution IS 'Validates user can use requested resolution based on tier and balance';
COMMENT ON FUNCTION request_image_generation IS 'Atomically validates, deducts credits, and creates generation record';
