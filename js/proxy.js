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
  // সব proxies নিয়ে আসো
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

  // এখানে ৬ সেট দেখাবো slice করে
  const slice = allSets.slice(shownIdx, shownIdx + 6);

  for (const s of slice) {
    const takenBy = s.taken_by;
    // যদি taken_by থাকে এবং সেটা অন্য কারো হয়, তাহলে সেটি দেখাবে না (skip)
    if (takenBy && takenBy !== email) continue;

    const card = document.createElement('div');
    card.className = 'set-card';

    // রং সেট করো
    if (!takenBy) {
      card.style.backgroundColor = '#f0f0f0'; // ফ্রি proxy light grey
    } else if (userColors[takenBy]) {
      card.style.backgroundColor = userColors[takenBy]; // ইউজারের রং
    } else {
      card.style.backgroundColor = '#ccc'; // অন্য কারো হলে ধূসর
    }

    // content
    const pre = document.createElement('pre');
    pre.textContent = s.content;
    card.appendChild(pre);

    // copy button
    const btn = document.createElement('button');

    if (takenBy === email) {
      btn.innerText = 'Copied';
      btn.disabled = true;
      card.classList.add('copied');
    } else if (!takenBy) {
      btn.innerText = 'Copy';
      btn.disabled = false;
    } else {
      // অন্য কেউ নিয়েছে, কিন্তু আমরা show করবো না আগেই skip করলাম
      // safety
      btn.innerText = 'Taken';
      btn.disabled = true;
    }

    btn.onclick = async () => {
      if (btn.disabled) return;

      try {
        await navigator.clipboard.writeText(s.content);

        // taken_by update করো
        const { error } = await supabase
          .from('proxies')
          .update({ taken_by: email })
          .eq('set_number', s.set_number);

        if (error) {
          alert('Update failed');
          return;
        }

        btn.innerText = 'Copied';
        btn.disabled = true;
        card.style.backgroundColor = userColors[email] || '#673fdc';
        card.classList.add('copied');

        // UI রিফ্রেশ করার জন্য ডাটা রিলোড করো
        await loadSets();
      } catch {
        alert('Copy failed');
      }
    };

    card.appendChild(btn);
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
