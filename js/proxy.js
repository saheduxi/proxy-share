import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../supabaseConfig.js';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const email = localStorage.getItem('auth_user');
if (!email) location.href = 'index.html';

const userColors = {
  'saheduxi@gmail.com': '#673fdc',
  'mim870666@gmail.com': '#9431d5',
  'sumaiyabintenaharshimu@gmail.com': '#25c36a'
};

let allSets = [], shownIdx = 0;
await loadSets();

async function loadSets() {
  const { data, error } = await supabase
    .from('proxies')
    .select('*')
    .order('set_number');

  if (error) {
    alert('Failed to load proxies');
    return;
  }

  allSets = data || [];
  shownIdx = 0;
  renderSets();
}

function renderSets() {
  const container = document.getElementById('setsContainer');
  container.innerHTML = '';

  // *** এখানেই filter করো *** 
  // যা user এর taken_by === email বা taken_by !== null, ওই ইউজারের সামনে গোপন থাকবে, তাই শুধু free proxy গুলো দেখাবে
  const filteredSets = allSets.filter(s => s.taken_by === null);

  const slice = filteredSets.slice(shownIdx, shownIdx + 6);

  for (const s of slice) {
    const card = document.createElement('div');
    card.className = 'set-card';
    card.style.borderColor = 'transparent';  // ফ্রি proxy default border

    const pre = document.createElement('pre');
    pre.textContent = s.content;
    card.appendChild(pre);

    const btn = document.createElement('button');
    btn.innerText = 'Copy';
    btn.disabled = false;

    btn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(s.content);
        const { error } = await supabase
          .from('proxies')
          .update({ taken_by: email })
          .eq('set_number', s.set_number);

        if (error) {
          alert('Update failed');
          return;
        }

        // copy করার পর রিফ্রেশ করো, যাতে ওই set আর দেখা না যায়
        await loadSets();
      } catch {
        alert('Copy failed');
      }
    };

    card.appendChild(btn);
    container.appendChild(card);
  }

  // এখন নিচে দেখাবে user এর taken proxies আলাদা রঙ border দিয়ে 
  const takenSets = allSets.filter(s => s.taken_by === email);

  takenSets.forEach(s => {
    const card = document.createElement('div');
    card.className = 'set-card copied';
    card.style.borderColor = userColors[email] || '#673fdc';

    const pre = document.createElement('pre');
    pre.textContent = s.content;
    card.appendChild(pre);

    const btn = document.createElement('button');
    btn.innerText = 'Copied';
    btn.disabled = true;

    card.appendChild(btn);
    container.appendChild(card);
  });
}

document.getElementById('genBtn').onclick = () => {
  shownIdx += 6;
  if (shownIdx >= allSets.filter(s => s.taken_by === null).length) shownIdx = 0;
  renderSets();
};

document.getElementById('uploadPage').onclick = () => {
  window.location.href = 'upload.html';
};
