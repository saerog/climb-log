# Climb Log: iPhone + Mac PWA with Supabase sync

## 1. Back up the original journal
Open your original `climb_log_mac.html` on the Mac/browser where you have saved sessions. Click **Export journal (JSON)** and keep the downloaded file safe. The old app's browser storage does **not** automatically transfer to the new web address.

## 2. Create Supabase project
At https://supabase.com create a free project. In **SQL Editor**, run the entire `supabase.sql` file. This creates a private per-user journal with row-level security.

## 3. Connect the app
In Supabase, find your **Project URL** and **publishable key** (or legacy **anon public** key) under Project Settings / API Keys. Edit `config.js` and paste both. **Never use the service_role or secret key in the app.**

## 4. Publish via GitHub Pages
Create a GitHub repository and upload all files from this folder to its root. Under **Settings → Pages**, choose **Deploy from a branch**, `main`, `/ (root)`. Wait for the HTTPS Pages URL, e.g. `https://YOURNAME.github.io/YOURREPO/`. Public repository code is visible; keep only the public key in config.js.

## 5. Configure authentication redirects
In Supabase **Authentication → URL Configuration**, set Site URL to your Pages URL and add that exact URL to **Redirect URLs**. In **Authentication → Providers → Email**, ensure email OTP/magic link is enabled. The free email sender may have rate limits; custom SMTP may be needed later.

## 6. Sign in and migrate
Visit your published HTTPS address in Safari on your iPhone and a browser on your Mac. Sign in with the **same email address** on both. Use **Import old journal (JSON)** once to bring in the backup from step 1. Wait until the app says **Synced ✓** before switching devices.

## 7. Add to iPhone Home Screen
In iPhone Safari, open the site → Share → **Add to Home Screen** → Add. It will launch like an app.

## Notes / limitations
- Offline changes are saved locally; cloud syncing needs internet and a successful sign-in.
- This simple single-record sync is intended for one person. Editing the *same* session on two devices at once can overwrite changes; sync before switching devices. Deletions on one device may reappear from another device because offline merges preserve entries. Avoid simultaneous edits, and export regular backups.
- Your email login may need to be completed in Safari rather than inside a Home Screen app. After login, reopen the Home Screen app; if it is not signed in, sign in there too.
- The app's JavaScript module is loaded from a CDN on first load; reliable full offline operation on first install is not guaranteed.
- GitHub Pages is free for public repositories; the app code is public but each journal is private via Supabase row-level security.
