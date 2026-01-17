# Deployment Checklist

Use this checklist before deploying SharePoint Image Studio to production.

## Pre-Deployment

### 1. Environment Setup ✅

- [ ] Supabase project created
- [ ] Database schema deployed (`supabase-schema.sql`)
- [ ] Storage bucket `elements` created and configured as public
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Nano Banana Pro API key obtained from Novita AI
- [ ] `.env` file configured with all three keys:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_NANO_BANANA_API_KEY`

### 2. Local Testing ✅

- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts development server
- [ ] Can sign up new user
- [ ] Can sign in as existing user
- [ ] Can create element
- [ ] Can generate image
- [ ] Can download image
- [ ] `npm run build` completes successfully
- [ ] `npm run preview` works with built version

### 3. Code Quality ✅

- [ ] No TypeScript errors (`npm run build`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Build size is reasonable (< 500 KB)

## Deployment Steps

### Option A: Vercel (Recommended)

1. Install Vercel CLI
   ```bash
   npm i -g vercel
   ```

2. Run deployment
   ```bash
   vercel
   ```

3. Add environment variables in Vercel Dashboard
   - Go to Project Settings > Environment Variables
   - Add all three `VITE_*` variables
   - Set for Production, Preview, and Development

4. Redeploy to apply environment variables
   ```bash
   vercel --prod
   ```

### Option B: Netlify

1. Build the project
   ```bash
   npm run build
   ```

2. Deploy to Netlify
   ```bash
   netlify deploy --prod --dir=dist
   ```

3. Add environment variables in Netlify
   - Go to Site Settings > Build & Deploy > Environment
   - Add all three `VITE_*` variables

4. Trigger a rebuild

### Option C: Manual/Other Hosts

1. Build
   ```bash
   npm run build
   ```

2. Upload `dist/` folder contents to your hosting

3. Configure environment variables on your hosting platform

4. Ensure the host supports SPA routing (redirects to index.html)

## Post-Deployment

### 1. Smoke Tests

- [ ] Visit deployed URL
- [ ] Sign up creates new user in Supabase
- [ ] Sign in works
- [ ] Elements can be created
- [ ] Image generation works
- [ ] Generated images appear in gallery
- [ ] Download button works
- [ ] Preview modal opens
- [ ] Navigation arrows work in preview

### 2. Performance Checks

- [ ] Page loads in < 3 seconds
- [ ] Images load properly
- [ ] No console errors in browser
- [ ] Mobile responsive design works

### 3. Security Verification

- [ ] Environment variables not exposed in client bundle
- [ ] Supabase RLS policies are active
- [ ] Users can only see their own data
- [ ] Storage policies prevent unauthorized access

## Environment Variables Reference

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Nano Banana Pro (Novita AI)
VITE_NANO_BANANA_API_KEY=your-api-key-here
```

## Common Deployment Issues

### Issue: "Missing environment variables"
**Solution**: Ensure all `VITE_*` variables are set in your hosting platform's environment settings

### Issue: "Authentication not working"
**Solution**:
- Check Supabase project is active
- Verify anon key is correct
- Check RLS policies are enabled

### Issue: "Images not generating"
**Solution**:
- Verify Nano Banana API key is valid
- Check API credits are available
- Look at browser console for detailed errors

### Issue: "Elements not saving"
**Solution**:
- Verify Supabase storage bucket exists
- Check storage policies allow uploads
- Ensure bucket is set to public

### Issue: "404 on refresh"
**Solution**: Configure your host for SPA routing
- **Vercel**: Automatically handled
- **Netlify**: Add `_redirects` file or configure in `netlify.toml`
- **Other**: Redirect all routes to `index.html`

## Monitoring

After deployment, monitor:

1. **Supabase Dashboard**
   - Database connections
   - Storage usage
   - Auth sessions

2. **Hosting Platform**
   - Build logs
   - Error logs
   - Traffic analytics

3. **Nano Banana API**
   - Usage credits
   - Request success rate

## Rollback Plan

If deployment fails:

1. **Vercel**: Redeploy previous version from dashboard
2. **Netlify**: Restore from deploy history
3. **Manual**: Restore previous `dist/` folder

## Next Steps After Deployment

- [ ] Test with real users
- [ ] Monitor error rates
- [ ] Collect user feedback
- [ ] Plan Phase 2 features (Brand Kit, SharePoint integration, etc.)

---

**Remember**: Never commit `.env` files to version control!

**Tip**: Use different Supabase projects for development and production.
