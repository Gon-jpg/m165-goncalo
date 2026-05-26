// KN-M-06 B) Validatoren für alle Collections setzen
db = db.getSiblingDB("padel");

const playerSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["license_no", "first_name", "last_name", "birthdate", "ranking_points", "gender", "home_club_id"],
    properties: {
      license_no: { bsonType: "int", minimum: 1, description: "Lizenznummer als int" },
      first_name: { bsonType: "string", minLength: 1 },
      last_name: { bsonType: "string", minLength: 1 },
      birthdate: { bsonType: "date" },
      ranking_points: { bsonType: "int", minimum: 0, maximum: 5000 },
      gender: { bsonType: "string", enum: ["M", "F", "X"] },
      home_club_id: { bsonType: "objectId" },
      contact: {
        bsonType: "object",
        properties: {
          email: { bsonType: "string", pattern: "^.+@.+\\..+$" },
          phone: { bsonType: "string" }
        }
      }
    }
  }
};

const clubSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["name", "city", "founded", "courts"],
    properties: {
      name: { bsonType: "string", minLength: 2 },
      city: { bsonType: "string" },
      founded: { bsonType: "date" },
      courts: {
        bsonType: "array",
        minItems: 1,
        items: {
          bsonType: "object",
          required: ["number", "surface", "indoor", "hourly_rate"],
          properties: {
            number: { bsonType: "int", minimum: 1 },
            surface: { bsonType: "string", enum: ["Kunstrasen", "Beton", "Teppich"] },
            indoor: { bsonType: "bool" },
            hourly_rate: { bsonType: ["double", "int", "long"], minimum: 0 }
          }
        }
      }
    }
  }
};

const tournamentSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["name", "category", "start_date", "prize_money", "participants"],
    properties: {
      name: { bsonType: "string" },
      category: { bsonType: "string", enum: ["Bronze", "Silber", "Gold"] },
      start_date: { bsonType: "date" },
      prize_money: { bsonType: ["double", "int", "long"], minimum: 0 },
      participants: {
        bsonType: "array",
        items: { bsonType: "objectId" }
      }
    }
  }
};

const matchSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["tournament_id", "court_number", "club_id", "played_at", "team_a", "team_b", "sets"],
    properties: {
      tournament_id: { bsonType: "objectId" },
      club_id: { bsonType: "objectId" },
      court_number: { bsonType: "int", minimum: 1 },
      played_at: { bsonType: "date" },
      team_a: { bsonType: "array", minItems: 2, maxItems: 2, items: { bsonType: "objectId" } },
      team_b: { bsonType: "array", minItems: 2, maxItems: 2, items: { bsonType: "objectId" } },
      sets: {
        bsonType: "array",
        minItems: 2,
        maxItems: 5,
        items: {
          bsonType: "object",
          required: ["a", "b"],
          properties: {
            a: { bsonType: "int", minimum: 0, maximum: 7 },
            b: { bsonType: "int", minimum: 0, maximum: 7 }
          }
        }
      }
    }
  }
};

function applyValidator(collection, schema) {
  const result = db.runCommand({
    collMod: collection,
    validator: schema,
    validationLevel: "moderate",
    validationAction: "error"
  });
  print("collMod " + collection + ": " + JSON.stringify(result));
}

applyValidator("players", playerSchema);
applyValidator("clubs", clubSchema);
applyValidator("tournaments", tournamentSchema);
applyValidator("matches", matchSchema);

print("\nAktive Validatoren:");
db.getCollectionInfos().forEach(info => {
  if (info.options && info.options.validator) {
    print(" - " + info.name);
  }
});
