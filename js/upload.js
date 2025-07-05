import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../supabaseConfig.js';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.getElementById('uploadBtn').onclick = async () => {
  const email = localStorage.getItem('auth_user');
  if (!email) return window.location.href = 'index.html';

// শুধু proxies ডিলিট করো, copied_sets ডিলিট করো না কারণ আমরা আর ব্যবহার করবো না
await supabase.from('proxies').delete();


  const text = document.getElementById('proxyInput').value;
  const lines = text.split('\n').filter(l => l.trim());
  const chunks = [];
  for (let i = 0; i < lines.length; i += 15)
    chunks.push(lines.slice(i, i + 15).join('\n'));

  for (let idx = 0; idx < chunks.length; idx++) {
    await supabase.from('proxies').insert({ set_number: idx, content: chunks[idx] });
  }
  document.getElementById('uploadMsg').innerText = `Uploaded ${chunks.length} sets.`;
};

document.getElementById('goViewer').onclick = () => {
  window.location.href = 'app.html';
};
