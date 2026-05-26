# KN-M-03 — Datenmanipulation und Abfragen I

Datenbank: `padel` (siehe KN-M-02). Alle Scripts via:
```bash
docker exec -i m165-mongo mongosh -u admin -p 'm165AdminPass!' --authenticationDatabase admin --quiet < <script.js>
```

## A) Daten hinzufügen — [`insertData.js`](./insertData.js)

- Verwendet `ObjectId()` für alle `_id`s.
- Alle IDs als Variablen, keine hartcodierten Strings.
- `clubs`, `players`, `matches` → `insertMany()`.
- `tournaments` → `insertOne()` (dreimal).

Screenshot: [x_res/insert_output.png](./x_res/insert_output.png).

## B) Daten löschen

- **Alle Collections droppen**: [`dropAll.js`](./dropAll.js) — iteriert über `getCollectionNames()` und ruft `drop()`.
- **Teilweise löschen**: [`deletePartial.js`](./deletePartial.js)
  - `deleteOne()` mit `_id`-Filter (ein Match).
  - `deleteMany()` mit `$or` über zwei `_id`'s (zwei Spieler).

Screenshot: [x_res/delete_output.png](./x_res/delete_output.png).

## C) Daten abfragen — [`queries.js`](./queries.js)

Erfüllt alle Bedingungen:

| # | Collection | Bedingung |
|---|---|---|
| 1 | clubs | einfacher Filter |
| 2 | players | **Regex** (`last_name` enthält "meier", case-insensitive) |
| 3 | tournaments | **DateTime-Filter** (`start_date >= 2025-05-01`) |
| 4 | players | **ODER** (`gender=F` ODER `ranking>=1800`) + **Projektion mit `_id`** |
| 5 | matches | **UND** (`court_number=1` AND `played_at>=2025-06-01`) + **Projektion ohne `_id`** |

Screenshot: [x_res/queries_output.png](./x_res/queries_output.png).

## D) Daten verändern — [`updates.js`](./updates.js)

| Befehl | Collection | Filter |
|---|---|---|
| `updateOne()` | players | `_id` + `$inc` Ranglistenpunkte |
| `updateMany()` | tournaments | `$or` über `category` Bronze/Silber, +10% Preisgeld |
| `replaceOne()` | clubs | Komplett-Ersatz des Lugano-Clubs |

Screenshot: [x_res/updates_output.png](./x_res/updates_output.png).
