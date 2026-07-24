/* Interactive Charts & Live Data Processing - Prof. Diego Gonçalves (z.olhos) */

// Global Apps Script URL - Replace with the URL generated in Google Apps Script Deploy
const APPS_SCRIPT_URL = "COLE_SUA_URL_DO_APPS_SCRIPT_AQUI";

// Fallback IBGE / Sample Data for Class Poll
const fallbackPollData = {
  transporte: { "Ônibus": 18, "A pé": 8, "Carro": 4, "Bicicleta": 2 },
  deslocamento: [15, 20, 25, 25, 30, 30, 35, 40, 45, 50, 60, 90, 120]
};

let liveChartInstance = null;
let outlierChartInstance = null;
let equityChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  initLiveClassChart();
  initNeymarOutlierSimulator();
  initEquitySimulator();
  initWeightedMeanCalculator();
  initMedianSimulator();
  initModeSimulator();
});

/* 1. Live Class Data Chart */
function initLiveClassChart() {
  const ctx = document.getElementById('liveClassChart');
  if (!ctx) return;

  const btnFetch = document.getElementById('fetch-live-data-btn');
  const btnSample = document.getElementById('load-sample-data-btn');

  renderLiveChart(fallbackPollData.deslocamento);

  if (btnFetch) {
    btnFetch.addEventListener('click', () => fetchLiveDataFromAppsScript());
  }
  if (btnSample) {
    btnSample.addEventListener('click', () => {
      renderLiveChart(fallbackPollData.deslocamento);
      showNotification("Dados de Exemplo (IBGE) carregados com sucesso!");
    });
  }
}

async function fetchLiveDataFromAppsScript() {
  const statusEl = document.getElementById('live-data-status');
  if (statusEl) statusEl.textContent = '⏳ Baixando dados da sala...';

  try {
    if (APPS_SCRIPT_URL === "COLE_SUA_URL_DO_APPS_SCRIPT_AQUI" || !APPS_SCRIPT_URL.startsWith("http")) {
      if (statusEl) statusEl.textContent = 'ℹ️ Usando dados de exemplo (URL do Apps Script não configurada).';
      renderLiveChart(fallbackPollData.deslocamento);
      return;
    }

    const response = await fetch(APPS_SCRIPT_URL);
    const data = await response.json();

    const times = [];
    for (let i = 1; i < data.length; i++) {
      const val = parseFloat(data[i][4] || data[i][5]);
      if (!isNaN(val) && val > 0) times.push(val);
    }

    if (times.length > 0) {
      renderLiveChart(times);
      if (statusEl) statusEl.textContent = `✅ ${times.length} respostas coletadas da sala!`;
    } else {
      if (statusEl) statusEl.textContent = '⚠️ Nenhuma resposta numérica encontrada. Exibindo dados pré-carregados.';
      renderLiveChart(fallbackPollData.deslocamento);
    }
  } catch (err) {
    if (statusEl) statusEl.textContent = '⚠️ Falha na conexão. Exibindo dados de demonstração.';
    renderLiveChart(fallbackPollData.deslocamento);
  }
}

