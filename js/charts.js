/* Interactive Charts & Live Data Processing - Prof. Diego Gonçalves (z.olhos) */

// Global Apps Script URL - Configured with real WebApp URL
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzf0jKrq6oZv_i7qngw8mwN9U6mSYcB1WdOYGhmFYcr_zKW265ZIWKM6SgUGWWCoyBX/exec";

// Metadata for the 6 Form Questions
const questionsMeta = {
  1: {
    title: "Gráfico 1 • Meio de Transporte para a Escola",
    badge: "Qualitativa Nominal",
    badgeClass: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    statement: '"Qual é o seu principal meio de transporte para chegar à escola/curso?"',
    type: "doughnut"
  },
  2: {
    title: "Gráfico 2 • Área Técnica Pretendida no COTUCA / IF",
    badge: "Qualitativa Nominal",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    statement: '"Qual área do ensino técnico você mais tem interesse em cursar no COTUCA/ETEC/IF?"',
    type: "barHorizontal"
  },
  3: {
    title: "Gráfico 3 • Meta de Escolaridade Futura",
    badge: "Qualitativa Ordinal",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    statement: '"Qual é o nível máximo de escolaridade que você pretende alcançar no futuro?"',
    type: "pie"
  },
  4: {
    title: "Gráfico 4 • Adensamento Domiciliar (Moradores)",
    badge: "Quantitativa Discreta",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    statement: '"Quantas pessoas (incluindo você) moram atualmente na sua residência?"',
    type: "barDiscrete"
  },
  5: {
    title: "Gráfico 5 • Tempo de Deslocamento Diário (Minutos)",
    badge: "Quantitativa Contínua",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    statement: '"Aproximadamente, quanto tempo (em minutos) você leva no seu deslocamento diário de ida/volta até a escola/curso?"',
    type: "barHistogram"
  },
  6: {
    title: "Gráfico 6 • Indicador Cultural (Livros Lidos)",
    badge: "Quantitativa Discreta",
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    statement: '"Quantos livros inteiros (fora os da escola) você leu no último ano?"',
    type: "barDiscrete"
  }
};

// Rich Sample Data for all 6 questions (Fallback IBGE / Class Sample)
const samplePollData = {
  1: { "Ônibus / Transporte Público": 18, "A pé": 8, "Carro / Moto": 4, "Bicicleta": 2 },
  2: { "Informática / Tecnologia": 12, "Alimentos": 6, "Enfermagem / Saúde": 5, "Eletrotécnica / Mecânica": 7, "Indeciso": 2 },
  3: { "Ensino Técnico Completo": 6, "Ensino Superior (Graduação)": 16, "Pós-Graduação (Mestrado/Doutorado)": 10 },
  4: { "2 pessoas": 3, "3 pessoas": 9, "4 pessoas": 12, "5+ pessoas": 8 },
  5: [15, 20, 25, 25, 30, 30, 35, 40, 45, 50, 60, 90, 120],
  6: { "0 livros": 5, "1 a 2 livros": 14, "3 a 5 livros": 9, "6+ livros": 4 }
};

let liveDataProcessed = null;
let currentActiveQTab = 5;

let liveChartInstance = null;
let outlierChartInstance = null;
let equityChartInstance = null;
let modeDataGlobal = { "Ônibus": 18, "A pé": 8, "Carro": 4, "Bicicleta": 2 };

document.addEventListener('DOMContentLoaded', () => {
  initLiveClassChart();
  initQTabSwitching();
  initNeymarOutlierSimulator();
  initEquitySimulator();
  initWeightedMeanCalculator();
  initMedianSimulator();
  initModeSimulator();
});

/* 1. Live Class Data Chart & Question Tab Switcher */
function initLiveClassChart() {
  const ctx = document.getElementById('liveClassChart');
  if (!ctx) return;

  const btnFetch = document.getElementById('fetch-live-data-btn');
  const btnSample = document.getElementById('load-sample-data-btn');

  // Initial render with Sample Data
  liveDataProcessed = samplePollData;
  renderQuestionChart(currentActiveQTab);

  if (btnFetch) {
    btnFetch.addEventListener('click', () => fetchLiveDataFromAppsScript());
  }
  if (btnSample) {
    btnSample.addEventListener('click', () => {
      liveDataProcessed = samplePollData;
      renderQuestionChart(currentActiveQTab);
      showNotification("Dados de Exemplo (IBGE) carregados com sucesso!");
    });
  }
}

