# KN-N-02 — Datenabfrage und -Manipulation (Neo4j)

Voraussetzung: Modell aus KN-N-01.

## A) Daten hinzufügen

Einzelnes grosses `CREATE`-Statement: [`insert.cypher`](./insert.cypher) — erzeugt 3 Clubs, 5 Courts, 5 Spieler, 3 Turniere, 4 Matches und alle Beziehungen.

Ausführung:
```bash
docker exec -i m165-neo4j cypher-shell -u neo4j -p m165NeoPass < insert.cypher
```

Screenshot: [x_res/insert.png](./x_res/insert.png).

## B) Daten abfragen

### Erklärung `MATCH (n) OPTIONAL MATCH (n)-[r]-(m) RETURN ...`

Das Standard-Statement, das in der Theorie verwendet wird, um alle Knoten und Kanten zu zeigen:

```cypher
MATCH (n)
OPTIONAL MATCH (n)-[r]-()
RETURN n, r;
```

- `MATCH (n)` matched **jeden** Knoten in der Datenbank.
- `OPTIONAL MATCH (n)-[r]-()` versucht, für jeden gematchten Knoten eine beliebige Kante zu finden. **Wichtig**: ein normales `MATCH` würde Knoten **ohne** Kanten herausfiltern. `OPTIONAL MATCH` verhält sich wie ein SQL LEFT JOIN — wenn keine Kante existiert, ist `r` einfach `null`, der Knoten bleibt aber im Resultat.
- `RETURN n, r` gibt beide Spalten zurück. Im Neo4j Browser wird daraus automatisch ein Graph gerendert.

Die `OPTIONAL`-Klausel ist also entscheidend, damit isolierte Knoten (z.B. ein neu erfasster Spieler ohne Match) nicht aus der Visualisierung verschwinden.

### Vier Szenarien — [`queries.cypher`](./queries.cypher)

| # | Anwendungsfall | Features |
|---|---|---|
| 1 | Spielerliste eines Clubs nach Ranking | `ORDER BY` |
| 2 | Lohnenswerte Turniere ab Mai 2025 | **`WHERE`** mit AND + Datumsvergleich |
| 3 | Siege auf Indoor-Courts | **`WHERE`** + Kanten-Attribut (`r.won`) + Knoten-Attribut |
| 4 | Head-to-head: Alex's Gegner pro Turnier | Multi-Hop, Filter `opp <> alex` |

Screenshot: [x_res/queries.png](./x_res/queries.png).

## C) Daten löschen — DETACH-Test

Selber Startknoten (Spielerin Diana), zwei Varianten:

**Ohne DETACH:**
```cypher
MATCH (p:Player {first_name: "Diana"}) DELETE p;
```
→ Fehler: `Cannot delete node<…>, because it still has relationships. To delete this node, you must first delete its relationships.`

**Mit DETACH:**
```cypher
MATCH (p:Player {first_name: "Diana"}) DETACH DELETE p;
```
→ Erfolg: Knoten **und** alle anhängenden Beziehungen werden in einer Transaktion entfernt.

Screenshots:
- Vorher (Diana mit ihren Kanten): [x_res/delete_before.png](./x_res/delete_before.png)
- Versuch ohne DETACH → Fehler: [x_res/delete_no_detach.png](./x_res/delete_no_detach.png)
- Nach DETACH DELETE: [x_res/delete_after.png](./x_res/delete_after.png)

Script: [`delete.cypher`](./delete.cypher).

## D) Daten verändern

Drei Szenarien — [`updates.cypher`](./updates.cypher):

1. **Knoten-Attribut updaten**: Diana gewinnt Junior Trophy → +75 Ranking-Punkte.
2. **Kanten-Attribut updaten**: Top-Spieler sagt ab → alle anderen Seeds rücken eins hoch.
3. **Label hinzufügen via SET**: alle Spieler mit Geburtsdatum nach 2000 bekommen Label `:Junior`.

Screenshot: [x_res/updates.png](./x_res/updates.png).

## E) Zwei neue Klauseln — [`extras.cypher`](./extras.cypher)

### `WITH`
Pipelined Zwischenresultate weiter, wie ein SQL-CTE. Zwingend, sobald man **aggregiert und danach noch filtern** will (im Stil von `HAVING`).

Beispiel: pro Club die Anzahl Mitglieder zählen und nur Clubs mit mind. 2 Mitgliedern ausgeben:
```cypher
MATCH (p:Player)-[:MEMBER_OF]->(c:Club)
WITH c, count(p) AS mitglieder
WHERE mitglieder >= 2
RETURN c.name, mitglieder;
```

### `FOREACH`
Iteriert über eine Liste und führt für jedes Element eine **Schreib**-Operation aus (`SET`, `CREATE`, `MERGE`, `DELETE`). Lese-Operationen sind innen nicht erlaubt.

Beispiel: für jedes Set eines Matches eine Migrations-Markierung setzen:
```cypher
MATCH (m:Match {played_at: datetime("2025-06-14T10:00:00Z")})
FOREACH (s IN m.sets | SET m.last_recalc = datetime());
```
Hier eher künstlich; sinnvoller etwa beim Erzeugen mehrerer Knoten aus einer Eingabeliste.
