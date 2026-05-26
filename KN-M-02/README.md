# KN-M-02 — Datenmodellierung für MongoDB

**Thema:** Padel Tournament Tracker — eine Plattform, die Padel-Spieler, Clubs und Turniere im Schweizer Raum verwaltet.

## A) Konzeptionelles Datenmodell

### Entitäten

- **Player** — eine natürliche Person, die Padel spielt. Hat Lizenznummer, Name, Geburtsdatum, Ranglistenpunkte.
- **Club** — ein Padel-Club mit Adresse, Anzahl Courts und Gründungsdatum.
- **Tournament** — ein zeitlich begrenzter Wettbewerb. Hat Name, Startdatum, Preisgeld, Kategorie (Bronze/Silber/Gold).
- **Match** — eine konkrete Partie zwischen zwei Teams (Doppel) innerhalb eines Turniers. Hat Datum, Resultat, Court-Nr.
- **Court** — ein physischer Platz in einem Club mit Belag (Kunstrasen, Beton), Indoor/Outdoor.

### Beziehungen

```mermaid
erDiagram
    PLAYER }o--o{ TOURNAMENT : "nimmt teil (N:N)"
    PLAYER }o--|| CLUB : "Mitglied bei"
    TOURNAMENT ||--o{ MATCH : "enthält"
    MATCH }o--|| COURT : "gespielt auf"
    CLUB ||--o{ COURT : "besitzt"
    MATCH }o--o{ PLAYER : "Teilnehmer (4 Spieler, N:N)"
```

- **Player ↔ Tournament (N:N)** — Pflicht-N:N: ein Spieler nimmt an vielen Turnieren teil, ein Turnier hat viele Spieler.
- **Player ↔ Match (N:N)** — vier Spieler pro Match (Doppel).
- **Player → Club (N:1)** — jeder Spieler ist Mitglied genau eines Heim-Clubs.
- **Tournament → Match (1:N)** — ein Turnier besteht aus mehreren Matches.
- **Club → Court (1:N)** — ein Club besitzt mehrere Courts.
- **Match → Court (N:1)** — ein Match wird auf genau einem Court gespielt.

Original-Datei: [x_res/conceptual.mmd](./x_res/conceptual.mmd) — Mermaid, rendert direkt in GitHub, kann in draw.io importiert werden.

## B) Logisches Modell für MongoDB

In MongoDB werden zusammengehörende Daten oft eingebettet (embedded) statt referenziert. Schema:

```
players (collection)
└── { _id, license_no:int, first_name:string, last_name:string,
       birthdate:date, ranking_points:int, gender:char('M'/'F'),
       home_club_id:ObjectId,
       contact: { email:string, phone:string }     ← embedded sub-document
     }

clubs (collection)
└── { _id, name:string, city:string, founded:date,
       courts: [                                    ← embedded array
         { number:int, surface:string, indoor:bool, hourly_rate:float }
       ]
     }

tournaments (collection)
└── { _id, name:string, category:string, start_date:date,
       prize_money:float,
       participants:[ ObjectId ]                    ← references → players._id
     }

matches (collection)
└── { _id, tournament_id:ObjectId, court_number:int, club_id:ObjectId,
       played_at:date,
       team_a:[ ObjectId, ObjectId ],
       team_b:[ ObjectId, ObjectId ],
       sets: [ { a:int, b:int } ]                   ← embedded array
     }
```

### Verschachtelung — Begründung

- **`clubs.courts` eingebettet**: Courts existieren nicht ohne Club, werden fast immer mit dem Club zusammen gelesen, und ihre Anzahl ist klein (<20). → Embed reduziert Joins.
- **`players.contact` eingebettet**: 1:1, gehört konzeptionell zum Spieler.
- **`tournaments.participants` als Array von Referenzen**: N:N — Spieler existieren unabhängig, derselbe Spieler ist in vielen Turnieren. Embed würde Duplikate erzeugen, deshalb Referenzen.
- **`matches.sets` eingebettet**: Sets gehören untrennbar zu einem Match, kleine bounded Liste.
- **Basis-Datentypen im Einsatz**: `int` (license_no, ranking_points), `float` (prize_money, hourly_rate), `string` (Namen), `char` (gender), `bool` (indoor), `date` (birthdate, start_date, played_at).

Bild: [x_res/logical_model.png](./x_res/logical_model.png). Original: [x_res/logical.mmd](./x_res/logical.mmd).

## C) Anwendung des Schemas in MongoDB

Script: [`createCollections.js`](./createCollections.js)

Ausführung:
```bash
mongosh "mongodb://admin:m165AdminPass!@localhost:27017/?authSource=admin" < createCollections.js
```

Screenshot der erstellten Collections in Mongo Express: [x_res/collections_created.png](./x_res/collections_created.png).
