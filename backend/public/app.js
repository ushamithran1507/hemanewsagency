(function () {
  const authView = document.getElementById('authView');
  const sessionView = document.getElementById('sessionView');
  const messageEl = document.getElementById('message');
  const tabs = document.querySelectorAll('.tab');
  const forms = document.querySelectorAll('.form');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      forms.forEach(f => f.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab + 'Form').classList.add('active');
      hideMessage();
    });
  });

  function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = 'message ' + type;
  }
  function hideMessage() {
    messageEl.className = 'message';
  }

  function showSession(user, token) {
    authView.style.display = 'none';
    sessionView.classList.add('active');
    document.getElementById('sName').textContent = user.name || '-';
    document.getElementById('sEmail').textContent = user.email || '-';
    document.getElementById('sRole').textContent = user.role || '-';
    document.getElementById('sToken').textContent = token;
  }

  function storeSession(user, token) {
    localStorage.setItem('hna_token', token);
    localStorage.setItem('hna_user', JSON.stringify(user));
  }

  async function submitAuth(url, payload, successMessage) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showMessage(data.message || 'Something went wrong', 'error');
        return;
      }

      showMessage(successMessage, 'success');
      storeSession(data.data.user, data.data.token);
      setTimeout(() => showSession(data.data.user, data.data.token), 400);
    } catch (err) {
      showMessage('Could not reach the server. Please try again.', 'error');
    }
  }

  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    hideMessage();
    submitAuth('/api/auth/login', {
      email: document.getElementById('loginEmail').value,
      password: document.getElementById('loginPassword').value
    }, 'Signed in successfully.');
  });

  document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    hideMessage();
    submitAuth('/api/auth/register', {
      name: document.getElementById('regName').value,
      email: document.getElementById('regEmail').value,
      mobileNumber: document.getElementById('regMobile').value,
      password: document.getElementById('regPassword').value,
      role: document.getElementById('regRole').value
    }, 'Account created successfully.');
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('hna_token');
    localStorage.removeItem('hna_user');
    sessionView.classList.remove('active');
    authView.style.display = 'block';
    hideMessage();
  });

  // Restore session if already logged in
  const savedToken = localStorage.getItem('hna_token');
  const savedUser = localStorage.getItem('hna_user');
  if (savedToken && savedUser) {
    try {
      showSession(JSON.parse(savedUser), savedToken);
    } catch (e) { /* ignore corrupt storage */ }
  }
})();
