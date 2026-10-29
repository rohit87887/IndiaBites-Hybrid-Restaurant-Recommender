# Swapping in a real restaurant dataset

The site currently runs on **sample data** in `data/restaurants.js`. Restaurant
names are fictional; ratings, review counts, prices, descriptions and dishes are
generated for demonstration and describe no real business. Cities, localities and
PIN codes are real so that location search behaves realistically.

Street addresses, phone numbers, opening hours and map coordinates were
deliberately **not** generated. The details page shows an explicit
"not available for sample listings" state for those fields instead.

## Required record shape

Replace the `RESTAURANTS` array with records of this shape:

```js
{
  id:        "r001",              // unique string
  name:      "Restaurant name",
  city:      "Chennai",           // must appear in the CITIES array
  locality:  "T. Nagar",
  pin:       "600017",
  cuisines:  ["South Indian","Tamil"],   // values must appear in CUISINES
  cost:      220,                 // ₹ per person, integer
  rating:    4.4,                 // 0–5
  reviews:   1840,                // integer
  diet:      { veg:true, nonVeg:false, vegan:true, jain:true, halal:false },
  facilities:["family","dine-in","takeaway","delivery"],
  // allowed: family, dine-in, takeaway, delivery, outdoor, cafe, fine-dining
  ambience:  ["casual","traditional"],
  // allowed: casual, traditional, modern, quiet, lively
  desc:      "One-line description.",
  dishes:    ["Dish one","Dish two"]
}
```

`CUISINES`, `CITIES` and `BUDGET_BANDS` at the bottom of the same file drive the
filter controls — extend them if your dataset introduces new values.

## Converting a Kaggle export

A Zomato/Swiggy CSV typically needs these transformations:

| CSV column | Target field | Note |
|---|---|---|
| `restaurant_name` | `name` | |
| `city` | `city` | must match `CITIES`, else add it |
| `locality` / `area` | `locality` | |
| `cuisines` | `cuisines` | split on `,`, map to the `CUISINES` vocabulary |
| `approx_cost_for_two` | `cost` | **halve it** — this site stores cost *per person* |
| `aggregate_rating` | `rating` | drop rows where this is `NEW` or `-` |
| `votes` / `review_count` | `reviews` | |
| — | `diet` | derive from cuisine//name keywords, or default all false |

Rows with a missing rating or cost should be dropped rather than imputed —
the collaborative arm treats rating as ground truth.

## Removing the sample-data labelling

Once real, verified data is in place, remove:

1. The `.sample-banner` div at the top of `index.html`, `explore.html`,
   `restaurant.html`, `about.html` and `papers.html`.
2. The `.foot-note` paragraph in `footerHTML()` in `js/app.js`, and the same
   markup hard-coded in the footers of `about.html` and `papers.html`.
3. The `<span class="sample-tag">Sample listing</span>` and per-dish
   `Sample` tags in `js/restaurant.js`.
4. The "Address, hours & contact" `.unverified` block in `js/restaurant.js`,
   replacing it with the real fields.

Leave all of it in place while any part of the dataset is still generated.

## The synthetic rating matrix

`js/recommender.js` generates 400 synthetic user profiles to populate the
user×item matrix the collaborative arm needs, because public restaurant
catalogues carry no per-user rating history. This mirrors the synthetic fallback
layer described in the project write-up.

If you obtain real interaction data, replace the `CollabModel` IIFE's rating
generation loop with your own `ratings` array — the item-item similarity
computation below it needs no changes.
