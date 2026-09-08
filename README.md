# 🧊 Fridge → Recipes → Groceries

Upload a photo of your fridge → a vision model detects the ingredients →
**Typesense** ranks recipes by how much of each you already have → for a chosen
recipe, **Typesense geo-search** finds nearby stores that stock the missing items.

Typesense is the core of the app: full-text search, typo tolerance, synonyms,
faceting, filtering and geo-search all run against two collections (`recipes`,
`stores`). The FastAPI backend owns the Typesense API key — the browser never
talks to Typesense directly.

```
frontend/  React + TypeScript (Vite)     → talks only to the backend
backend/   FastAPI (Python)               → owns Typesense creds + vision layer
scripts/   seed_typesense.py + seed data  → creates schemas, imports 17 recipes / 8 stores
docker-compose.yml                         → Typesense 30.1 on :8108
```

---

## Prerequisites

- Docker (for Typesense)
- Python 3.11+
- Node 18+

---

## 1. Start Typesense

```bash
docker compose up -d
curl http://localhost:8108/health          # {"ok":true}
```

## 2. Configure environment

```bash
cp .env.example .env                       # backend + seed script config
cp frontend/.env.example frontend/.env     # frontend config
```

Everything works out of the box with **no API keys** — the vision layer falls
back to a mocked ingredient list. To use a real vision model, set one key in
`.env` (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, or `GEMINI_API_KEY`) and,
optionally, `VISION_PROVIDER`.

## 3. Backend + seed

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# create collections, import recipes/stores, register synonyms
python ../scripts/seed_typesense.py

# run the API
uvicorn app.main:app --reload --port 8000
```

Check it: <http://localhost:8000/health> and <http://localhost:8000/docs>.

## 4. Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

Open <http://localhost:5173>, drop in any image, and walk the flow.

---

## Environment variables

| Where | Variable | Default | Purpose |
|---|---|---|---|
| `.env` | `TYPESENSE_HOST` / `_PORT` / `_PROTOCOL` / `_API_KEY` | `localhost` / `8108` / `http` / `xyz` | Typesense connection (matches `docker-compose.yml`) |
| `.env` | `VISION_PROVIDER` | `auto` | `auto` \| `mock` \| `anthropic` \| `openai` \| `gemini` |
| `.env` | `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `GEMINI_API_KEY` | — | pick one to enable a real vision model |
| `.env` | `ANTHROPIC_VISION_MODEL` | `claude-opus-5` | override the model per provider |
| `.env` | `FALLBACK_LAT` / `FALLBACK_LNG` | Bangalore | used by `/find-stores` when the client sends no coords |
| `.env` | `CORS_ORIGINS` | `localhost:5173` | comma-separated allowed origins |
| `frontend/.env` | `VITE_API_BASE` | `http://localhost:8000` | backend base URL |
| `frontend/.env` | `VITE_FALLBACK_LAT` / `_LNG` | Bangalore | used when the browser denies geolocation |

---

## API

| Method | Path | Body / params | Notes |
|---|---|---|---|
| `GET` | `/health` | — | Typesense connectivity, indexed collections, active vision provider |
| `POST` | `/analyze-fridge` | `multipart: image` | returns `{provider, ingredients, raw_ingredients}` |
| `POST` | `/search-recipes` | `{ingredients[], query?, cuisine?, max_cooking_time?, tags[]}` | ranked recipe cards + facets |
| `GET` | `/recipes/{id}` | — | raw Typesense document |
| `POST` | `/find-stores` | `{ingredients[], lat?, lng?, radius_km?, require_all?}` | geo-sorted stores + per-store carry/missing |

### Recipe ranking

Typesense retrieves candidates (full-text query when text is given, otherwise the
whole catalogue). The backend then scores each recipe by ingredient overlap:

```
match_score = owned_required_ingredients / total_required_ingredients
```

Cards are sorted by `match_score`, then fewest missing ingredients, then Typesense
text relevance. Free-text queries like `"high protein dinner"`, `"Italian"`,
`"something with tomatoes"`, `"under 30 minutes"` also work (the last one is
parsed into a `cooking_time` filter).

### Typesense features in use

