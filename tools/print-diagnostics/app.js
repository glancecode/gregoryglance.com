const STORAGE_KEY = "print-diagnostics-history-v1";

const fallbackDefects = [
  ["stringing", "Stringing", "Thin strands appear between travel moves."],
  ["first_layer", "Poor first layer adhesion", "The first layer will not stick reliably."],
  ["warping", "Warping", "Corners or edges lift as the part cools."],
  ["under_extrusion", "Under-extrusion", "Lines look thin, skipped, or starved for plastic."],
  ["over_extrusion", "Over-extrusion", "Surfaces look swollen or dimensions are oversized."],
  ["ringing", "Ringing / ghosting", "Ripples appear after corners or sharp features."],
  ["elephant_foot", "Elephant foot", "The bottom layers bulge outward."],
  ["layer_shift", "Layer shift", "The print suddenly offsets on X or Y."],
  ["blobs_zits", "Blobs / zits", "Small bumps appear on outer walls."],
  ["bridging", "Bridging failure", "Plastic sags when crossing open spans."]
];

const state = {
  dataset: null,
  intake: {},
  selectedDefect: null,
  answers: {},
  result: null
};

const els = {
  defectChips: document.getElementById("defect-chips"),
  defectSelect: document.getElementById("defect-select"),
  exampleList: document.getElementById("example-list"),
  intakeForm: document.getElementById("intake-form"),
  intakeStatus: document.getElementById("intake-status"),
  questions: document.getElementById("questions"),
  questionContext: document.getElementById("question-context"),
  questionForm: document.getElementById("question-form"),
  questionList: document.getElementById("question-list"),
  backToIntake: document.getElementById("back-to-intake"),
  results: document.getElementById("results"),
  resultCard: document.getElementById("result-card"),
  actionList: document.getElementById("action-list"),
  backupList: document.getElementById("backup-list"),
  guardrailList: document.getElementById("guardrail-list"),
  calibrationPrint: document.getElementById("calibration-print"),
  copyResult: document.getElementById("copy-result"),
  saveResult: document.getElementById("save-result"),
  startOver: document.getElementById("start-over"),
  saveStatus: document.getElementById("save-status"),
  historyPanel: document.getElementById("history-panel")
};

init();

async function init() {
  state.dataset = await loadDataset();
  renderDefects();
  renderExamples();
  renderHistory();
  bindEvents();
}

