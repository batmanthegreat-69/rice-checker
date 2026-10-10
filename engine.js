// =========================================================
// INFERENCE ENGINE  (the "brain" of the expert system)
// It does NOT know anything about rice. It only knows how to
// match the user's symptoms against the rules in the database.
// That is why you can change the topic by changing only the data.
// =========================================================

/**
 * @param {number[]} selectedIds  symptom ids the user checked
 * @param {Array}    rules        rows from the rules table: { diagnosis_id, symptom_id }
 * @param {Array}    diagnoses    rows from the diagnoses table
 * @param {Array}    symptoms     rows from the symptoms table
 * @returns top 3 results, best first
 */
function diagnose(selectedIds, rules, diagnoses, symptoms) {
  const selected = new Set(selectedIds.map(Number));

  // Helper: symptom id -> symptom text
  const symptomName = {};
  symptoms.forEach(s => { symptomName[s.id] = s.name; });

  const results = [];

  // FORWARD CHAINING: go through every rule (diagnosis) and check
  // how many of its conditions (symptoms) are true.
  for (const d of diagnoses) {
    // 1. Get all symptoms required by this diagnosis' rule
    const required = rules
      .filter(r => r.diagnosis_id === d.id)
      .map(r => r.symptom_id);

    if (required.length === 0) continue;

    // 2. Split them into matched (user has it) and missing (user doesn't)
    const matched = required.filter(id => selected.has(id));
    const missing = required.filter(id => !selected.has(id));

    if (matched.length === 0) continue; // nothing in common, skip

    // 3. Score = matched symptoms / required symptoms  (0 to 100%)
    const score = Math.round((matched.length / required.length) * 100);

    results.push({
      id: d.id,
      name: d.name,
      type: d.type,
      description: d.description,
      advice: d.advice,
      score,
      confidence: score >= 75 ? 'High' : score >= 50 ? 'Medium' : 'Low',
      // EXPLANATION: shows WHY the system concluded this
      matched: matched.map(id => symptomName[id]),
      missing: missing.map(id => symptomName[id]),
    });
  }

  // 4. Best match first. If tied, the one with more matched symptoms wins.
  results.sort((a, b) => b.score - a.score || b.matched.length - a.matched.length);

  return results.slice(0, 3);
}

module.exports = { diagnose };
