const STORAGE_KEY = 'cell-counter';

const counts = load();

const els = {
  living: document.getElementById('living'),
  dead: document.getElementById('dead'),
  livingCount: document.getElementById('living-count'),
  deadCount: document.getElementById('dead-count'),
  summary: document.getElementById('summary'),
  reset: document.getElementById('reset'),
};

// Keep counts across accidental reloads
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Number.isInteger(saved.living) && Number.isInteger(saved.dead)) {
      return saved;
    }
  } catch (e) {}
  return { living: 0, dead: 0 };
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
  } catch (e) {}
}

function render() {
  els.livingCount.textContent = counts.living;
  els.deadCount.textContent = counts.dead;
}

// iOS Safari has no Vibration API, but toggling a native switch control
// gives a short haptic tick (iOS 18+), so click a hidden one instead
const hapticSwitch = (() => {
  const label = document.createElement('label');
  label.style.display = 'none';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.setAttribute('switch', '');
  label.appendChild(input);
  document.body.appendChild(label);
  return label;
})();

function haptic() {
  if (navigator.vibrate) {
    navigator.vibrate(10);
  } else {
    hapticSwitch.click();
  }
}

function count(kind) {
  counts[kind] += 1;
  save();
  render();

  const el = els[kind];
  el.classList.add('flash');
  setTimeout(() => el.classList.remove('flash'), 80);
  haptic();
}

// click (not pointerdown) so haptics count as a user gesture on iOS;
// touch-action: manipulation removes the old 300ms tap delay
els.living.addEventListener('click', () => count('living'));
els.dead.addEventListener('click', () => count('dead'));

els.reset.addEventListener('click', () => {
  if (confirm('Reset both counters to zero?')) {
    counts.living = 0;
    counts.dead = 0;
    save();
    render();
  }
});

render();
