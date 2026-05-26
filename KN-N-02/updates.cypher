// KN-N-02 D) Drei Update-Szenarien.

// Szenario 1 — Knoten-Attribut: nach einem Turnier-Sieg bekommt der Spieler +75 Ranglistenpunkte.
// Anwendungsfall: nach Junior Trophy Finale gewinnt Diana und erhält Punkte.
MATCH (p:Player {first_name: "Diana"})
SET p.ranking_points = p.ranking_points + 75
RETURN p.first_name, p.ranking_points;

// Szenario 2 — Kanten-Attribut: ein Spieler wird im Turnier vorgezogen, sein Seed ändert sich.
// Anwendungsfall: Topspieler sagt ab, alle darunter rücken einen Platz nach oben.
MATCH (p:Player)-[r:PARTICIPATES_IN]->(t:Tournament {name: "Swiss Padel Open 2025"})
WHERE r.seed > 1
SET r.seed = r.seed - 1
RETURN p.first_name, r.seed
ORDER BY r.seed;

// Szenario 3 — Mehrere Knoten + Label-Erweiterung: alle Junioren (geboren nach 2000)
// bekommen das zusätzliche Label :Junior.
// Anwendungsfall: einmaliger Daten-Migrationsschritt für Junior-Rangliste.
MATCH (p:Player)
WHERE p.birthdate > date("2000-01-01")
SET p:Junior
RETURN p.first_name, labels(p) AS labels;
