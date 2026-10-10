const symptomList = document.getElementById('symptom-list');
const resultsCard = document.getElementById('results-card');
const resultsDiv = document.getElementById('results');
const errorText = document.getElementById('error');
const historyList = document.getElementById('history');

// e load ang symptoms gikan sa server, i-display as checkboxes
async function loadSymptoms() {
  try {
    const res = await fetch('/api/symptoms');
    const symptoms = await res.json();
    if (!res.ok) throw new Error(symptoms.error);

    // Each symptom = a picture card with a checkbox.
    // If the picture file is missing, onerror shows a placeholder instead.
    symptomList.innerHTML = symptoms.map(s => `
      <label class="symptom">
        <img src="images/${s.image || 'placeholder.svg'}" alt="${s.name}"
             onerror="this.onerror=null; this.src='images/placeholder.svg';" />
        <div class="symptom-text">
          <input type="checkbox" value="${s.id}" />
          <span>${s.name}</span>
        </div>
      </label>
    `).join('');
  } catch (err) {
    symptomList.textContent = err.message || 'Could not load symptoms.';
  }
}

// mo run ang diagnosis, i-send ang checked symptoms sa server
async function runDiagnosis() {
  errorText.textContent = '';

  // mo get sa checked symptoms, i-convert sa number array
  const checked = [...document.querySelectorAll('#symptom-list input:checked')]
    .map(box => Number(box.value));

  if (checked.length === 0) {
    errorText.textContent = 'Please check at least one symptom.';
    return;
  }

  const res = await fetch('/api/diagnose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms: checked }),
  });
  const results = await res.json();

  if (!res.ok) {
    errorText.textContent = results.error;
    return;
  }

  showResults(results);
  loadHistory();
}

// para mo show ang results sa page
function showResults(results) {
  resultsCard.hidden = false;

  if (results.length === 0) {
    resultsDiv.innerHTML = '<p>No matching disease found. Please consult your local agriculturist.</p>';
    return;
  }

  resultsDiv.innerHTML = results.map((r, i) => `
    <div class="result ${i === 0 ? 'top' : ''}">
      <h3>${i === 0 ? 'Most likely: ' : ''}${r.name}</h3>
      <span class="tag">${r.type}</span>
      <span class="tag">${r.confidence} confidence</span>

      <div class="bar"><span style="width:${r.score}%"></span></div>
      <small>${r.score}% of symptoms matched</small>

      <p>${r.description}</p>

      <strong>Why? Symptoms that matched:</strong>
      <ul class="matched">${r.matched.map(m => `<li>✔ ${m}</li>`).join('')}</ul>

      ${r.missing.length ? `
        <strong>Not reported (check for these too):</strong>
        <ul class="missing">${r.missing.map(m => `<li>${m}</li>`).join('')}</ul>
      ` : ''}

      <div class="advice"><strong>What to do:</strong> ${r.advice}</div>
    </div>
  `).join('');

  resultsCard.scrollIntoView({ behavior: 'smooth' });
}

// history sa previous consultations
async function loadHistory() {
  try {
    const res = await fetch('/api/history');
    const rows = await res.json();
    if (!res.ok) throw new Error();
    historyList.innerHTML = rows.length
      ? rows.map(h => `<li>${new Date(h.created_at).toLocaleString()} – <b>${h.top_result}</b> (${h.score}%)</li>`).join('')
      : '<li>No consultations yet.</li>';
  } catch {
    historyList.innerHTML = '<li>History unavailable.</li>';
  }
}

// button sa diagnose ug clear
document.getElementById('diagnose-btn').addEventListener('click', runDiagnosis);
document.getElementById('clear-btn').addEventListener('click', () => {
  document.querySelectorAll('#symptom-list input').forEach(box => (box.checked = false));
  resultsCard.hidden = true;
  errorText.textContent = '';
});

loadSymptoms();
loadHistory();
