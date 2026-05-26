// KN-M-03 B) Teilweise löschen: deleteOne mit _id, deleteMany mit OR über _ids.
db = db.getSiblingDB("padel");

// deleteOne: ein bestimmtes Match anhand seiner _id löschen.
const oneMatch = db.matches.findOne({}, { _id: 1 });
print("Lösche match: " + oneMatch._id);
printjson(db.matches.deleteOne({ _id: oneMatch._id }));

// deleteMany mit ODER-Verknüpfung über zwei _id's (nicht alle Spieler).
const twoPlayers = db.players.find({}, { _id: 1 }).limit(2).toArray();
print("Lösche zwei Spieler (OR auf _id):");
printjson(db.players.deleteMany({
  $or: [
    { _id: twoPlayers[0]._id },
    { _id: twoPlayers[1]._id }
  ]
}));

print("Spieler übrig: " + db.players.countDocuments());
print("Matches übrig: " + db.matches.countDocuments());
