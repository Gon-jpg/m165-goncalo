// KN-N-02 E) Zwei zusätzliche Klauseln: WITH und FOREACH.

// 1) WITH — leitet Zwischenresultate zur nächsten Pipeline-Stufe weiter, ähnlich SQL-CTE.
// Anwendungsfall: pro Club die Anzahl Mitglieder zählen und nur Clubs mit >=2 ausgeben.
MATCH (p:Player)-[:MEMBER_OF]->(c:Club)
WITH c, count(p) AS mitglieder
WHERE mitglieder >= 2
RETURN c.name AS club, mitglieder
ORDER BY mitglieder DESC;

// 2) FOREACH — führt für jedes Element einer Liste eine Update-Operation aus.
// Anwendungsfall: für alle Sets eines konkreten Matches eine Notiz hinzufügen
// (FOREACH muss eine Schreib-Operation enthalten — DELETE, SET, CREATE, MERGE).
MATCH (m:Match {played_at: datetime("2025-06-14T10:00:00Z")})
FOREACH (s IN m.sets_a | SET m.last_recalc = datetime());
