// KN-M-04 B) $lookup-Joins
db = db.getSiblingDB("padel");

print("\n=== Matches mit Turnier-Info + Club-Info via $lookup ===");
db.matches.aggregate([
  { $lookup: { from: "tournaments", localField: "tournament_id", foreignField: "_id", as: "tournament" } },
  { $lookup: { from: "clubs",       localField: "club_id",       foreignField: "_id", as: "club" } },
  { $unwind: "$tournament" },
  { $unwind: "$club" },
  { $project: {
      _id: 0,
      played_at: 1,
      court_number: 1,
      tournament: "$tournament.name",
      tournament_category: "$tournament.category",
      club: "$club.name",
      sets: 1
  }}
]).forEach(printjson);

print("\n=== Spieler mit Anzahl gespielter Turniere (lookup von players → tournaments) ===");
db.players.aggregate([
  { $lookup: { from: "tournaments", localField: "_id", foreignField: "participants", as: "tournaments" } },
  { $project: { _id: 0, first_name: 1, last_name: 1, tournament_count: { $size: "$tournaments" } } },
  { $match: { tournament_count: { $gt: 0 } } },
  { $sort: { tournament_count: -1 } }
]).forEach(printjson);
