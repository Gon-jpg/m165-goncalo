// KN-M-02 C) Collections für das Padel-Tournament-Tracker-Datenmodell
// Ausführen: mongosh "mongodb://admin:m165AdminPass!@localhost:27017/?authSource=admin" < createCollections.js

db = db.getSiblingDB("padel");

db.createCollection("players");
db.createCollection("clubs");
db.createCollection("tournaments");
db.createCollection("matches");

print("Collections in 'padel' nach Erstellung:");
db.getCollectionNames().forEach(c => print(" - " + c));
