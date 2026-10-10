# PalayCheck – Rice Disease Expert System

A **rule-based expert system** that diagnoses rice diseases and pests from the symptoms a farmer sees.
Built with HTML/CSS/JS, Node.js + Express, and MySQL.

---

## 1. Setup (about 10 minutes)

**Needs:** Node.js and MySQL (with MySQL Workbench).

1. **Database**
   - Open MySQL Workbench and connect to your local server.
   - File → Open SQL Script → pick `database/schema.sql`.
   - Click the lightning icon to run it all. It creates the `rice_expert` database with sample data.
2. **Config**
   - Copy `.env.example` and rename it to `.env`.
   - Put your MySQL password in `DB_PASSWORD`.
3. **Install and run** (in the project folder, in a terminal):
   ```
   npm install
   npm start
   ```
4. Open **http://localhost:3000** in your browser.
5. **Photos (optional):** put symptom pictures in `public/images/` named `symptom-1.jpg` to `symptom-17.jpg`. See `public/images/README.txt` for the list. Missing photos show a placeholder.

> Already ran the old `schema.sql`? Run the new one again. It rebuilds the database with the new `image` column.

To test the "brain" without MySQL: `npm test`

---

## 2. Project structure

```
rice-expert-system/
├── database/schema.sql   → tables + knowledge base (rules)
├── engine.js             → INFERENCE ENGINE (the "brain")
├── db.js                 → MySQL connection
├── server.js             → Express API (connects everything)
├── public/
│   ├── index.html        → the page
│   ├── style.css         → design
│   └── app.js            → browser logic (checkboxes, results)
└── test-engine.js        → runs the engine with sample cases
```

---

## 3. The 3 parts of an expert system

| Part | What it is | Where in our code |
|---|---|---|
| **Knowledge base** | The expert's knowledge as IF-THEN rules | `rules`, `symptoms`, `diagnoses` tables |
| **Inference engine** | The reasoning that applies the rules to the facts | `engine.js` |
| **User interface** | Where the user enters facts and sees the answer | `public/` folder |

Bonus part: an **explanation facility**, which shows *why* it reached a result (the "Why? Symptoms that matched" list).

---

## 4. How it works (the full flow)

1. The page loads and calls `GET /api/symptoms`. The server reads the `symptoms` table and the page shows them as checkboxes.
2. The user checks symptoms and clicks **Diagnose**.
3. `app.js` sends the checked ids to `POST /api/diagnose`, for example `{ "symptoms": [1, 2, 16] }`.
4. `server.js` loads the rules, diagnoses, and symptoms from MySQL.
5. `engine.js` runs **forward chaining**:
   - For each diagnosis, get the symptoms its rule requires.
   - Count how many the user checked.
   - **Score = matched ÷ required × 100**
   - Sort by score and return the top 3.
6. The server saves the result in `consultations` (history) and sends it back.
7. The page shows the diagnosis, a confidence bar, the matched and missing symptoms, and advice.

### Example

Rule in the database: **IF** diamond-shaped spots (1) **AND** neck turns black (2) **AND** whitehead (16) **THEN** Rice Blast

| User picked | Rice Blast | Stem Borer |
|---|---|---|
| 1, 2, 16 | 3/3 = **100% High** | 1/3 = 33% Low |
| 16, 17 | 1/3 = 33% | 2/3 = **67% Medium** |

Confidence levels: 75% and up = High, 50–74% = Medium, below 50% = Low.

---

## 5. Code walkthrough (key lines to explain)

**`engine.js`, the brain**
```js
const required = rules.filter(r => r.diagnosis_id === d.id).map(r => r.symptom_id); // rule conditions
const matched  = required.filter(id => selected.has(id));                          // conditions that are true
const score    = Math.round((matched.length / required.length) * 100);            // how sure we are
```
The engine knows nothing about rice. It only matches facts to rules. **That is why you can change the whole topic by changing only the database.**

**`server.js`, the API**
- `GET /api/symptoms` → list of checkboxes
- `POST /api/diagnose` → runs the engine
- `GET /api/history` → last 10 consultations

**`public/app.js`, the page**
- `loadSymptoms()` → builds the picture cards (photo + checkbox) from the `symptoms` table
- `runDiagnosis()` → collects checked boxes and sends them to the server
- `showResults()` → draws the result cards

---

## 6. Making your own version (change the topic)

Only edit `database/schema.sql`:
1. Replace the **symptoms** (e.g., PC problems: "No display", "Beeping sound").
2. Replace the **diagnoses** with your conclusions and advice (e.g., "Faulty RAM").
3. Replace the **rules** that link them.
4. Change the title in `public/index.html`.

Topic ideas: PC troubleshooting, pet illness, course/strand advisor, plant disease, phone problems, skin type and skincare.
Each person should pick their own topic and **research their own rules** from a real source, since the panel will ask where they came from.

---

## 7. Defense Q&A

**What makes this an intelligent system?**
It copies how a human expert reasons. It stores expert knowledge as rules and uses an inference engine to reach a conclusion from the user's facts.

**What type of AI is this?**
A rule-based expert system (symbolic AI) using **forward chaining**: it starts from the facts (symptoms) and moves toward a conclusion (diagnosis).

**Forward vs. backward chaining?**
Forward: facts → conclusion (ours). Backward: start from a guess, then check whether the facts support it.

**Where did your rules come from?**
Cite your source, such as PhilRice, the IRRI Rice Knowledge Bank, or an agriculturist you interviewed.

**How is the confidence computed?**
Matched symptoms ÷ symptoms required by the rule × 100.

**What if two diseases tie?**
The one with more matched symptoms ranks first, and the system shows all top 3 plus the missing symptoms so the user can check further.

**Limitations?**
- It only knows what's in its rules and cannot learn by itself.
- Every symptom counts equally, even though some matter more.
- Its accuracy depends on the user describing the symptoms correctly.

**Future improvements?**
- Weighted symptoms or certainty factors (important symptoms count more).
- An admin page so experts can add rules without SQL.
- Image recognition (machine learning) from leaf photos.
- A Tagalog/Bisaya interface.

**Why are there pictures?**
Farmers may not know technical terms. A photo helps them match what they see in the field, so the facts entered into the system are more accurate, which means better results.

**Why did you use MySQL instead of hard-coding the rules?**
Knowledge is separate from the engine, so experts can update the rules without changing the code.

---

*For learning purposes only. Always confirm a diagnosis with a local agriculturist.*
