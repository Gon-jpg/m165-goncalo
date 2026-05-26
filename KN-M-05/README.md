# KN-M-05 — Administration von MongoDB

Auf der AWS-EC2-Instanz aus [KN-M-01](../KN-M-01/) (IP `3.80.37.127`, später `3.95.252.168` nach Restore).

## A) Rechte und Rollen

Detailliert in **KN-M-01 D)** ausgeführt; hier nochmals zusammengefasst.

- Falsche `authSource` → 401, Screenshot: [../KN-M-01/x_res/wrong_authsource.png](../KN-M-01/x_res/wrong_authsource.png).
- Skript: [`createUsers.js`](./createUsers.js)
  - `padelreader` — built-in Rolle `read`, Auth-DB `padel`.
  - `padelwriter` — built-in Rolle `readWrite`, Auth-DB `admin`.
- Tests (siehe KN-M-01 D — selber Workflow):
  - Benutzer 1 Login + Read: [../KN-M-01/x_res/u1_login_read.png](../KN-M-01/x_res/u1_login_read.png)
  - Benutzer 1 Write Fehler: [../KN-M-01/x_res/u1_write_fail.png](../KN-M-01/x_res/u1_write_fail.png)
  - Benutzer 2 Login + Read: [../KN-M-01/x_res/u2_login_read.png](../KN-M-01/x_res/u2_login_read.png)
  - Benutzer 2 Write OK: [../KN-M-01/x_res/u2_write_ok.png](../KN-M-01/x_res/u2_write_ok.png)

## B) Backup und Restore

> AWS-Snapshot-Variante 1: ohne aktive AWS-Instanz nur dokumentiert; die Befehle und Ablauf-Screenshots beziehen sich auf Variante 2 (`mongodump`/`mongorestore`), die identisch lokal und auf einem AWS-Server funktioniert.

### Variante 1: AWS EBS Snapshot (real ausgeführt)

Auf der AWS-EC2 mit MongoDB (Instance `i-0058717dc0d58dd77`, Volume `vol-06c0c2759bd057efb`):

1. **Snapshot erstellen** mit `aws ec2 create-snapshot`. Resultierende `SnapshotId: snap-04f7c4f5b0acd8fd6`, State: `pending → completed`, 8 GiB. Screenshot: [x_res/aws_snapshot_create.png](./x_res/aws_snapshot_create.png).
2. **Collection löschen** via mongosh: `db.clubs.drop()` → nur noch `players` in der DB. Screenshot: [x_res/aws_after_drop.png](./x_res/aws_after_drop.png).
3. **Restore**:
   ```bash
   aws ec2 create-volume --snapshot-id snap-04f7c4f5b0acd8fd6 --availability-zone us-east-1b
   aws ec2 stop-instances --instance-ids i-0058717dc0d58dd77
   aws ec2 detach-volume --volume-id vol-06c0c2759bd057efb
   aws ec2 attach-volume --volume-id vol-026cd2c76323226d4 --instance-id i-0058717dc0d58dd77 --device /dev/sda1
   aws ec2 start-instances --instance-ids i-0058717dc0d58dd77
   ```
   Nach Restore: clubs **und** players wieder da (3 + 3). Screenshot: [x_res/aws_after_restore.png](./x_res/aws_after_restore.png).

### Variante 2: mongodump / mongorestore

Ausführung via die Database Tools:

```bash
# Backup
mongodump --uri "mongodb://admin:m165AdminPass!@localhost:27017/?authSource=admin" \
          --db padel --out ./backup-2026-05-12

# Datenbank löschen
mongosh "mongodb://admin:m165AdminPass!@localhost:27017/?authSource=admin" \
        --eval 'db.getSiblingDB("padel").dropDatabase()'

# Restore
mongorestore --uri "mongodb://admin:m165AdminPass!@localhost:27017/?authSource=admin" \
             --drop ./backup-2026-05-12
```

Screenshots:
- Dump: [x_res/mongodump.png](./x_res/mongodump.png)
- Nach Drop (leere DB): [x_res/after_drop.png](./x_res/after_drop.png)
- Restore: [x_res/mongorestore.png](./x_res/mongorestore.png)
- Nach Restore (Daten zurück): [x_res/after_restore.png](./x_res/after_restore.png)

## C) Skalierung

### Replication vs. Partition (Sharding)

**Replication** (vertikal aus Sicht der Datenhaltung): Dieselben Daten werden auf mehrere Nodes kopiert. Ein Primary-Node nimmt Writes entgegen und propagiert sie an Secondaries. Vorteile: Hochverfügbarkeit (Failover, wenn der Primary stirbt), Lese-Skalierung (Reads auf Secondaries möglich). Nachteil: alle Nodes halten den **gesamten** Datenbestand → kein Speicher-Gewinn.

**Partitioning / Sharding**: Der Datenbestand wird über einen *Shard Key* in horizontale Stücke geteilt und über mehrere Nodes verteilt. Jeder Shard hält nur einen Teil der Daten. Vorteile: Speicher- und Write-Skalierung (mehrere Primaries parallel). Nachteil: komplexer (Config-Server, mongos-Router), Shard-Key-Wahl ist kritisch und schwer zu ändern.

In der Praxis kombiniert man **beides**: jeder Shard ist selbst ein Replica Set (Sharded Cluster).

Illustration:

```
Replication                     Sharding
─────────────                   ─────────────
[Primary]  ⇄  [Secondary]       [Shard A: keys 0-499]
              [Secondary]       [Shard B: keys 500-999]
(alle dieselben Daten)          (jeder ein Teil)

Sharded Cluster (kombiniert):
[Shard A primary + 2 secondaries]
[Shard B primary + 2 secondaries]
[Shard C primary + 2 secondaries]
```

Quellen: [MongoDB Scaling-Übersicht](https://www.mongodb.com/basics/scaling), [Replication](https://www.mongodb.com/docs/manual/replication/), [Sharding](https://www.mongodb.com/docs/manual/sharding/).

### Empfehlung an die Firma

**Situation:** Unsere Applikation verwendet MongoDB für die Padel-Daten. Aktueller Bestand: ~50 GB, ~2'000 Reads/s, ~100 Writes/s. Ausfallzeit ist teuer (Live-Turnierdaten).

**Empfehlung:** **Replica Set mit 3 Nodes**, vorerst **kein** Sharding.

**Begründung:**
- Das primäre Risiko ist Verfügbarkeit, nicht Skalierung. 50 GB passen problemlos auf einen Node.
- Reads sind dominant — ein Replica Set erlaubt Read-Preference `secondary` für Reporting-Queries, ohne den Primary zu stressen.
- Sharding würde unnötige operative Komplexität bringen (Config-Server, Shard-Key-Wahl ist irreversibel teuer) ohne klaren Nutzen bei dieser Datenmenge.
- Reevaluation bei >500 GB **oder** >5'000 Writes/s — dann wird Sharding zwingend.
