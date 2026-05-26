// KN-N-02 C) DETACH-Test mit denselben Startobjekten.

// Variante 1 — OHNE DETACH (schlägt fehl, weil der Knoten Beziehungen hat).
// MATCH (p:Player {first_name: "Diana"}) DELETE p;
// → Neo4j Fehler: "Cannot delete node<...>, because it still has relationships."

// Variante 2 — MIT DETACH (löscht den Knoten und alle anhängenden Beziehungen).
// MATCH (p:Player {first_name: "Diana"}) DETACH DELETE p;