function initQTabSwitching() {
  const qtabBtns = document.querySelectorAll('.live-qtab-btn');
  qtabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const qNum = parseInt(e.currentTarget.getAttribute('data-qtab'));
      if (qNum && questionsMeta[qNum]) {
        currentActiveQTab = qNum;

        qtabBtns.forEach(b => {
          b.className = 'live-qtab-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-all whitespace-nowrap';
        });
        e.currentTarget.className = 'live-qtab-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 text-white border border-violet-500 transition-all whitespace-nowrap';

        renderQuestionChart(currentActiveQTab);
      }
    });
  });
}

async function fetchLiveDataFromAppsScript() {
  const statusEl = document.getElementById('live-data-status');
  if (statusEl) statusEl.textContent = '⏳ Baixando respostas da sala ao vivo...';

  try {
    if (!APPS_SCRIPT_URL || !APPS_SCRIPT_URL.startsWith("http")) {
      if (statusEl) statusEl.textContent = 'ℹ️ Usando dados de exemplo (URL do Apps Script não configurada).';
      liveDataProcessed = samplePollData;
      renderQuestionChart(currentActiveQTab);
      return;
    }

    const response = await fetch(APPS_SCRIPT_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length <= 1) {
      if (statusEl) statusEl.textContent = '⚠️ Nenhuma resposta registrada no formulário ainda. Exibindo dados de exemplo.';
      liveDataProcessed = samplePollData;
      renderQuestionChart(currentActiveQTab);
      return;
    }

    // Process all 6 questions from the real Google Form rows
    const parsedData = {
      1: {},
      2: {},
      3: {},
      4: {},
      5: [],
      6: {}
    };

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      // Q1: Meio de Transporte (row[1])
      const q1Val = String(row[1] || "").trim();
      if (q1Val) parsedData[1][q1Val] = (parsedData[1][q1Val] || 0) + 1;

      // Q2: Área Técnica (row[2])
      const q2Val = String(row[2] || "").trim();
      if (q2Val) parsedData[2][q2Val] = (parsedData[2][q2Val] || 0) + 1;

      // Q3: Escolaridade (row[3])
      const q3Val = String(row[3] || "").trim();
      if (q3Val) parsedData[3][q3Val] = (parsedData[3][q3Val] || 0) + 1;

      // Q4: Moradores (row[4])
      const q4Val = parseInt(row[4]);
      if (!isNaN(q4Val)) {
        const key = q4Val >= 5 ? "5+ pessoas" : `${q4Val} pessoas`;
        parsedData[4][key] = (parsedData[4][key] || 0) + 1;
      }

      // Q5: Tempo Deslocamento (row[5])
      const q5Val = parseFloat(row[5]);
      if (!isNaN(q5Val) && q5Val > 0) {
        parsedData[5].push(q5Val);
      }

      // Q6: Livros Lidos (row[6])
      const q6Val = parseInt(row[6]);
      if (!isNaN(q6Val)) {
        let key = `${q6Val} livro(s)`;
        if (q6Val === 0) key = "0 livros";
        else if (q6Val <= 2) key = "1 a 2 livros";
        else if (q6Val <= 5) key = "3 a 5 livros";
        else key = "6+ livros";
        parsedData[6][key] = (parsedData[6][key] || 0) + 1;
      }
    }

    liveDataProcessed = parsedData;
    const totalRespostas = data.length - 1;
    if (statusEl) statusEl.textContent = `✅ ${totalRespostas} resposta(s) da sala ao vivo carregada(s) com sucesso!`;

    renderQuestionChart(currentActiveQTab);
  } catch (err) {
    console.error("Erro no Apps Script fetch:", err);
    if (statusEl) statusEl.textContent = '⚠️ Falha na conexão com o Google Sheets. Exibindo dados de demonstração.';
    liveDataProcessed = samplePollData;
    renderQuestionChart(currentActiveQTab);
  }
}

