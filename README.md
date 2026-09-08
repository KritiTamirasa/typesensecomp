# typesensecomp
# Recipe Finder — Project Scope

**One-liner:** Snap a photo of your fridge/pantry, get matched recipes, and for anything you're missing, see the closest and cheapest place to get it (only if you've opted into buying more groceries).

## Core user flow

1. User uploads or takes a photo of their fridge and/or pantry (can be multiple photos).
2. Vision model extracts a list of detected ingredients from the photo(s).
3. That ingredient list becomes the query against a Typesense-indexed recipe database, ranked by how many ingredients match.
4. Results show as recipe cards: name, matched ingredients, missing ingredients, cook time.
5. User can toggle "willing to buy more groceries" ON.
6. When ON, for each missing ingredient in a selected recipe, search a grocery price index and return the closest/cheapest match (store name, price, distance).
7. When OFF, results are filtered/ranked to prioritize recipes with zero or few missing ingredients ("what can I make right now").

## MVP (must work for the demo)

- Photo upload → ingredient extraction (vision API).
- Ingredient list → Typesense recipe search, ranked by ingredient overlap.
- Recipe results page showing matched vs. missing ingredients per recipe.
- The "willing to buy groceries" toggle, with at least a basic version of missing-ingredient price lookup (dummy/sample data is fine).
- One clean end-to-end demo path: photo in → recipe out → toggle → cheapest ingredient shown.

## Stretch goals (only if MVP is solid with time left)

- Facet filters on recipes (cuisine, diet, cook time).
- Multiple store price comparison instead of just "closest/cheapest."
- Save/favorite recipes.
- Better UI polish (loading states, recipe images).

## Explicitly out of scope

- Real-time grocery store APIs / live pricing (use a fabricated or Kaggle-based price dataset instead).
- User accounts/login.
- Nutrition info, meal planning, shopping list export.
- Mobile app — web only, mobile-responsive if time allows.

## Tech stack

- Next.js (App Router) — frontend UI.
- FastAPI — ingredient extraction service.
- Typesense (Cloud free tier or Docker) — recipe search index and grocery price index.
- Vision API (Gemini / GPT-4o / Claude vision) — photo → ingredient list.
- Tailwind CSS — fast styling.

## Data needed

- **Recipe dataset:** Kaggle recipe dataset with ingredients + instructions (e.g. Food Ingredients and Recipe Dataset, or RecipeNLG), indexed into Typesense.
- **Grocery price dataset:** fabricated CSV, common ingredients x a few fake/sample stores x price, indexed into Typesense so a missing ingredient can be searched and sorted by price.

## Team

- **Jiya — Ingredient Input.** Photo upload UI, vision API integration, prompt tuning to get a clean ingredient list back. Deliverable: input a photo, output a JSON list of ingredients. Can be fully tested alone with Postman/curl before anyone else needs it.
- **Ab — Recipe Search Core.** This is the heart of the "solve with search" theme, so it's fair this person does the Typesense schema, loads and indexes the recipe dataset, builds the search/ranking logic, and builds the results UI (recipe cards, matched vs. missing ingredients). Deliverable: input an ingredient list, output ranked recipes.
- **Kriti — Grocery Price Feature.** Builds the price dataset (fabricated CSV), the second Typesense index for prices, the "willing to buy groceries" toggle UI, and the missing-ingredient price lookup logic. Deliverable: input a missing ingredient, output the closest/cheapest match.
