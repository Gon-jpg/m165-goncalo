# KN-M-07 — Programmierung mit MongoDB

Zugriff auf die `padel`-Datenbank via offiziellem **Node.js-Treiber** (`mongodb` npm-Paket).

## Aufbau

- [`app.js`](./app.js) — Verbindet, zählt Dokumente, liest Top-3-Spieler und führt eine `$lookup`-Aggregation aus.
- [`package.json`](./package.json) — Dependency: `mongodb@^6`.

## Ausführung

```bash
cd KN-M-07
npm install
node app.js
```

## Output

```
players      = 6
clubs        = 3
tournaments  = 3
matches      = 4

Top 3 Spieler:
  Emilio Rossi — 2050 pts
  Carlos Almeida — 1875 pts
  Beatriz Sousa — 1580 pts

Matches pro Turnier:
  Swiss Padel Open 2025        2
  Spring Cup Zürich            1
  Junior Trophy Lugano         1
```

Screenshot: [x_res/driver_output.png](./x_res/driver_output.png).

## Was gelernt

- `MongoClient` aus dem `mongodb`-Paket akzeptiert dieselbe Connection-URI wie `mongosh`.
- Cursor-basierte Reads: `.find().sort().limit().toArray()` für kleine Resultate, oder `for await (const doc of cursor)` für grosse.
- Aggregationen sind identisch zur Shell — der Treiber leitet die Pipeline 1:1 weiter.
- BSON-Typen werden automatisch in JS-Equivalents übersetzt (`ObjectId`, `Date`).
