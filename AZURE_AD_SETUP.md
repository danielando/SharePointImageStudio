# Azure AD Setup Guide

## Setting up Microsoft Azure AD Authentication

Follow these steps to create an Azure AD app registration for SharePoint Image Studio.

### Step 1: Access Azure Portal

1. Go to [https://portal.azure.com](https://portal.azure.com)
2. Sign in with your Microsoft account

### Step 2: Navigate to Azure Active Directory

1. In the Azure Portal, search for **"Azure Active Directory"** in the top search bar
2. Click on **Azure Active Directory** from the results

### Step 3: Create App Registration

1. In the left sidebar, click **App registrations**
2. Click **+ New registration** at the top
3. Fill in the registration form:

   **Name:**
   ```
   SharePoint Image Studio
   ```

   **Supported account types:**
   - Select: **"Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)"**
   - This allows anyone with a Microsoft 365 or personal Microsoft account to sign in

   **Redirect URI:**
   - Platform: **Web**
   - URL: `http://localhost:5173`

4. Click **Register**

### Step 4: Configure the App

After registration, you'll be on the app's overview page. Note down:

1. **Application (client) ID** - You'll need this for your `.env` file
2. **Directory (tenant) ID** - Keep this as `common` for multitenant

### Step 5: Add Redirect URIs

1. In the left sidebar, click **Authentication**
2. Under **Web** platform, add these redirect URIs:
   - `http://localhost:5173` (for local development)
   - `https://www.sharepointimagestudio.com` (for production)
3. Scroll down to **Implicit grant and hybrid flows** and check:
   - ✅ **ID tokens** (used for implicit and hybrid flows)
4. Click **Save**

### Step 6: Configure API Permissions

1. In the left sidebar, click **API permissions**
2. You should see **Microsoft Graph > User.Read** already added
3. If not, click **+ Add a permission**:
   - Select **Microsoft Graph**
   - Select **Delegated permissions**
   - Search for and select **User.Read**
   - Click **Add permissions**
4. Click **Grant admin consent for [Your Organization]** (if available)
   - If you don't have admin rights, users will see a consent prompt on first login

### Step 7: Update Your .env File

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the Azure AD values in `.env`:
   ```env
   VITE_AZURE_AD_CLIENT_ID=your-application-client-id-from-step-4
   VITE_AZURE_AD_TENANT_ID=common
   VITE_AZURE_AD_REDIRECT_URI=http://localhost:5173
   ```

### Step 8: Update Vercel Environment Variables (for production)

Once you deploy to production:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add these variables:
   - `VITE_AZURE_AD_CLIENT_ID` = your client ID (55f5342b-d3a3-442b-ba1e-0a5adc18daf4)
   - `VITE_AZURE_AD_TENANT_ID` = common
   - `VITE_AZURE_AD_REDIRECT_URI` = https://www.sharepointimagestudio.com
5. Redeploy your application

## Testing Authentication

After completing setup:

1. Restart your development server: `npm run dev`
2. Click the "Login" button
3. You should be redirected to Microsoft's login page
4. Sign in with your Microsoft 365 or personal Microsoft account
5. Grant consent to the requested permissions
6. You should be redirected back to your app, now logged in

## Troubleshooting

### "AADSTS50011: The redirect URI specified in the request does not match"
- Make sure the redirect URI in your `.env` file exactly matches one configured in Azure AD
- Check for trailing slashes - `http://localhost:5173` vs `http://localhost:5173/`

### "User.Read permission not found"
- Go to API permissions in Azure AD
- Add Microsoft Graph > User.Read (Delegated)
- Grant admin consent if possible

### "Invalid client"
- Double-check your Client ID is correct in `.env`
- Make sure there are no extra spaces or quotes

## Security Notes

- Never commit your actual `.env` file to git (it's in `.gitignore`)
- Keep your Client ID confidential (though it's less sensitive than a secret)
- Use `common` tenant ID for multitenant support
- For production, always use HTTPS redirect URIs

## Next Steps

Once Azure AD is configured, the authentication flow will:
1. User clicks "Login"
2. Redirected to Microsoft login
3. User authenticates
4. Redirected back to app with auth token
5. App creates/updates user in Supabase
6. User assigned Free tier by default
7. User can start generating images
