# Vercel + Supabase testing setup

## 1. Configure Supabase environment variables

In Vercel, open **Project -> Settings -> Environment Variables** and add:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase publishable key (or legacy anon key)

Copy the values from **Supabase -> Project Settings -> API**. Add them to **Preview** and **Production** as appropriate. Do not use a service-role/secret key in any `NEXT_PUBLIC_*` variable or in browser code.

## 2. Optional demo login button

The login page shows a **Use demo testing credentials** button only when all three variables are configured:

- `NEXT_PUBLIC_ENABLE_DEMO_LOGIN=true`
- `NEXT_PUBLIC_DEMO_EMAIL`: email of a demo user created in Supabase Authentication
- `NEXT_PUBLIC_DEMO_PASSWORD`: password for that dedicated demo user

These values are shipped to the browser. Use only a disposable demo account with synthetic data and restricted permissions. Do not enable this on Production or use a real administrator account. Prefer enabling it for Preview deployments only.

The demo user must already exist in **Supabase -> Authentication -> Users**. Creating environment variables does not create an Auth user or grant an application role.

## 3. Redeploy

After saving environment variables, trigger a new Vercel deployment. Environment variable changes do not update an already-built deployment.

## 4. Build-time reset-password fix

The reset-password page now creates its Supabase browser client after hydration instead of during render. This avoids initializing the browser client while Next.js prerenders that page. Correct Supabase environment variables are still required for authentication to work.

## 5. Local development

Copy `.env.example` to `.env.local`, replace the placeholders with your Supabase project values, and restart the development server.
