import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../supabaseConfig.js';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.getElementById('loginBtn').onclick = async () => {
  const email = document.getElementById('email').value;
  const { data, error } = await supabase
    .from('authorized_users')
    .select()
    .eq('email', email);

  if (error || !data.length) {
    document.getElementById('message').innerText = 'Access denied';
    return;
  }
  localStorage.setItem('auth_user', email);
  window.location.href = 'app.html';
};