function renderQuestionChart(qNum) {
  const meta = questionsMeta[qNum];
  if (!meta) return;

  // Update header text, badge and statement
  document.getElementById('live-q-title').textContent = meta.title;
  
  const badgeEl = document.getElementById('live-q-badge');
  badgeEl.textContent = meta.badge;
  badgeEl.className = `text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${meta.badgeClass}`;
  
  document.getElementById('live-q-statement').textContent = meta.statement;

  const statsRow = document.getElementById('live-stats-row');
  const ctx = document.getElementById('liveClassChart');
  if (!ctx) return;

  const dataset = (liveDataProcessed && liveDataProcessed[qNum]) ? liveDataProcessed[qNum] : samplePollData[qNum];

  // Show stats row for Q5 (Deslocamento contínuo)
  if (qNum === 5) {
    statsRow.classList.remove('hidden');
    const times = Array.isArray(dataset) && dataset.length > 0 ? dataset : samplePollData[5];
    times.sort((a, b) => a - b);
    const mean = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1);
    const mid = Math.floor(times.length / 2);
    const median = times.length % 2 !== 0 ? times[mid] : ((times[mid - 1] + times[mid]) / 2).toFixed(1);
    const variance = times.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / times.length;
    const stdDev = Math.sqrt(variance).toFixed(1);

    document.getElementById('live-mean-val').textContent = `${mean} min`;
    document.getElementById('live-median-val').textContent = `${median} min`;
    document.getElementById('live-std-val').textContent = `${stdDev} min`;

    const counts = { "0-20 min": 0, "21-40 min": 0, "41-60 min": 0, "61+ min": 0 };
    times.forEach(t => {
      if (t <= 20) counts["0-20 min"]++;
      else if (t <= 40) counts["21-40 min"]++;
      else if (t <= 60) counts["41-60 min"]++;
      else counts["61+ min"]++;
    });

    renderChartInstance('bar', Object.keys(counts), Object.values(counts), '#34D399', 'Nº de Alunos');
  } else {
    statsRow.classList.add('hidden');

    const labels = Object.keys(dataset);
    const values = Object.values(dataset);

    if (meta.type === 'doughnut') {
      renderChartInstance('doughnut', labels, values, ['#8B5CF6', '#34D399', '#FBBF24', '#EC4899', '#3B82F6']);
    } else if (meta.type === 'pie') {
      renderChartInstance('pie', labels, values, ['#34D399', '#8B5CF6', '#FBBF24', '#EC4899']);
    } else if (meta.type === 'barHorizontal') {
      renderChartInstance('bar', labels, values, '#8B5CF6', 'Frequência Absoluta', true);
    } else {
      renderChartInstance('bar', labels, values, '#34D399', 'Frequência Absoluta');
    }
  }
}

function renderChartInstance(type, labels, data, bgColors, datasetLabel = 'Respostas', isHorizontal = false) {
  const ctx = document.getElementById('liveClassChart');
  if (!ctx) return;

  if (liveChartInstance) liveChartInstance.destroy();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: (type === 'doughnut' || type === 'pie'),
        position: 'right',
        labels: { color: '#94A3B8', font: { size: 11 } }
      }
    }
  };

  if (type === 'bar') {
    options.indexAxis = isHorizontal ? 'y' : 'x';
    options.scales = {
      y: { ticks: { color: '#94A3B8' }, grid: { color: '#334155' } },
      x: { ticks: { color: '#94A3B8' }, grid: { color: isHorizontal ? '#334155' : 'transparent' } }
    };
  }

  liveChartInstance = new Chart(ctx, {
    type: type,
    data: {
      labels: labels,
      datasets: [{
        label: datasetLabel,
        data: data,
        backgroundColor: bgColors,
        borderRadius: type === 'bar' ? 6 : 0
      }]
    },
    options: options
  });
}

/* 2. Neymar Outlier Simulator (Bloco 2) */
function initNeymarOutlierSimulator() {
  const slider = document.getElementById('rich-salary-slider');
  const salaryValEl = document.getElementById('rich-salary-val');
  if (!slider) return;

  const updateNeymarSimulation = () => {
    const richSalary = parseFloat(slider.value);
    salaryValEl.textContent = richSalary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const baseSalaries = Array(19).fill(1412);
    const allSalaries = [...baseSalaries, richSalary];

    const mean = (allSalaries.reduce((a, b) => a + b, 0) / 20);
    const median = 1412;

    document.getElementById('neymar-mean-display').textContent = mean.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('neymar-median-display').textContent = median.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    renderOutlierChart(mean, median, richSalary);
  };

  slider.addEventListener('input', updateNeymarSimulation);
  updateNeymarSimulation();
}

function renderOutlierChart(mean, median, richSalary) {
  const ctx = document.getElementById('neymarOutlierChart');
  if (!ctx) return;

  if (outlierChartInstance) outlierChartInstance.destroy();

  outlierChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Mediana (50% da Sala)', 'Média (Distorcida pelo Outlier)'],
      datasets: [{
        data: [median, mean],
        backgroundColor: ['#34D399', '#FBBF24'],
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { color: '#94A3B8' }, grid: { color: '#334155' } },
        x: { ticks: { color: '#F8FAFC', font: { weight: 'bold' } }, grid: { display: false } }
      }
    }
  });
}

