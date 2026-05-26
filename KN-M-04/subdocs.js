// KN-M-04 C) Unter-Dokumente / Arrays
db = db.getSiblingDB("padel");

print("\n=== Nur einzelne Felder der Sub-Documents (clubs.courts.surface + .indoor) ===");
db.clubs.find({}, { _id: 0, name: 1, "courts.surface": 1, "courts.indoor": 1 }).forEach(printjson);

print("\n=== Filter nach Sub-Doc-Feld: Clubs mit mindestens einem Indoor-Court ===");
db.clubs.find({ "courts.indoor": true }, { _id: 0, name: 1 }).forEach(printjson);

print("\n=== $unwind über clubs.courts ===");
db.clubs.aggregate([
  { $unwind: "$courts" },
  { $project: { _id: 0, club: "$name", court: "$courts.number", surface: "$courts.surface", rate: "$courts.hourly_rate" } },
  { $sort: { rate: -1 } }
]).forEach(printjson);
