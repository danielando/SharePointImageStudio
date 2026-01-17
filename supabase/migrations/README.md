# Supabase Database Migrations

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended for now)

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy the entire contents of `001_auth_and_credits.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

### Option 2: Supabase CLI (Future)

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

## Migration Files

### 001_auth_and_credits.sql

This migration sets up the database schema for:

- **User Authentication**: Azure AD integration
- **Subscription Management**: Free, Basic, Pro tiers
- **Usage Tracking**: Monthly image limits and counters
- **Billing Periods**: Personal monthly cycles starting on signup
- **Audit Logs**: Track all user actions
- **Security**: Row Level Security (RLS) policies

**Tables Created/Modified:**
- `users` - Updated with subscription fields
- `image_generations` - Renamed from `generations`, added resolution tracking
- `usage_logs` - New table for audit trail

**Functions Created:**
- `check_and_reset_monthly_usage()` - Check limits and reset if period expired
- `increment_user_usage()` - Increment usage counter
- `update_user_subscription()` - Update tier (for Stripe webhooks)

## After Running Migration

1. Verify tables exist in **Table Editor**
2. Check **Database** → **Policies** to confirm RLS is enabled
3. Test the functions in SQL Editor:

```sql
-- Test check_and_reset_monthly_usage
SELECT * FROM check_and_reset_monthly_usage('user-id-here');

-- Test increment_user_usage
SELECT increment_user_usage('user-id-here', 1);
```

## Next Steps

After migration is complete:
1. Set up Azure AD authentication
2. Install MSAL packages: `npm install @azure/msal-react @azure/msal-browser`
3. Configure environment variables
4. Implement authentication flow
