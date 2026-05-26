// KN-M-07 — Zugriff auf MongoDB via offiziellem Node.js-Treiber.
// Installation: npm install mongodb
// Ausführung:   node app.js

const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI
  || "mongodb://admin:m165AdminPass!@localhost:27017/?authSource=admin";

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("padel");

  // 1) Anzahl Dokumente pro Collection
  for (const c of ["players", "clubs", "tournaments", "matches"]) {
    const n = await db.collection(c).countDocuments();
    console.log(`${c.padEnd(12)} = ${n}`);
  }

  // 2) Top 3 Spieler nach Ranking
  console.log("\nTop 3 Spieler:");
  const top = await db.collection("players")
    .find({}, { projection: { _id: 0, first_name: 1, last_name: 1, ranking_points: 1 } })
    .sort({ ranking_points: -1 }).limit(3).toArray();
  for (const p of top) console.log(`  ${p.first_name} ${p.last_name} — ${p.ranking_points} pts`);

  // 3) Aggregation: Anzahl Matches pro Turnier (mit Name)
  console.log("\nMatches pro Turnier:");
  const byT = await db.collection("matches").aggregate([
    { $group: { _id: "$tournament_id", n: { $sum: 1 } } },
    { $lookup: { from: "tournaments", localField: "_id", foreignField: "_id", as: "t" } },
    { $unwind: "$t" },
    { $project: { _id: 0, tournament: "$t.name", matches: "$n" } },
    { $sort: { matches: -1 } }
  ]).toArray();
  for (const r of byT) console.log(`  ${r.tournament.padEnd(28)} ${r.matches}`);

  await client.close();
}

main().catch(err => { console.error(err); process.exit(1); });