/* 3. Equity Allocation & Standard Deviation Simulator (Bloco 3) - Updated to R$ 600,00 per student */
function initEquitySimulator() {
  const sliders = [
    document.getElementById('fund-bairro-a'),
    document.getElementById('fund-bairro-b'),
    document.getElementById('fund-bairro-c'),
    document.getElementById('fund-bairro-d')
  ];

  const valLabels = [
    document.getElementById('fund-val-a'),
    document.getElementById('fund-val-b'),
    document.getElementById('fund-val-c'),
    document.getElementById('fund-val-d')
  ];

  if (!sliders[0]) return;

  const updateEquitySimulation = () => {
    const funds = sliders.map((s, idx) => {
      const val = parseFloat(s.value);
      if (valLabels[idx]) {
        valLabels[idx].textContent = `${val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / aluno`;
      }
      return val;
    });

    const mean = funds.reduce((a, b) => a + b, 0) / 4;

    const variance = funds.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / 4;
    const stdDev = Math.sqrt(variance);

    document.getElementById('equity-mean-val').textContent = `${mean.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / aluno`;
    document.getElementById('equity-std-val').textContent = `${stdDev.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;

    const statusBadge = document.getElementById('equity-status-badge');
    if (stdDev < 50) {
      statusBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      statusBadge.textContent = '🟢 Alta Equidade (Baixo Desvio Padrão)';
    } else if (stdDev < 200) {
      statusBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30';
      statusBadge.textContent = '🟡 Desigualdade Moderada';
    } else {
      statusBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30';
      statusBadge.textContent = '🔴 Alta Iniquidade (Elevado Desvio Padrão)';
    }

    renderEquityChart(funds);
  };

  sliders.forEach(s => s.addEventListener('input', updateEquitySimulation));
  updateEquitySimulation();
}

function renderEquityChart(funds) {
  const ctx = document.getElementById('equityChart');
  if (!ctx) return;

  if (equityChartInstance) equityChartInstance.destroy();

  equityChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Escola Bairro A', 'Escola Bairro B', 'Escola Bairro C', 'Escola Bairro D'],
      datasets: [{
        label: 'Investimento por Aluno (R$)',
        data: funds,
        backgroundColor: ['#8B5CF6', '#34D399', '#FBBF24', '#EC4899'],
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { color: '#94A3B8' }, grid: { color: '#334155' } },
        x: { ticks: { color: '#94A3B8' }, grid: { display: false } }
      }
    }
  });
}

/* 4. Interactive Weighted Mean Calculator (Bloco 2) */
function initWeightedMeanCalculator() {
  const inputs = [
    { val: document.getElementById('wp-val-1'), weight: document.getElementById('wp-weight-1') },
    { val: document.getElementById('wp-val-2'), weight: document.getElementById('wp-weight-2') },
    { val: document.getElementById('wp-val-3'), weight: document.getElementById('wp-weight-3') }
  ];

  const resultEl = document.getElementById('weighted-mean-result');
  if (!inputs[0].val || !resultEl) return;

  const calculateWeightedMean = () => {
    let sumProduct = 0;
    let sumWeights = 0;

    inputs.forEach(item => {
      const v = parseFloat(item.val.value) || 0;
      const w = parseFloat(item.weight.value) || 0;
      sumProduct += v * w;
      sumWeights += w;
    });

    const result = sumWeights > 0 ? (sumProduct / sumWeights).toFixed(2) : "0,00";
    resultEl.textContent = result.replace('.', ',');
  };

  inputs.forEach(item => {
    item.val.addEventListener('input', calculateWeightedMean);
    item.weight.addEventListener('input', calculateWeightedMean);
  });

  calculateWeightedMean();
}

/* 5. Interactive Median & Rol Visualizer (Bloco 2) */
function initMedianSimulator() {
  const inputEl = document.getElementById('median-input-list');
  const btnEl = document.getElementById('calc-median-btn');
  const container = document.getElementById('median-visual-container');

  if (!inputEl || !btnEl || !container) return;

  const renderMedianVisualizer = () => {
    const rawText = inputEl.value;
    const nums = rawText.split(',')
      .map(s => parseFloat(s.trim()))
      .filter(n => !isNaN(n));

    if (nums.length === 0) {
      container.innerHTML = '<p class="text-rose-400 text-xs">Por favor, insira números válidos separados por vírgula.</p>';
      return;
    }

    const rawListHtml = nums.map(n => `<span class="px-2 py-1 bg-slate-800 rounded border border-slate-700">${n}</span>`).join(' ');
    
    const sorted = [...nums].sort((a, b) => a - b);
    const n = sorted.length;
    const isOdd = n % 2 !== 0;

    let medianVal = 0;
    let medianIndices = [];

    if (isOdd) {
      const midIdx = Math.floor(n / 2);
      medianVal = sorted[midIdx];
      medianIndices = [midIdx];
    } else {
      const mid1 = (n / 2) - 1;
      const mid2 = n / 2;
      medianVal = (sorted[mid1] + sorted[mid2]) / 2;
      medianIndices = [mid1, mid2];
    }

    const sortedListHtml = sorted.map((val, idx) => {
      const isCentral = medianIndices.includes(idx);
      if (isCentral) {
        return `<span class="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-bold border-2 border-emerald-500 rounded shadow-md transform scale-110">${val}</span>`;
      }
      return `<span class="px-2 py-1 bg-slate-900 text-slate-400 border border-slate-700 rounded">${val}</span>`;
    }).join(' ');

    container.innerHTML = `
      <div class="space-y-2">
        <div class="text-[11px] text-slate-400">
          <span class="text-slate-300 font-bold">1. Lista Original (Desordenada):</span> [ ${rawListHtml} ] (Total: ${n} elementos)
        </div>
        <div class="text-[11px] text-slate-300">
          <span class="text-emerald-400 font-bold">2. Rol Ordenado:</span> [ ${sortedListHtml} ]
        </div>
        <div class="p-2.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-xs text-emerald-300 font-semibold flex items-center justify-between">
          <span>${isOdd ? 'Nº Ímpar de dados (Elemento Central)' : 'Nº Par de dados (Média dos 2 Centrais)'}:</span>
          <span class="text-sm font-bold font-mono text-emerald-400">Mediana (Md) = ${medianVal}</span>
        </div>
      </div>
    `;
  };

  btnEl.addEventListener('click', renderMedianVisualizer);
  inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') renderMedianVisualizer();
  });

  renderMedianVisualizer();
}

/* 6. Interactive Mode & Frequency Builder (Bloco 2) */
function updateModeUI() {
  const onibusEl = document.getElementById('mode-count-onibus');
  const apeEl = document.getElementById('mode-count-ape');
  const carroEl = document.getElementById('mode-count-carro');
  const bikeEl = document.getElementById('mode-count-bike');
  const resultEl = document.getElementById('mode-result-display');
  const badgeEl = document.getElementById('mode-type-badge');

  if (!onibusEl || !resultEl) return;

  onibusEl.textContent = modeDataGlobal["Ônibus"];
  apeEl.textContent = modeDataGlobal["A pé"];
  carroEl.textContent = modeDataGlobal["Carro"];
  bikeEl.textContent = modeDataGlobal["Bicicleta"];

  const maxFreq = Math.max(...Object.values(modeDataGlobal));
  const modes = Object.keys(modeDataGlobal).filter(key => modeDataGlobal[key] === maxFreq && maxFreq > 0);

  if (maxFreq === 0) {
    badgeEl.textContent = 'Amodal';
    badgeEl.className = 'text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded';
    resultEl.textContent = 'Nenhuma resposta inserida (Amodal)';
  } else if (modes.length === 1) {
    badgeEl.textContent = 'Unimodal';
    badgeEl.className = 'text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30';
    resultEl.textContent = `🏆 ${modes[0]} (${maxFreq} votos)`;
  } else if (modes.length > 1 && modes.length < Object.keys(modeDataGlobal).length) {
    badgeEl.textContent = `Bimodal (${modes.length} Modas)`;
    badgeEl.className = 'text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30';
    resultEl.textContent = `🏆 Empate: ${modes.join(' e ')} (${maxFreq} votos cada)`;
  } else {
    badgeEl.textContent = 'Amodal (Empate Geral)';
    badgeEl.className = 'text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded';
    resultEl.textContent = `Todos os itens têm a mesma frequência (${maxFreq} votos)`;
  }
}

function initModeSimulator() {
  const incBtns = document.querySelectorAll('.mode-inc-btn');
  const decBtns = document.querySelectorAll('.mode-dec-btn');

  incBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const item = e.currentTarget.getAttribute('data-item');
      if (item && modeDataGlobal[item] !== undefined) {
        modeDataGlobal[item]++;
        updateModeUI();
      }
    });
  });

  decBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const item = e.currentTarget.getAttribute('data-item');
      if (item && modeDataGlobal[item] !== undefined && modeDataGlobal[item] > 0) {
        modeDataGlobal[item]--;
        updateModeUI();
      }
    });
  });

  updateModeUI();
}

function showNotification(msg) {
  const statusEl = document.getElementById('live-data-status');
  if (statusEl) statusEl.textContent = `ℹ️ ${msg}`;
}
