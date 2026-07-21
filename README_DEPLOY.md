# Deploying worldmaker-v2 — exact steps

This is a brand new project: new GitHub repo, new Cloudflare Worker named
`worldmaker-v2`, new D1 database named `worldmaker-v2-db` (already created, ID
`13dac6bc-8900-4287-bd97-1b49732c3f71`, currently empty — it self-seeds on first
request). None of this touches `nick-worldmaker`, `nick-worldmaker-api`, or
`worldmaker-db`.

## 1. One-time local setup

```
cd worldmaker-v2
npm install
npx wrangler login
```

`wrangler login` opens a browser tab — sign in with the Cloudflare account that owns
this database (the same one these MCP tools are connected to).

## 2. Set the three secrets

Run each of these; wrangler will prompt you to paste the value (nothing is typed on
the command line itself, so it won't end up in your shell history):

```
npx wrangler secret put SITE_PASSWORD
npx wrangler secret put SESSION_SECRET
npx wrangler secret put ANTHROPIC_API_KEY
```

- `SITE_PASSWORD` — whatever single password you want to gate the whole site with.
- `SESSION_SECRET` — any long random string, e.g. generate one with
  `openssl rand -hex 32` and paste that.
- `ANTHROPIC_API_KEY` — from https://console.anthropic.com/settings/keys. This is a
  different vendor and a different key than the old `nick-worldmaker-api` Worker,
  which called OpenAI — this project only calls Anthropic.

## 3. Deploy

```
npx wrangler deploy
```

This creates the `worldmaker-v2` Worker in your account (it doesn't exist until this
first deploy) and binds it to the `worldmaker-v2-db` database already set up in
`wrangler.toml`.

## 4. Verify it's alive

```
curl https://worldmaker-v2.<your-subdomain>.workers.dev/health
```

should return `{"ok":true,"service":"worldmaker-v2"}`. Wrangler prints the exact URL
after `deploy` finishes.

## 5. First visit

Open the URL from step 4 in a browser. You should see the front page. Click "Enter
Build HQ", enter the `SITE_PASSWORD` you set, and you should land on Build HQ with
capability 1 (Two settlers) marked done and capability 2 (Select a settler) marked
current, linking to Mission 4. The database self-seeds the four existing missions the
first time any logged-in page is requested — no manual migration step needed.

## 6. Custom domain (optional)

If you want this on a real domain instead of `*.workers.dev`, that's a Cloudflare
dashboard step (Workers & Pages → worldmaker-v2 → Settings → Domains & Routes) — tell
me the domain and I'll adjust anything in the code that assumes the request origin,
but the domain attachment itself has to happen in the dashboard under your login.

## Ongoing: redeploying after future changes

```
npx wrangler deploy
```

is all that's needed — no separate database migration step, because `ensureSeeded()`
only acts on a genuinely empty `missions` table, and `schema/schema.sql` statements
are all `IF NOT EXISTS`.
