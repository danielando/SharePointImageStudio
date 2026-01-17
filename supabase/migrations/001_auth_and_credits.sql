-- SharePoint Image Studio - Authentication & Credit Management Migration
-- Run this in Supabase SQL Editor

-- 1. Update users table with authentication and subscription fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS azure_ad_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_image_limit INTEGER DEFAULT 3;
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_images_used INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_period_start TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_period_end TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. Rename generations table to image_generations and add new fields
ALTER TABLE generations RENAME TO image_generations;
ALTER TABLE image_generations ADD COLUMN IF NOT EXISTS resolution TEXT DEFAULT '2K' CHECK (resolution IN ('2K', '4K'));
ALTER TABLE image_generations ADD COLUMN IF NOT EXISTS variations_count INTEGER DEFAULT 1;
ALTER TABLE image_generations ADD COLUMN IF NOT EXISTS cost_in_credits INTEGER DEFAULT 1;

-- 3. Create usage_logs table for analytics and audit trail
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('image_generation', 'variation_created', 'tier_upgrade', 'tier_downgrade')),
  credits_used INTEGER NOT NULL DEFAULT 0,
  tier_at_time TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_azure_ad_id ON users(azure_ad_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_image_generations_user_id ON image_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_image_generations_created_at ON image_generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at DESC);

-- 5. Add Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can view their own image generations
DROP POLICY IF EXISTS "Users can view own generations" ON image_generations;
CREATE POLICY "Users can view own generations" ON image_generations
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own image generations
DROP POLICY IF EXISTS "Users can create generations" ON image_generations;
CREATE POLICY "Users can create generations" ON image_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own image generations
DROP POLICY IF EXISTS "Users can delete own generations" ON image_generations;
CREATE POLICY "Users can delete own generations" ON image_generations
  FOR DELETE USING (auth.uid() = user_id);

-- Users can view their own usage logs
DROP POLICY IF EXISTS "Users can view own usage logs" ON usage_logs;
CREATE POLICY "Users can view own usage logs" ON usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- 6. Create helper function to check and reset monthly usage
CREATE OR REPLACE FUNCTION check_and_reset_monthly_usage(p_user_id UUID)
RETURNS TABLE (
  can_generate BOOLEAN,
  images_remaining INTEGER,
  tier TEXT
) AS $$
DECLARE
  v_user RECORD;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  SELECT * INTO v_user FROM users WHERE id = p_user_id;

  -- If billing period has ended, reset usage
  IF v_user.billing_period_end IS NULL OR v_now > v_user.billing_period_end THEN
    UPDATE users
    SET
      monthly_images_used = 0,
      billing_period_start = v_now,
      billing_period_end = v_now + INTERVAL '1 month'
    WHERE id = p_user_id;

    v_user.monthly_images_used := 0;
  END IF;

  -- Return usage status
  RETURN QUERY SELECT
    (v_user.monthly_images_used < v_user.monthly_image_limit) AS can_generate,
    (v_user.monthly_image_limit - v_user.monthly_images_used) AS images_remaining,
    v_user.subscription_tier AS tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to increment usage after generation
CREATE OR REPLACE FUNCTION increment_user_usage(
  p_user_id UUID,
  p_credits_used INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  v_success BOOLEAN;
BEGIN
  UPDATE users
  SET monthly_images_used = monthly_images_used + p_credits_used
  WHERE id = p_user_id
    AND monthly_images_used < monthly_image_limit;

  GET DIAGNOSTICS v_success = ROW_COUNT;
  RETURN v_success > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create function to update user tier (for Stripe webhooks)
CREATE OR REPLACE FUNCTION update_user_subscription(
  p_user_id UUID,
  p_tier TEXT,
  p_stripe_customer_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_limit INTEGER;
BEGIN
  -- Set monthly limit based on tier
  v_limit := CASE p_tier
    WHEN 'free' THEN 3
    WHEN 'basic' THEN 50
    WHEN 'pro' THEN 150
    ELSE 3
  END;

  UPDATE users
  SET
    subscription_tier = p_tier,
    monthly_image_limit = v_limit,
    stripe_customer_id = COALESCE(p_stripe_customer_id, stripe_customer_id),
    billing_period_start = NOW(),
    billing_period_end = NOW() + INTERVAL '1 month',
    monthly_images_used = 0  -- Reset on tier change
  WHERE id = p_user_id;

  -- Log the tier change
  INSERT INTO usage_logs (user_id, action_type, credits_used, tier_at_time, metadata)
  VALUES (
    p_user_id,
    CASE
      WHEN p_tier > (SELECT subscription_tier FROM users WHERE id = p_user_id) THEN 'tier_upgrade'
      ELSE 'tier_downgrade'
    END,
    0,
    p_tier,
    jsonb_build_object('new_tier', p_tier, 'new_limit', v_limit)
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE users IS 'User accounts with subscription and usage tracking';
COMMENT ON TABLE image_generations IS 'AI-generated images for SharePoint';
COMMENT ON TABLE usage_logs IS 'Audit trail for user actions and billing';
COMMENT ON FUNCTION check_and_reset_monthly_usage IS 'Check if user can generate images and reset monthly usage if period expired';
COMMENT ON FUNCTION increment_user_usage IS 'Increment user usage counter after successful generation';
COMMENT ON FUNCTION update_user_subscription IS 'Update user subscription tier (called by Stripe webhooks)';
