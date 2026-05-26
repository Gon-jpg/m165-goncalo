// KN-M-03 B) Alle Collections der Datenbank 'padel' löschen.
db = db.getSiblingDB("padel");
db.getCollectionNames().forEach(c => {
  db[c].drop();
  print("dropped: " + c);
});
