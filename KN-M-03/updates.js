// KN-M-03 D) Updates auf unterschiedlichen Collections.
db = db.getSiblingDB("padel");

// updateOne: ein Spieler bekommt +50 Ranking-Punkte (Filter via _id).
const aPlayer = db.players.findOne({ first_name: "Alex" });
print("Vorher Punkte: " + aPlayer.ranking_points);
db.players.updateOne(
  { _id: aPlayer._id },
  { $inc: { ranking_points: 50 } }
);
print("Nachher: " + db.players.findOne({ _id: aPlayer._id }).ranking_points);

// updateMany mit ODER (kein _id): Preisgeld bei Bronze ODER Silber Turnieren +10%.
print("\nAktualisiere Bronze/Silber Turnier Preisgelder (+10%):");
printjson(db.tournaments.updateMany(
  { $or: [ { category: "Bronze" }, { category: "Silber" } ] },
  { $mul: { prize_money: 1.10 } }
));

// replaceOne: ein Club komplett ersetzen.
print("\nErsetze Club Lugano:");
printjson(db.clubs.replaceOne(
  { name: "Padel Lugano" },
  {
    name: "Padel Lugano Centro",
    city: "Lugano",
    founded: new Date("2021-09-15"),
    courts: [
      { number: 1, surface: "Kunstrasen", indoor: true,  hourly_rate: 35.0 },
      { number: 2, surface: "Kunstrasen", indoor: false, hourly_rate: 30.0 }
    ]
  }
));
print("Nachher: " + JSON.stringify(db.clubs.findOne({ city: "Lugano" })));
