// =========================================================
// SERVER (Express API)
// Connects the web page, the database and the inference engine.
// =========================================================
const express = require('express');
const path = require('path');
const db = require('./db');
const { diagnose } = require('./engine');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // serves index.html

// ---------- GET /api/symptoms ----------
// Sends the list of symptoms so the page can show checkboxes.
app.get('/api/symptoms', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, image FROM symptoms ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load symptoms. Is MySQL running?' });
  }
});

// ---------- POST /api/diagnose ----------
// Body: { "symptoms": [1, 2, 16] }
// 1. Load the knowledge base from MySQL
// 2. Run the inference engine
// 3. Save the consultation and send back the results
app.post('/api/diagnose', async (req, res) => {
  const selected = req.body.symptoms || [];
  if (!Array.isArray(selected) || selected.length === 0) {
    return res.status(400).json({ error: 'Please select at least one symptom.' });
  }

  try {
    const [rules] = await db.query('SELECT diagnosis_id, symptom_id FROM rules');
    const [diagnoses] = await db.query('SELECT * FROM diagnoses');
    const [symptoms] = await db.query('SELECT id, name FROM symptoms');

    const results = diagnose(selected, rules, diagnoses, symptoms);

    // Save to history (optional feature)
    const top = results[0];
    await db.query(
      'INSERT INTO consultations (selected_symptoms, top_result, score) VALUES (?, ?, ?)',
      [selected.join(','), top ? top.name : 'No match', top ? top.score : 0]
    );

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Diagnosis failed.' });
  }
});

// ---------- GET /api/history ----------
// Last 10 consultations.
app.get('/api/history', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT top_result, score, created_at FROM consultations ORDER BY id DESC LIMIT 10'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load history.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Expert system running at http://localhost:${PORT}`));
