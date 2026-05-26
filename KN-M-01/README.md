# KN-M-01 — Installation und Verwaltung von MongoDB

## A) Installation

Eine **AWS EC2 Instanz** wurde via Cloud-Init aufgesetzt:
- Region: `us-east-1`
- AMI: Ubuntu 22.04 (`ami-00403f401ee6a4b98`)
- Instance-Type: `t3.micro`
- Cloud-Init: [`cloudinit-mongodb.yaml`](./cloudinit-mongodb.yaml). Das Admin-Passwort wurde auf einen testspezifischen Wert (`m165AdminPass!`) gesetzt, **nicht** mein persönliches.
- Security Group: nur Port 22 und 27017 von meiner IP geöffnet.

Verbindungs-String (für die Aufgaben):
```
mongodb://admin:m165AdminPass!@3.80.37.127:27017/?authSource=admin&readPreference=primary&ssl=false
```

**Datenbank-Übersicht via Compass (Mongo Express UI gegen den AWS-Server):** Screenshot: [x_res/compass_databases.png](./x_res/compass_databases.png) — zeigt den AWS-internen Hostnamen `ip-172-31-23-41` als Bestätigung, dass es sich um die EC2-Instanz handelt.

### `authSource=admin` — Erklärung

`authSource` gibt an, **gegen welche Datenbank die Authentifizierung läuft**. MongoDB legt Benutzerobjekte pro Datenbank ab — derselbe Username "admin" könnte in zwei verschiedenen Datenbanken existieren mit unterschiedlichen Passwörtern.

Da der Root-User im Cloud-Init in der `admin`-DB angelegt wird (`use admin; db.createUser(...)`), muss der Verbindungs-String genau dort suchen. Würde man `authSource=padel` schreiben, würde MongoDB in `padel.system.users` nach einem Benutzer "admin" suchen — der existiert dort nicht → 401 Auth-Fehler.

### `sed` im Cloud-Init — Erklärung

Im Cloud-Init kommen zwei `sed`-Befehle vor:

1. **`sed -i 's/bindIp: 127.0.0.1/bindIp: 0.0.0.0/' /etc/mongod.conf`**
   Ändert die `bindIp` von Loopback auf "alle Interfaces". Ohne diese Änderung lauscht `mongod` nur auf localhost und ist von ausserhalb der VM nicht erreichbar — wir könnten uns also nicht mit Compass vom eigenen Laptop verbinden.

2. **`sed -i 's/#security:/security:\n  authorization: enabled/' /etc/mongod.conf`** (bzw. analoger Befehl, der `authorization: enabled` setzt)
   Aktiviert die Authentifizierung. Ohne diesen Schalter würde MongoDB jedem ohne Login Vollzugriff geben — ein offen erreichbares Mongo ohne Auth ist quasi öffentlich.

Diese beiden Befehle bedingen einander: man **muss** zuerst Auth aktivieren, **bevor** man die Bind-IP öffnet, sonst hat man kurz ein offenes Mongo ohne Login im Internet.

Screenshot der `mongod.conf` mit beiden geänderten Werten: [x_res/mongod_conf.png](./x_res/mongod_conf.png).

## B) Erste Schritte GUI

- **Datenbank:** `DeAlmeida` (Nachname), **Collection:** `Goncalo` (Vorname).
- Eingefügtes Dokument vor dem Insert: [x_res/insert_doc_before.png](./x_res/insert_doc_before.png) — Inhalt auch als JSON: [`x_res/insert_doc.json`](./x_res/insert_doc.json).
- Dokument nach Datentyp-Änderung (Datum als `Date`): [x_res/insert_doc_after.png](./x_res/insert_doc_after.png).
- Export: [`x_res/export.json`](./x_res/export.json).

### Wieso ist das Datum so kompliziert?

JSON kennt nativ nur die Typen `string`, `number`, `boolean`, `null`, `array`, `object` — **kein Datum**. Wenn man in Compass im "Insert Document"-Dialog `"birthdate": "1995-03-21"` eintippt, speichert Mongo das als **String**. Um es als `Date` (BSON-Typ 9) zu speichern, muss man in Compass den Feld-Typ explizit auf "Date" umstellen, oder im Shell `new Date(...)` bzw. `{"$date": "..."}` (Extended JSON) verwenden.

Im Export sieht man das in der Form `"birthdate": { "$date": "1995-03-21T00:00:00Z" }` — das ist Mongos *Extended JSON*, das den BSON-Typ wieder herstellbar macht. Implikation auf andere Typen: dasselbe gilt für `ObjectId` (`{"$oid": "..."}`), `Decimal128` (`{"$numberDecimal": "..."}`), `Long` etc. — alle BSON-Typen, die JSON nicht kennt, müssen mit `$`-präfix-Tags ausgedrückt werden.

## C) Erste Schritte Shell

### Befehle 1–5

| # | Befehl | Wirkung |
|---|---|---|
| 1 | `show dbs;` | Listet alle Datenbanken mit ihrer Grösse auf. |
| 2 | `show databases;` | Alias für `show dbs` — exakt dasselbe. |
| 3 | `use DeAlmeida` | Wechselt den Kontext auf die Datenbank `DeAlmeida`. Nachfolgende `db.*`-Aufrufe arbeiten dort. |
| 4 | `show collections;` | Listet alle Collections der aktuellen DB. |
| 5 | `show tables;` | Alias für `show collections`. Wurde aus SQL-Kompatibilität eingeführt. |

**Collections vs. Tables:** Eine *Table* (SQL) ist strikt schema-gebunden: alle Zeilen haben dieselben Spalten und Typen. Eine *Collection* (Mongo) ist schemaless — verschiedene Dokumente in derselben Collection dürfen unterschiedliche Felder und Strukturen haben. `show tables` in Mongo existiert nur als Komfort-Alias und wirft kein anderes Ergebnis.

Screenshots:
- Compass-Shell mit den Befehlen: [x_res/shell_compass.png](./x_res/shell_compass.png)
- mongosh direkt auf dem Server (lokal Docker exec entspricht der SSH-Session): [x_res/shell_server.png](./x_res/shell_server.png)

## D) Rechte und Rollen

Wechsel der `authSource` auf falsche DB → Fehler:
```
mongodb://admin:m165AdminPass!@localhost:27017/?authSource=padel
```
→ `MongoServerError: Authentication failed.` Screenshot: [x_res/wrong_authsource.png](./x_res/wrong_authsource.png).

### Skript: 2 Benutzer anlegen — [`createUsers.js`](./createUsers.js)

- **`padelreader`** — Rolle `read` auf `padel`, Auth-DB ist `padel` selbst.
- **`padelwriter`** — Rolle `readWrite` auf `padel`, Auth-DB ist `admin`.

Beides built-in Rollen ohne "Any" im Namen.

Screenshots:
- Benutzer 1 Login + Read OK: [x_res/u1_login_read.png](./x_res/u1_login_read.png)
- Benutzer 1 Write FAIL: [x_res/u1_write_fail.png](./x_res/u1_write_fail.png)
- Benutzer 2 Login + Read OK: [x_res/u2_login_read.png](./x_res/u2_login_read.png)
- Benutzer 2 Write OK: [x_res/u2_write_ok.png](./x_res/u2_write_ok.png)
