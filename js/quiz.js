/* COTUCA Interactive Quiz & Commented Solutions - Prof. Diego Gonçalves (z.olhos) */

document.addEventListener('DOMContentLoaded', () => {
  loadCotucaQuestions();
});

async function loadCotucaQuestions() {
  const container = document.getElementById('cotuca-quiz-container');
  if (!container) return;

  try {
    const response = await fetch('assets/data/questions.json');
    const questions = await response.json();

    container.innerHTML = '';
    questions.forEach((q, index) => {
      container.appendChild(createQuestionCard(q, index + 1));
    });

    // Re-render KaTeX inside dynamically injected quiz cards
    if (window.renderMathInElement) {
      window.renderMathInElement(container, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    }
  } catch (err) {
    container.innerHTML = '<p class="text-rose-400 text-sm">Erro ao carregar o banco de questões. Verifique assets/data/questions.json.</p>';
  }
}

function createQuestionCard(q, num) {
  const card = document.createElement('div');
  card.className = 'glass-card p-5 rounded-xl border border-slate-700/80 mb-6 shadow-lg';

  const optionsHtml = q.options.map(opt => `
    <button class="quiz-option-btn w-full text-left p-3 rounded-lg bg-slate-900/70 border border-slate-700/60 hover:border-violet-500/80 text-sm text-slate-200 transition-all flex items-start gap-3" data-key="${opt.key}">
      <span class="font-mono font-bold text-violet-400 uppercase border border-violet-500/30 px-2 py-0.5 rounded text-xs">${opt.key}</span>
      <span>${opt.text}</span>
    </button>
  `).join('');

  card.innerHTML = `
    <div class="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-4">
      <span class="text-xs font-mono uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-semibold">Questão ${num} • ${q.source}</span>
      <span class="text-xs font-mono text-slate-400">${q.topic}</span>
    </div>
    <div class="text-slate-100 text-sm leading-relaxed mb-4 whitespace-pre-line">${q.question}</div>
    
    <div class="space-y-2.5 mb-4 options-group">
      ${optionsHtml}
    </div>

    <div class="quiz-feedback hidden p-3 rounded-lg text-xs font-semibold mb-3"></div>

    <button class="toggle-explanation-btn hidden w-full py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-violet-300 border border-violet-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-2">
      <span>📖 Ver Gabarito Sociomatemático Comentado</span>
    </button>

    <div class="explanation-box hidden mt-3 p-4 rounded-lg bg-slate-950/80 border border-violet-500/20 text-xs text-slate-300 whitespace-pre-line font-mono-code leading-relaxed">
      ${q.explanation}
    </div>
  `;

  const optionBtns = card.querySelectorAll('.quiz-option-btn');
  const feedbackEl = card.querySelector('.quiz-feedback');
  const toggleExpBtn = card.querySelector('.toggle-explanation-btn');
  const expBox = card.querySelector('.explanation-box');

  optionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selectedKey = e.currentTarget.getAttribute('data-key');

      optionBtns.forEach(b => {
        b.classList.remove('border-emerald-500', 'border-rose-500', 'bg-emerald-500/10', 'bg-rose-500/10');
        b.classList.add('border-slate-700/60');
      });

      if (selectedKey === q.correctKey) {
        btn.classList.add('border-emerald-500', 'bg-emerald-500/10');
        feedbackEl.className = 'quiz-feedback p-3 rounded-lg text-xs font-semibold mb-3 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
        feedbackEl.textContent = '🎉 Resposta Correta! Você dominou o conceito.';
      } else {
        btn.classList.add('border-rose-500', 'bg-rose-500/10');
        feedbackEl.className = 'quiz-feedback p-3 rounded-lg text-xs font-semibold mb-3 bg-rose-500/20 text-rose-300 border border-rose-500/30';
        feedbackEl.textContent = `❌ Alternativa incorreta. A resposta certa é a alternativa (${q.correctKey.toUpperCase()}).`;
      }

      feedbackEl.classList.remove('hidden');
      toggleExpBtn.classList.remove('hidden');
    });
  });

  toggleExpBtn.addEventListener('click', () => {
    const isHidden = expBox.classList.contains('hidden');
    if (isHidden) {
      expBox.classList.remove('hidden');
      toggleExpBtn.querySelector('span').textContent = '📜 Ocultar Gabarito Comentado';
    } else {
      expBox.classList.add('hidden');
      toggleExpBtn.querySelector('span').textContent = '📖 Ver Gabarito Sociomatemático Comentado';
    }
  });

  return card;
}
