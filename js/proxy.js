import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../supabaseConfig.js';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const email = localStorage.getItem('auth_user');
if (!email) location.href = 'index.html';

let allSets = [], shownIdx = 0;
await loadSets();

async function loadSets() {
  allSets = (await supabase.from('proxies').select('*').order('set_number')).data || [];
  shownIdx = 0;
  renderSets();
}

async function renderSets() {
  const container = document.getElementById('setsContainer');
  container.innerHTML = '';
  const slice = allSets.slice(shownIdx, shownIdx + 6);

  for (const s of slice) {
    const { data: cs } = await supabase.from('copied_sets').select().eq('user_email', email).eq('set_number', s.set_number);
    const copied = cs.length > 0;
    const card = document.createElement('div');
    card.className = 'set-card' + (copied ? ' copied' : '');
    card.innerHTML = `<pre>${s.content}</pre><button>Copy</button>`;
    const btn = card.querySelector('button');
    btn.innerText = copied ? 'Copied' : 'Copy';
    btn.disabled = copied;
    btn.onclick = async () => {
      navigator.clipboard.writeText(s.content);
      await supabase.from('copied_sets').insert({ user_email: email, set_number: s.set_number });
      btn.innerText = 'Copied';
      card.classList.add('copied');
    };
    container.appendChild(card);
  }
}

document.getElementById('genBtn').onclick = () => {
  shownIdx += 6;
  if (shownIdx >= allSets.length) shownIdx = 0;
  renderSets();
};

document.getElementById('uploadPage').onclick = () => {
  window.location.href = 'upload.html';
};
