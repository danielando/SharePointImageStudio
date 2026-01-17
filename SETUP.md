# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (this takes about 2 minutes)
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the entire contents of `supabase-schema.sql`
6. Click **Run** to execute the SQL

## Step 3: Get API Keys

### Supabase Keys

1. In your Supabase project, go to **Settings** > **API**
2. Copy the **Project URL**
3. Copy the **anon public** key

### Nano Banana Pro Key

1. Go to [novita.ai](https://novita.ai)
2. Sign up for a free account
3. Go to **API Keys** section
4. Create a new API key
5. Copy the key

## Step 4: Configure Environment Variables

1. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

2. Edit `.env` and add your keys:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_NANO_BANANA_API_KEY=your-nano-banana-key-here
```

## Step 5: Run the Application

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Step 6: Create Your Account

1. Click **Sign Up**
2. Enter your email and password
3. Sign in

You're ready to start generating images!

## Troubleshooting

### Database errors

- Make sure you ran the entire `supabase-schema.sql` file
- Check that Row Level Security (RLS) is enabled
- Verify all tables were created in the **public** schema

### Storage errors

- Ensure the `elements` bucket was created
- Check that storage policies are in place
- Verify the bucket is set to public

### API errors

- Confirm your Nano Banana API key is valid
- Check you have API credits available
- Look in the browser console for detailed error messages

## Next Steps

- Add your company logo as an element
- Try generating a Hero web part image
- Experiment with different prompts
- Use `@elementname` to reference your saved elements
