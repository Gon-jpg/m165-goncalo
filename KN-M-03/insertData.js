// KN-M-03 A) Daten hinzufügen für Padel-Tracker
db = db.getSiblingDB("padel");

// ObjectId-Variablen
const clubZurich   = new ObjectId();
const clubGeneva   = new ObjectId();
const clubLugano   = new ObjectId();

const pAlex   = new ObjectId();
const pBeatriz= new ObjectId();
const pCarlos = new ObjectId();
const pDiana  = new ObjectId();
const pEmilio = new ObjectId();
const pFabio  = new ObjectId();

const t2025Open = new ObjectId();
const t2025Spring = new ObjectId();
const t2025Junior = new ObjectId();

// Clubs: insertMany
db.clubs.insertMany([
  {
    _id: clubZurich,
    name: "Padel Club Zürich",
    city: "Zürich",
    founded: new Date("2017-04-12"),
    courts: [
      { number: 1, surface: "Kunstrasen", indoor: true,  hourly_rate: 38.0 },
      { number: 2, surface: "Kunstrasen", indoor: true,  hourly_rate: 38.0 },
      { number: 3, surface: "Beton",      indoor: false, hourly_rate: 28.0 }
    ]
  },
  {
    _id: clubGeneva,
    name: "Padel Genève",
    city: "Genève",
    founded: new Date("2019-06-01"),
    courts: [
      { number: 1, surface: "Kunstrasen", indoor: true, hourly_rate: 42.0 },
      { number: 2, surface: "Kunstrasen", indoor: true, hourly_rate: 42.0 }
    ]
  },
  {
    _id: clubLugano,
    name: "Padel Lugano",
    city: "Lugano",
    founded: new Date("2021-09-15"),
    courts: [
      { number: 1, surface: "Kunstrasen", indoor: false, hourly_rate: 30.0 }
    ]
  }
]);

// Players: insertMany
db.players.insertMany([
  { _id: pAlex,    license_no: 10001, first_name: "Alex",    last_name: "Meier",   birthdate: new Date("1995-03-21"), ranking_points: 1240, gender: "M", home_club_id: clubZurich, contact: { email: "alex.meier@example.ch",    phone: "+41 79 111 11 11" } },
  { _id: pBeatriz, license_no: 10002, first_name: "Beatriz", last_name: "Sousa",   birthdate: new Date("1998-07-09"), ranking_points: 1580, gender: "F", home_club_id: clubGeneva, contact: { email: "beatriz.sousa@example.ch", phone: "+41 79 222 22 22" } },
  { _id: pCarlos,  license_no: 10003, first_name: "Carlos",  last_name: "Almeida", birthdate: new Date("1992-11-30"), ranking_points: 1875, gender: "M", home_club_id: clubLugano, contact: { email: "carlos.almeida@example.ch",phone: "+41 79 333 33 33" } },
  { _id: pDiana,   license_no: 10004, first_name: "Diana",   last_name: "Keller",  birthdate: new Date("2001-01-15"), ranking_points: 980,  gender: "F", home_club_id: clubZurich, contact: { email: "diana.keller@example.ch",  phone: "+41 79 444 44 44" } },
  { _id: pEmilio,  license_no: 10005, first_name: "Emilio",  last_name: "Rossi",   birthdate: new Date("1989-05-05"), ranking_points: 2050, gender: "M", home_club_id: clubGeneva, contact: { email: "emilio.rossi@example.ch",  phone: "+41 79 555 55 55" } },
  { _id: pFabio,   license_no: 10006, first_name: "Fabio",   last_name: "Conti",   birthdate: new Date("1997-02-18"), ranking_points: 1310, gender: "M", home_club_id: clubLugano, contact: { email: "fabio.conti@example.ch",   phone: "+41 79 666 66 66" } }
]);

// Tournaments: insertOne x3
db.tournaments.insertOne({
  _id: t2025Open, name: "Swiss Padel Open 2025", category: "Gold",
  start_date: new Date("2025-06-14"), prize_money: 25000.0,
  participants: [pAlex, pBeatriz, pCarlos, pDiana, pEmilio, pFabio]
});
db.tournaments.insertOne({
  _id: t2025Spring, name: "Spring Cup Zürich", category: "Silber",
  start_date: new Date("2025-04-05"), prize_money: 6000.0,
  participants: [pAlex, pDiana, pBeatriz]
});
db.tournaments.insertOne({
  _id: t2025Junior, name: "Junior Trophy Lugano", category: "Bronze",
  start_date: new Date("2025-09-20"), prize_money: 1500.0,
  participants: [pDiana, pCarlos]
});

// Matches: insertMany
db.matches.insertMany([
  { _id: new ObjectId(), tournament_id: t2025Open, court_number: 1, club_id: clubZurich,
    played_at: new Date("2025-06-14T10:00:00Z"),
    team_a: [pAlex, pDiana], team_b: [pCarlos, pEmilio],
    sets: [ { a: 6, b: 4 }, { a: 3, b: 6 }, { a: 7, b: 5 } ] },
  { _id: new ObjectId(), tournament_id: t2025Open, court_number: 2, club_id: clubZurich,
    played_at: new Date("2025-06-14T13:00:00Z"),
    team_a: [pBeatriz, pEmilio], team_b: [pAlex, pCarlos],
    sets: [ { a: 6, b: 2 }, { a: 6, b: 3 } ] },
  { _id: new ObjectId(), tournament_id: t2025Spring, court_number: 1, club_id: clubZurich,
    played_at: new Date("2025-04-05T09:30:00Z"),
    team_a: [pAlex, pBeatriz], team_b: [pDiana, pEmilio],
    sets: [ { a: 4, b: 6 }, { a: 6, b: 4 }, { a: 6, b: 7 } ] },
  { _id: new ObjectId(), tournament_id: t2025Junior, court_number: 1, club_id: clubLugano,
    played_at: new Date("2025-09-20T11:00:00Z"),
    team_a: [pDiana, pCarlos], team_b: [pAlex, pBeatriz],
    sets: [ { a: 6, b: 0 }, { a: 6, b: 1 } ] }
]);

print("=== Counts ===");
["clubs","players","tournaments","matches"].forEach(c => print(c + ": " + db[c].countDocuments()));
