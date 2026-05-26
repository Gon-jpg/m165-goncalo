// KN-N-02 B) Vier Abfrage-Szenarien.

// Szenario 1 — Alle Spieler eines Clubs anzeigen, sortiert nach Ranglistenpunkten.
// Anwendungsfall: Club-Manager will seine Mitglieder-Liste mit Ranking sehen.
MATCH (p:Player)-[:MEMBER_OF]->(c:Club {name: "Padel Club Zürich"})
RETURN p.first_name AS first_name, p.last_name AS last_name, p.ranking_points AS pts
ORDER BY pts DESC;

// Szenario 2 — WHERE: Welche Turniere wurden nach dem 1.5.2025 gestartet und haben >5'000 Preisgeld?
// Anwendungsfall: Spieler filtert nach lohnenswerten kommenden Turnieren.
MATCH (t:Tournament)
WHERE t.start_date > date("2025-05-01") AND t.prize_money > 5000
RETURN t.name, t.category, t.prize_money, t.start_date
ORDER BY t.prize_money DESC;

// Szenario 3 — WHERE + Kante mit Attribut: Welche Spieler haben in einem Match gewonnen,
// das auf einem Indoor-Court gespielt wurde?
// Anwendungsfall: Statistik-Auswertung über Belag-Affinität.
MATCH (p:Player)-[r:PLAYED_IN]->(m:Match)-[:PLAYED_ON]->(co:Court)
WHERE r.won = true AND co.indoor = true
RETURN DISTINCT p.first_name, p.last_name, co.surface;

// Szenario 4 — Über zwei Hops: Welche Gegner hat Alex in welchen Turnieren gespielt?
// Anwendungsfall: Head-to-head-Analyse für Match-Vorbereitung.
MATCH (alex:Player {first_name: "Alex"})-[:PLAYED_IN]->(m:Match)<-[:PLAYED_IN]-(opp:Player),
      (t:Tournament)-[:HAS_MATCH]->(m)
WHERE opp <> alex
RETURN t.name AS tournament,
       opp.first_name + " " + opp.last_name AS opponent,
       m.played_at AS played_at
ORDER BY played_at;
