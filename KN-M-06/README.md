# KN-M-06 — JSON Schema und Collection Validierung

## A) JSON Schemas erstellen

Pro Collection ein Beispiel-Dokument und ein Schema:

| Collection | Beispiel | Schema |
|---|---|---|
| players | [examples/player.example.json](./examples/player.example.json) | [schemas/player.schema.json](./schemas/player.schema.json) |
| clubs | [examples/club.example.json](./examples/club.example.json) | [schemas/club.schema.json](./schemas/club.schema.json) |
| tournaments | [examples/tournament.example.json](./examples/tournament.example.json) | [schemas/tournament.schema.json](./schemas/tournament.schema.json) |
| matches | [examples/match.example.json](./examples/match.example.json) | [schemas/match.schema.json](./schemas/match.schema.json) |

Pflichtfelder sind über `required` definiert. Datentypen wurden auf BSON-Typen (`bsonType: "int"`, `"double"`, `"date"`, `"objectId"`, `"bool"`) angepasst, weil MongoDB mehr Typen kennt als JSON. `enum` schränkt z.B. Turnier-Kategorien auf `Bronze | Silber | Gold` ein.

## B) Validierung hinterlegen und testen

- Skript zum Anwenden aller Validatoren: [`applyValidation.js`](./applyValidation.js)
- Test (gültiges + ungültiges Dokument): [`testValidation.js`](./testValidation.js)

### Befehle

**Validierung hinzufügen** (für eine bestehende Collection):
```js
db.runCommand({
  collMod: "players",
  validator: { $jsonSchema: { /* schema */ } },
  validationLevel: "moderate",
  validationAction: "error"
});
```

**Validierung auslesen**:
```js
db.getCollectionInfos({ name: "players" });
```
Zeigt unter `options.validator` das aktuelle JSON-Schema.

**Neue Rolle hinzufügen** — `dbAdmin` reicht für `collMod`. Wenn der bestehende User nur `readWrite` hat:
```js
db.getSiblingDB("admin").grantRolesToUser(
  "padelwriter",
  [ { role: "dbAdmin", db: "padel" } ]
);
```

### Tests

- UI (Mongo Express) zeigt Collection mit hinterlegtem Validator: [x_res/validator_ui.png](./x_res/validator_ui.png).
- Gültiges Insert → OK: [x_res/valid_insert.png](./x_res/valid_insert.png).
- Ungültiges Insert (falscher `gender`, `ranking_points` als string) → DocumentValidationFailure: [x_res/invalid_insert.png](./x_res/invalid_insert.png).
