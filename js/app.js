/* Main Application Logic & Navigation - Prof. Diego Gonçalves (z.olhos) */

let currentBlock = 1;
const totalBlocks = 5;
let currentViewMode = 'mobile'; // 'mobile' or 'datashow'

document.addEventListener('DOMContentLoaded', () => {
  initViewMode();
  initNavigation();
  initKaTeX();
  initVariableClassifier();
});

function initViewMode() {
  const urlParams = new URLSearchParams(window.location.search);
  const viewParam = urlParams.get('view') || urlParams.get('mode');

  if (viewParam === 'datashow' || viewParam === 'projection') {
    setMode('datashow');
  } else if (viewParam === 'mobile') {
    setMode('mobile');
  } else {
    // Automatic detection based on screen width and touch capability
    if (window.innerWidth >= 1024 && !('ontouchstart' in window)) {
      setMode('datashow');
    } else {
      setMode('mobile');
    }
  }

  const modeBtn = document.getElementById('toggle-mode-btn');
  if (modeBtn) {
    modeBtn.addEventListener('click', () => {
      const newMode = currentViewMode === 'mobile' ? 'datashow' : 'mobile';
      setMode(newMode);
    });
  }
}

function setMode(mode) {
  currentViewMode = mode;
  const body = document.body;
  const modeLabel = document.getElementById('current-mode-label');

  if (mode === 'datashow') {
    body.classList.add('mode-datashow');
    body.classList.remove('mode-mobile');
    if (modeLabel) modeLabel.textContent = '📽️ DataShow';
    showBlock(currentBlock);
  } else {
    body.classList.add('mode-mobile');
    body.classList.remove('mode-datashow');
    if (modeLabel) modeLabel.textContent = '📱 Mobile';
    showAllBlocksMobile();
  }
}

function initNavigation() {
  const prevBtn = document.getElementById('prev-slide-btn');
  const nextBtn = document.getElementById('next-slide-btn');

  if (prevBtn) prevBtn.addEventListener('click', () => changeBlock(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => changeBlock(1));

  // Keyboard navigation for DataShow mode
  document.addEventListener('keydown', (e) => {
    if (currentViewMode === 'datashow') {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        changeBlock(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        changeBlock(-1);
      }
    }
  });

  // Block quick jump tabs
  const tabBtns = document.querySelectorAll('.block-tab-btn');
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const targetBlock = parseInt(e.currentTarget.getAttribute('data-block'));
      if (targetBlock) {
        currentBlock = targetBlock;
        if (currentViewMode === 'datashow') {
          showBlock(currentBlock);
        } else {
          scrollToBlock(targetBlock);
        }
      }
    });
  });
}

function changeBlock(delta) {
  const newBlock = currentBlock + delta;
  if (newBlock >= 1 && newBlock <= totalBlocks) {
    currentBlock = newBlock;
    showBlock(currentBlock);
  }
}

function showBlock(blockNum) {
  const blocks = document.querySelectorAll('.slide-block');
  blocks.forEach((block) => {
    const num = parseInt(block.getAttribute('data-block-id'));
    if (num === blockNum) {
      block.classList.remove('hidden');
      block.classList.add('active');
    } else {
      block.classList.add('hidden');
      block.classList.remove('active');
    }
  });

  updateProgressUI(blockNum);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showAllBlocksMobile() {
  const blocks = document.querySelectorAll('.slide-block');
  blocks.forEach((block) => {
    block.classList.remove('hidden');
    block.classList.add('active');
  });
  updateProgressUI(1);
}

function scrollToBlock(blockNum) {
  const target = document.querySelector(`.slide-block[data-block-id="${blockNum}"]`);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function updateProgressUI(blockNum) {
  const currentIndicator = document.getElementById('current-block-num');
  const prevBtn = document.getElementById('prev-slide-btn');
  const nextBtn = document.getElementById('next-slide-btn');

  if (currentIndicator) currentIndicator.textContent = blockNum;
  if (prevBtn) prevBtn.disabled = blockNum === 1;
  if (nextBtn) nextBtn.disabled = blockNum === totalBlocks;

  const tabBtns = document.querySelectorAll('.block-tab-btn');
  tabBtns.forEach((btn) => {
    const num = parseInt(btn.getAttribute('data-block'));
    if (num === blockNum) {
      btn.classList.add('bg-violet-600', 'text-white');
      btn.classList.remove('bg-slate-800', 'text-slate-400');
    } else {
      btn.classList.remove('bg-violet-600', 'text-white');
      btn.classList.add('bg-slate-800', 'text-slate-400');
    }
  });
}

function initKaTeX() {
  if (window.renderMathInElement) {
    window.renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false }
      ],
      throwOnError: false
    });
  }
}

/* Gamified Variable Classifier Logic */
function initVariableClassifier() {
  const cards = document.querySelectorAll('.classifier-item');
  cards.forEach((card) => {
    const buttons = card.querySelectorAll('.classify-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const selectedType = e.currentTarget.getAttribute('data-type');
        const correctType = card.getAttribute('data-correct-type');
        const feedbackEl = card.querySelector('.feedback-msg');

        if (selectedType === correctType) {
          card.classList.remove('border-slate-700', 'border-red-500/50');
          card.classList.add('border-emerald-500');
          feedbackEl.className = 'feedback-msg text-xs mt-2 font-semibold text-emerald-400';
          feedbackEl.textContent = '✅ Correto! Excelente identificação.';
        } else {
          card.classList.remove('border-slate-700', 'border-emerald-500');
          card.classList.add('border-red-500/50');
          feedbackEl.className = 'feedback-msg text-xs mt-2 font-semibold text-red-400';
          feedbackEl.textContent = `❌ Tente novamente! Essa variável é ${correctType}.`;
        }
      });
    });
  });
}
