// KN-M-01 D) Zwei Benutzer für Padel-Datenbank anlegen.
// Benutzer 1: read-only, Auth-DB = padel
// Benutzer 2: readWrite, Auth-DB = admin
// Keine "Any"-Rollen verwendet.

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

print("Benutzer erstellt: padelreader (padel), padelwriter (admin)");