- **Full-text search** across `name, description, ingredients, tags, cuisine`
- **Typo tolerance** (`num_typos: 2`)
- **Synonyms** — a `fridge-synonyms` synonym set (v28+ API) attached to both
  collections: `bell pepper ↔ capsicum`, `cilantro ↔ coriander`,
  `scallion ↔ green onion`, `chickpea ↔ garbanzo bean`, `eggplant ↔ aubergine`,
  plus a few more (`zucchini/courgette`, `shrimp/prawn`, `yogurt/curd`, …)
- **Filtering** on `cuisine`, `cooking_time`, `tags`
- **Facets** on `cuisine`, `tags`, `cooking_time` (returned to the UI)
- **Geo-search** — `filter_by: location:(lat,lng,radius km)` +
  `sort_by: location(lat,lng):asc` on `stores`, with `inventory` array filtering
- **Ranking** — `default_sorting_field: cooking_time`, `prioritize_exact_match`

Vector / semantic search was intentionally left out to keep the MVP stable; the
synonym set covers the "capsicum vs bell pepper" class of misses. Adding a
Typesense auto-embedding field to `recipes` is the clean next step (see below).

---

## The vision layer

`backend/app/vision/` defines a `VisionProvider` interface with implementations
for `mock`, `anthropic`, `openai`, `gemini`. `factory.py` picks one from
`VISION_PROVIDER` (or auto-detects from whichever key is set) and **falls back to
`mock` on any error** (missing key, missing SDK, API failure) so a demo never
breaks. `openai` and `gemini` SDKs are commented out in `requirements.txt` —
uncomment to use them.

---

## What is mocked / seeded

| Thing | Status |
|---|---|
| Fridge ingredient detection | **Mocked by default** (fixed 13-ingredient list). Real Claude/OpenAI/Gemini vision if a key is set. |
| Recipes | 17 hand-written realistic recipes in `scripts/data/recipes.json` |
| Stores | 8 mock Bangalore grocery stores with real-ish coordinates + varied inventories in `scripts/data/stores.json` |
| Store inventory | Seeded manually; `/find-stores` filters stores by whether their `inventory` array carries the missing ingredients |
| Auth / deployment | Not implemented (hackathon scope) |

---

## Suggested next steps for the demo

1. **Real vision** — set `ANTHROPIC_API_KEY` and demo with an actual fridge photo.
2. **Facet UI** — the `/search-recipes` response already returns `facets`; wire
   up clickable cuisine / time / tag filters on the results page.
3. **Semantic search** — add an auto-embedding field to the `recipes` schema
   (`{"name":"embedding","type":"float[]","embed":{"from":["name","description","ingredients"],"model_config":{"model_name":"ts/all-MiniLM-L12-v2"}}}`)
   and switch `/search-recipes` text queries to hybrid search.
4. **"Cheapest" store** — add a `prices` map to store inventory and sort by price
   as well as distance (matches the original scope's grocery-price feature).
5. **Multi-photo upload** — accept several images in `/analyze-fridge` and union
   the detected ingredients.

---

## Original project scope

<details>
<summary>Recipe Finder — original scope notes (kept from the initial commit)</summary>

**One-liner:** Snap a photo of your fridge/pantry, get matched recipes, and for
anything you're missing, see the closest and cheapest place to get it (only if
you've opted into buying more groceries).

**Core user flow**

1. User uploads or takes a photo of their fridge and/or pantry (can be multiple photos).
2. Vision model extracts a list of detected ingredients from the photo(s).
3. That ingredient list becomes the query against a Typesense-indexed recipe database, ranked by how many ingredients match.
4. Results show as recipe cards: name, matched ingredients, missing ingredients, cook time.
5. User can toggle "willing to buy more groceries" ON.
6. When ON, for each missing ingredient in a selected recipe, search a grocery price index and return the closest/cheapest match (store name, price, distance).
7. When OFF, results are filtered/ranked to prioritize recipes with zero or few missing ingredients.

**Explicitly out of scope:** real-time grocery APIs / live pricing, user
accounts/login, nutrition info, meal planning, shopping-list export, native
mobile app.

**Team**

- **Jiya** — Ingredient input: photo upload UI, vision API integration, prompt tuning.
- **Ab** — Recipe search core: Typesense schema, dataset indexing, search/ranking logic, results UI.
- **Kriti** — Grocery price feature: fabricated price dataset, second Typesense index, "willing to buy" toggle, missing-ingredient price lookup.

</details>
