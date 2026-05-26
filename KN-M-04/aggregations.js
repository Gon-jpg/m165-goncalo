// KN-M-04 A) Aggregationen
db = db.getSiblingDB("padel");

print("\n=== 1) Gleicher Filter wie KN-M-03 C5 als $match-Pipeline ===");
db.matches.aggregate([
  { $match: { court_number: 1 } },
  { $match: { played_at: { $gte: new Date("2025-06-01") } } }
]).forEach(printjson);

print("\n=== 2) players: $match + $project + $sort ===");
db.players.aggregate([
  { $match: { ranking_points: { $gte: 1000 } } },
  { $project: { _id: 0, name: { $concat: ["$first_name", " ", "$last_name"] }, ranking_points: 1 } },
  { $sort: { ranking_points: -1 } }
]).forEach(printjson);

print("\n=== 3) $sum: Anzahl Matches pro Turnier ===");
db.matches.aggregate([
  { $group: { _id: "$tournament_id", matches: { $sum: 1 } } }
]).forEach(printjson);

print("\n=== 4) $group: Durchschnittliche Ranglistenpunkte pro Geschlecht ===");
db.players.aggregate([
  { $group: { _id: "$gender", avg_points: { $avg: "$ranking_points" }, n: { $sum: 1 } } },
  { $sort: { avg_points: -1 } }
]).forEach(printjson);
