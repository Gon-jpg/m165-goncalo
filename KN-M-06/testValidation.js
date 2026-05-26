// KN-M-06 B) Test der Validierung — ein gültiges und ein ungültiges Dokument einfügen.
db = db.getSiblingDB("padel");

print("\n=== gültig: sollte erfolgreich sein ===");
try {
  const r = db.players.insertOne({
    license_no: 99001,
    first_name: "Valid",
    last_name:  "Player",
    birthdate:  new Date("2000-01-01"),
    ranking_points: 500,
    gender: "M",
    home_club_id: new ObjectId(),
    contact: { email: "valid@example.ch", phone: "+41 79 000 00 00" }
  });
  print("OK insertedId: " + r.insertedId);
} catch (e) { print("UNEXPECTED ERROR: " + e.message); }

print("\n=== ungültig (gender='Z', ranking_points als string): sollte fehlschlagen ===");
try {
  db.players.insertOne({
    license_no: 99002,
    first_name: "Bad",
    last_name:  "Doc",
    birthdate:  new Date("2000-01-01"),
    ranking_points: "ABC",
    gender: "Z",
    home_club_id: new ObjectId()
  });
  print("UNEXPECTED: insert hat NICHT fehlgeschlagen");
} catch (e) {
  print("ERWARTETER FEHLER: " + e.codeName + " — " + e.errmsg);
}
