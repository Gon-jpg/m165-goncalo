// KN-M-05 A) — gleicher Inhalt wie KN-M-01 D), hier nochmals als eigene Abgabe.
// Benutzer 1: read-only auf padel, Auth-DB = padel
// Benutzer 2: readWrite auf padel, Auth-DB = admin
// Built-in Rollen, ohne "Any" im Namen.

db.getSiblingDB("padel").createUser({
  user: "padelreader",
  pwd:  "ReaderPass!1",
  roles: [ { role: "read", db: "padel" } ]
});

db.getSiblingDB("admin").createUser({
  user: "padelwriter",
  pwd:  "WriterPass!1",
  roles: [ { role: "readWrite", db: "padel" } ]
});

print("OK");
