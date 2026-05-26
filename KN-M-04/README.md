# KN-M-04 — Datenmanipulation und Abfragen II

Voraussetzung: KN-M-03 `insertData.js` wurde ausgeführt.

## A) Aggregationen — [`aggregations.js`](./aggregations.js)

1. Gleicher UND-Filter wie KN-M-03 C5, aber als zwei `$match`-Stages hintereinander.
2. `$match` + `$project` (berechnetes Feld `name = first_name + " " + last_name`) + `$sort` absteigend nach Ranglistenpunkten.
3. `$group` + `$sum: 1` → Anzahl Matches pro Turnier (count).
4. `$group` + `$avg` → Durchschnittliche Ranglistenpunkte pro Geschlecht.

Screenshot: [x_res/aggregations_output.png](./x_res/aggregations_output.png).

## B) Join-Aggregation — [`joins.js`](./joins.js)

- `matches` → `$lookup` auf `tournaments` und `clubs` → flacher Output mit Feldern aus drei Collections.
- `players` → `$lookup` auf `tournaments.participants` → "Anzahl Turniere pro Spieler".

Screenshot: [x_res/joins_output.png](./x_res/joins_output.png).

## C) Unter-Dokumente / Arrays — [`subdocs.js`](./subdocs.js)

- **Nur Sub-Doc-Felder anzeigen**: `clubs.courts.surface`, `clubs.courts.indoor`.
- **Filter nach Sub-Doc-Feld**: Clubs mit `"courts.indoor": true`.
- **`$unwind`**: Courts aus dem Array herauslösen → eine Zeile pro Court.

Screenshot: [x_res/subdocs_output.png](./x_res/subdocs_output.png).
