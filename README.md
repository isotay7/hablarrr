# Hablarrr

A Mexican Spanish app for two missions: conversations with a partner's family, and getting around Mexico alone. Installable on iPad and iPhone as a PWA. Live at https://isotay7.github.io/hablarrr/.

## How it teaches

- **Start Here** (first on Home): the 50 most useful survival phrases, in order, 5 a day. Each phrase is a loop: hear it slowly with English, learn the sounds ("MOO-choh GOOS-toh"), say it out loud, a quick meaning quiz, then a two-line scene at a taco stand, hotel desk, gas station, market, or the family table. Whole phrases, no grammar yet. Each day ends with an FSRS review and a celebration.
- **Missions**: every phrase is tagged Family, Travel or Both, with a meter for each mission on Home. Stage 2 grows toward ~800 core words and phrases across both, most frequent first.
- **Unlocks**: dialogues open at 20 phrases, stories (and Solo español) at 50. Everything can be peeked at early.
- **Reader**: 10 family dialogues, 6 travel dialogues and 3 Bible story retellings, with tap-to-translate, word status, es-MX speech with karaoke highlighting, and culture notes.
- **Also**: Chill swipe feed, 15–20 min Focus mode, a weekly mission check that alternates family and travel scenarios, progress, offline support, backup export/import.

## Privacy

Real names never go in this repo. Content uses `{me}`, `{partner}`, `{mom}`, `{dad}` and `{sibling}`; the real names are typed in Settings and stored only in IndexedDB on the device.

## Develop

```bash
npm install
npm run dev            # http://localhost:3000
npm run check:content  # every word has a meaning, every phrase has a scene
npm run build          # static export to out/
```

Pushing to `main` deploys to GitHub Pages (`.github/workflows/deploy.yml`).

## Roadmap

- **Phase 2: voice conversation partner.** Claude plays someone at the table or on the road, speaks simple Mexican Spanish, and gently corrects you. Family roles (the parents with usted, the sibling with tú) and travel roles: waiter, hotel clerk, market vendor, gas station attendant, taxi driver, pharmacist. The spoken mission check runs on it. The API key stays on a small server (e.g. Vercel), never in the app.
- **Phase 3: accounts and sync** between iPad and iPhone (likely Supabase). Every record already has an id and `updatedAt` for last-write-wins sync.
