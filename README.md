# Eat to live

Our Coop shopping tick list as an installable iPhone web app.
Untick what you need, tick it when it's in the cart. Grouped by Coop aisle, shopping mode,
"usually due" suggestions from purchase history, and live sync for the whole family.

## One-time setup

### 1. Supabase (database + sign-in)
1. Create a free project at supabase.com.
2. SQL Editor → run `supabase/schema.sql`, then `supabase/seed.sql`.
3. Add each family member:
   ```sql
   insert into public.members (email, display_name) values
     ('you@example.com', 'Cenk'),
     ('partner@example.com', 'Name');
   ```
4. Authentication → Email Templates → **Magic Link**: put the code in the email body, e.g.
   `<p>Your code: <strong>{{ .Token }}</strong></p>`
   (Installed iPhone apps can't open sign-in links, so the app signs in with the code.)
5. Project Settings → API: copy the Project URL and the `anon` public key into `config.js`.

Supabase's built-in mailer sends only a few emails per hour, which is fine for a family.

### 2. Hosting (GitHub Pages)
Repo Settings → Pages → Deploy from branch → `main` / root. The app is then at
`https://<user>.github.io/coop-list/`.

### 3. Install on iPhone
Open the address in Safari → Share → **Add to Home Screen**. Sign in with your email code once.

## Files
- `index.html`, `style.css`, `app.js`: the app
- `config.js`: Supabase URL + anon key (public by design; access is enforced by row-level security)
- `sw.js`, `manifest.webmanifest`, `icons/`: offline support and home-screen icon
- `supabase/schema.sql`: tables, access rules, realtime
- `supabase/seed.sql`: the current list with purchase history from receipts
