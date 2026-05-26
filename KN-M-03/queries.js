// KN-M-03 C) Abfragen mit find() — deckt alle Bedingungen ab.
db = db.getSiblingDB("padel");

print("\n=== 1) clubs: einfache Abfrage ===");
db.clubs.find({ city: "Zürich" }).forEach(printjson);

print("\n=== 2) players: Regex (Nachname enthält 'meier' case-insensitive) ===");
db.players.find({ last_name: { $regex: "meier", $options: "i" } }).forEach(printjson);

print("\n=== 3) tournaments: Datums-Filter (start_date >= 2025-05-01) ===");
db.tournaments.find({ start_date: { $gte: new Date("2025-05-01") } }).forEach(printjson);

print("\n=== 4) players: ODER-Verknüpfung (gender F ODER ranking>=1800) + Projektion mit _id ===");
db.players.find(
  { $or: [ { gender: "F" }, { ranking_points: { $gte: 1800 } } ] },
  { _id: 1, first_name: 1, last_name: 1, ranking_points: 1 }
).forEach(printjson);

print("\n=== 5) matches: UND-Verknüpfung (court_number=1 AND played_at>=2025-06-01) + Projektion ohne _id ===");
db.matches.find(
  { $and: [ { court_number: 1 }, { played_at: { $gte: new Date("2025-06-01") } } ] },
  { _id: 0, court_number: 1, played_at: 1, sets: 1 }
).forEach(printjson);