async function loadDataset() {
  try {
    const res = await fetch("./data/rules.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`Dataset returned ${res.status}`);
    const text = await res.text();
    if (!text.trim()) throw new Error("Dataset was empty");
    const data = JSON.parse(text);
    if (!Array.isArray(data.defects) || data.defects.length < 10) {
      throw new Error("Dataset did not include the expected defect families");
    }
    return data;
  } catch (error) {
    console.warn("Using fallback print diagnostics dataset.", error);
    return buildFallbackDataset();
  }
}

function buildFallbackDataset() {
  return {
    version: "fallback",
    defects: fallbackDefects.map(([id, name, summary]) => ({
      id,
      name,
      summary,
      questions: [
        {
          id: "where",
          text: "Where is the issue most obvious?",
          options: [
            { id: "start", label: "Near starts, seams, or corners" },
            { id: "surface", label: "Across the surface" },
            { id: "unknown", label: "Not sure" }
          ]
        },
        {
          id: "changed",
          text: "Did this begin after a material, temperature, or profile change?",
          options: [
            { id: "yes", label: "Yes" },
            { id: "no", label: "No" },
            { id: "unknown", label: "Not sure" }
          ]
        },
        {
          id: "repeat",
          text: "Does it repeat in the same place on the same model?",
          options: [
            { id: "yes", label: "Yes" },
            { id: "no", label: "No" },
            { id: "unknown", label: "Not sure" }
          ]
        }
      ],
      causes: [
        { title: "Profile setting is mismatched to the symptom", signals: ["changed:yes", "where:surface"] },
        { title: "Mechanical or model-specific condition is repeating", signals: ["repeat:yes"] },
        { title: "Start with the simplest baseline retest", signals: ["changed:unknown", "repeat:unknown"] }
      ],
      actions: [
        "Return the most recently changed setting to its known-good value.",
        "Run a small calibration print that isolates this defect.",
        "Change only one variable before retesting."
      ],
      guardrails: ["Do not tune unrelated settings first", "Do not change several slicer values at once"],
      calibration: "Small focused calibration print",
      notes: ["This fallback is intentionally conservative.", "Reload after deploy if the full rules dataset was still caching."]
    }))
  };
}

function bindEvents() {
  els.defectSelect.addEventListener("change", () => setSelectedChip(els.defectSelect.value));
  els.intakeForm.addEventListener("submit", handleIntake);
  els.questionForm.addEventListener("submit", handleQuestions);
  els.backToIntake.addEventListener("click", () => scrollToSection("intake"));
  els.copyResult.addEventListener("click", copyResultSummary);
  els.saveResult.addEventListener("click", saveCurrentResult);
  els.startOver.addEventListener("click", resetFlow);
}

function renderDefects() {
  const defects = state.dataset.defects;
  els.defectChips.innerHTML = "";
  defects.forEach((defect) => {
    const option = document.createElement("option");
    option.value = defect.id;
    option.textContent = defect.name;
    els.defectSelect.appendChild(option);

    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.dataset.defectId = defect.id;
    chip.textContent = defect.name;
    chip.addEventListener("click", () => {
      els.defectSelect.value = defect.id;
      setSelectedChip(defect.id);
      scrollToSection("intake");
      els.defectSelect.focus();
    });
    els.defectChips.appendChild(chip);
  });
}

function renderExamples() {
  const examples = [
    { defectId: "stringing", label: "Stringing between towers", material: "PETG" },
    { defectId: "first_layer", label: "Weak first layer", material: "PLA" },
    { defectId: "warping", label: "Corners lifting", material: "ABS" }
  ];

  els.exampleList.innerHTML = "";
  examples.forEach((example) => {
    const defect = getDefect(example.defectId);
    if (!defect) return;
    const card = document.createElement("article");
    card.className = "example-card";
    card.innerHTML = `
      <p class="label">${escapeHtml(example.material)}</p>
      <h3>${escapeHtml(example.label)}</h3>
      <p>${escapeHtml(defect.summary)}</p>
      <button class="button button-secondary button-small" type="button">Preview result</button>
    `;
    card.querySelector("button").addEventListener("click", () => loadExample(example.defectId, example.material));
    els.exampleList.appendChild(card);
  });
}

function handleIntake(event) {
  event.preventDefault();
  const form = new FormData(els.intakeForm);
  const defectId = String(form.get("defectId") || "");
  const defect = getDefect(defectId);
  if (!defect) {
    els.intakeStatus.textContent = "Choose the defect family that looks closest to your print.";
    els.defectSelect.focus();
    return;
  }

  state.intake = {
    printerModel: clean(form.get("printerModel")),
    filamentMaterial: clean(form.get("filamentMaterial")),
    nozzleSize: clean(form.get("nozzleSize")),
    profileName: clean(form.get("profileName")),
    note: clean(form.get("note")),
    defectId
  };
  state.selectedDefect = defect;
  state.answers = {};
  els.intakeStatus.textContent = "";
  renderQuestions(defect);
  show(els.questions);
  scrollToSection("questions");
}

function renderQuestions(defect) {
  els.questionContext.innerHTML = `
    <p class="label">Current diagnosis</p>
    <p><strong>${escapeHtml(defect.name)}</strong>${contextLine()}</p>
  `;
  els.questionList.innerHTML = "";

  defect.questions.forEach((question, index) => {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "question-card";
    fieldset.innerHTML = `
      <legend>${index + 1}. ${escapeHtml(question.text)}</legend>
      <div class="answer-list">
        ${question.options.map((option) => `
          <label>
            <input
              type="radio"
              name="${escapeHtml(question.id)}"
              value="${escapeHtml(option.id)}"
              required
            />
            <span>${escapeHtml(option.label)}</span>
          </label>
        `).join("")}
      </div>
    `;
    els.questionList.appendChild(fieldset);
  });
}

function handleQuestions(event) {
  event.preventDefault();
  if (!state.selectedDefect) return;

  const form = new FormData(els.questionForm);
  const answers = {};
  for (const question of state.selectedDefect.questions) {
    const answer = String(form.get(question.id) || "");
    if (!answer) {
      const missing = els.questionList.querySelector(`input[name="${CSS.escape(question.id)}"]`);
      missing?.focus();
      return;
    }
    answers[question.id] = answer;
  }

  state.answers = answers;
  state.result = buildResult(state.selectedDefect, answers);
  renderResult();
  show(els.results);
  scrollToSection("results");
}

function buildResult(defect, answers) {
  const scored = defect.causes.map((cause) => {
    const score = cause.signals.reduce((sum, signal) => {
      const [questionId, answerId] = signal.split(":");
      return sum + (answers[questionId] === answerId ? 1 : 0);
    }, 0);
    return { cause, score };
  }).sort((a, b) => b.score - a.score);

  const top = scored[0] || { cause: { title: "Start with a controlled retest", signals: [] }, score: 0 };
  const confidence = top.score >= 2 ? "Strong match" : top.score === 1 ? "Moderate match" : "Conservative first pass";
  return {
    defect,
    topCause: top.cause,
    confidence,
    backupCauses: scored.slice(1, 3).map((entry) => entry.cause)
  };
}

function renderResult() {
  const { defect, topCause, confidence, backupCauses } = state.result;
  els.resultCard.innerHTML = `
    <p class="label">Most likely cause</p>
    <h3>${escapeHtml(topCause.title)}</h3>
    <p><strong>${escapeHtml(confidence)}.</strong> ${escapeHtml(defect.summary)}</p>
    <p>${escapeHtml(buildWhyText(defect, topCause))}</p>
  `;
  renderList(els.actionList, defect.actions, "ol");
  renderList(els.backupList, backupCauses.map((cause) => cause.title), "ul");
  renderList(els.guardrailList, defect.guardrails, "ul");
  els.calibrationPrint.textContent = defect.calibration;
  renderHistory();
}

function buildWhyText(defect, cause) {
  const labels = [];
  defect.questions.forEach((question) => {
    const selected = question.options.find((option) => option.id === state.answers[question.id]);
    if (selected) labels.push(`${question.text} ${selected.label}`);
  });
  return labels.length
    ? `Matched from your answers: ${labels.join("; ")}.`
    : "Matched from the selected defect family and default first-pass ranking.";
}

function renderList(node, items) {
  node.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    node.appendChild(li);
  });
}