function renderLiveChart(dataArray) {
  const ctx = document.getElementById('liveClassChart');
  if (!ctx) return;

  dataArray.sort((a, b) => a - b);
  const mean = (dataArray.reduce((a, b) => a + b, 0) / dataArray.length).toFixed(1);
  const mid = Math.floor(dataArray.length / 2);
  const median = dataArray.length % 2 !== 0 ? dataArray[mid] : ((dataArray[mid - 1] + dataArray[mid]) / 2).toFixed(1);

  const variance = dataArray.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dataArray.length;
  const stdDev = Math.sqrt(variance).toFixed(1);

  document.getElementById('live-mean-val').textContent = `${mean} min`;
  document.getElementById('live-median-val').textContent = `${median} min`;
  document.getElementById('live-std-val').textContent = `${stdDev} min`;

  const counts = { "0-20 min": 0, "21-40 min": 0, "41-60 min": 0, "61+ min": 0 };
  dataArray.forEach(t => {
    if (t <= 20) counts["0-20 min"]++;
    else if (t <= 40) counts["21-40 min"]++;
    else if (t <= 60) counts["41-60 min"]++;
    else counts["61+ min"]++;
  });

  if (liveChartInstance) liveChartInstance.destroy();

  liveChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(counts),
      datasets: [{
        label: 'Nº de Alunos',
        data: Object.values(counts),
        backgroundColor: '#34D399',
        borderRadius: 6
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

/* 3. Equity Allocation & Standard Deviation Simulator (Bloco 3) - FIXED BUG IN SLIDER LABELS */
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
        valLabels[idx].textContent = val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      }
      return val;
    });

    const mean = funds.reduce((a, b) => a + b, 0) / 4;

    const variance = funds.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / 4;
    const stdDev = Math.sqrt(variance);

    document.getElementById('equity-mean-val').textContent = mean.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('equity-std-val').textContent = stdDev.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const statusBadge = document.getElementById('equity-status-badge');
    if (stdDev < 50000) {
      statusBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      statusBadge.textContent = '🟢 Alta Equidade (Baixo Desvio Padrão)';
    } else if (stdDev < 250000) {
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
        label: 'Investimento (R$)',
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
    
    // Create Rol (Sorted)
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
function initModeSimulator() {
  const modeData = { "Ônibus": 18, "A pé": 8, "Carro": 4, "Bicicleta": 2 };

  const updateModeUI = () => {
    const onibusEl = document.getElementById('mode-count-onibus');
    const apeEl = document.getElementById('mode-count-ape');
    const carroEl = document.getElementById('mode-count-carro');
    const bikeEl = document.getElementById('mode-count-bike');
    const resultEl = document.getElementById('mode-result-display');
    const badgeEl = document.getElementById('mode-type-badge');

    if (!onibusEl || !resultEl) return;

    onibusEl.textContent = modeData["Ônibus"];
    apeEl.textContent = modeData["A pé"];
    carroEl.textContent = modeData["Carro"];
    bikeEl.textContent = modeData["Bicicleta"];

    // Find max frequency
    const maxFreq = Math.max(...Object.values(modeData));
    const modes = Object.keys(modeData).filter(key => modeData[key] === maxFreq && maxFreq > 0);

    if (maxFreq === 0) {
      badgeEl.textContent = 'Amodal';
      badgeEl.className = 'text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded';
      resultEl.textContent = 'Nenhuma resposta inserida (Amodal)';
    } else if (modes.length === 1) {
      badgeEl.textContent = 'Unimodal';
      badgeEl.className = 'text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30';
      resultEl.textContent = `🏆 ${modes[0]} (${maxFreq} votos)`;
    } else if (modes.length > 1 && modes.length < Object.keys(modeData).length) {
      badgeEl.textContent = `Bimodal (${modes.length} Modas)`;
      badgeEl.className = 'text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30';
      resultEl.textContent = `🏆 Empate: ${modes.join(' e ')} (${maxFreq} votos cada)`;
    } else {
      badgeEl.textContent = 'Amodal (Empate Geral)';
      badgeEl.className = 'text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded';
      resultEl.textContent = `Todos os itens têm a mesma frequência (${maxFreq} votos)`;
    }
  };

  const incBtns = document.querySelectorAll('.mode-inc-btn');
  const decBtns = document.querySelectorAll('.mode-dec-btn');

  incBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const item = e.currentTarget.getAttribute('data-item');
      if (item && modeData[item] !== undefined) {
        modeData[item]++;
        updateModeUI();
      }
    });
  });

  decBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const item = e.currentTarget.getAttribute('data-item');
      if (item && modeData[item] !== undefined && modeData[item] > 0) {
        modeData[item]--;
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