async function copyResultSummary() {
  if (!state.result) return;
  const summary = resultSummaryText();
  try {
    await navigator.clipboard.writeText(summary);
    els.saveStatus.textContent = "Copied the diagnosis summary.";
  } catch {
    els.saveStatus.textContent = summary;
  }
}

function saveCurrentResult() {
  if (!state.result) return;
  const history = getHistory();
  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    createdAt: new Date().toISOString(),
    defect: state.result.defect.name,
    topCause: state.result.topCause.title,
    calibration: state.result.defect.calibration,
    intake: state.intake
  };
  history.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 8)));
  els.saveStatus.textContent = "Saved locally in this browser.";
  renderHistory();
}

function renderHistory() {
  const history = getHistory();
  if (!history.length) {
    els.historyPanel.innerHTML = "<p>No saved diagnoses yet.</p>";
    return;
  }
  els.historyPanel.innerHTML = `
    <p class="label">Recent saved diagnoses</p>
    <ul class="history-list">
      ${history.slice(0, 4).map((entry) => `
        <li>
          <strong>${escapeHtml(entry.defect)}</strong>
          <span>${escapeHtml(entry.topCause)}</span>
        </li>
      `).join("")}
    </ul>
  `;
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function loadExample(defectId, material) {
  const defect = getDefect(defectId);
  if (!defect) return;
  els.defectSelect.value = defectId;
  setSelectedChip(defectId);
  state.intake = {
    printerModel: "Example printer",
    filamentMaterial: material,
    nozzleSize: "0.4 mm",
    profileName: "Example profile",
    note: "",
    defectId
  };
  state.selectedDefect = defect;
  state.answers = {};
  defect.questions.forEach((question) => {
    state.answers[question.id] = question.options[0]?.id || "";
  });
  state.result = buildResult(defect, state.answers);
  renderQuestions(defect);
  renderResult();
  show(els.questions);
  show(els.results);
  scrollToSection("results");
}

function resetFlow() {
  state.intake = {};
  state.selectedDefect = null;
  state.answers = {};
  state.result = null;
  els.intakeForm.reset();
  els.questionForm.reset();
  hide(els.questions);
  hide(els.results);
  setSelectedChip("");
  els.saveStatus.textContent = "";
  scrollToSection("intake");
}

function resultSummaryText() {
  if (!state.result) return "";
  const { defect, topCause } = state.result;
  return [
    `3D print diagnosis: ${defect.name}`,
    `Most likely cause: ${topCause.title}`,
    `Try first: ${defect.actions[0]}`,
    `Calibration print: ${defect.calibration}`
  ].join("\n");
}

function getDefect(id) {
  return state.dataset.defects.find((defect) => defect.id === id);
}

function setSelectedChip(id) {
  els.defectChips.querySelectorAll(".chip").forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.defectId === id);
  });
}

function contextLine() {
  const bits = [state.intake.printerModel, state.intake.filamentMaterial, state.intake.nozzleSize].filter(Boolean);
  return bits.length ? ` - ${bits.map(escapeHtml).join(" - ")}` : "";
}

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function show(node) {
  node.classList.remove("hidden");
}

function hide(node) {
  node.classList.add("hidden");
}

function clean(value) {
  return String(value || "").trim();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
