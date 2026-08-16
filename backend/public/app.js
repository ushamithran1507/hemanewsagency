(function () {
  // ---------- helpers ----------
  function esc(str) {
    return String(str ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }
  function money(n) { return '₹' + Number(n || 0).toLocaleString('en-IN'); }
  function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-IN') : '—'; }

  const state = { token: null, user: null, customers: [], publications: [], staff: [] };

  async function api(path, opts) {
    opts = opts || {};
    const headers = { 'Content-Type': 'application/json' };
    if (state.token) headers['Authorization'] = 'Bearer ' + state.token;
    const res = await fetch(path, {
      method: opts.method || 'GET',
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });
    let data;
    try { data = await res.json(); } catch (e) { data = {}; }
    if (!res.ok || data.success === false) {
      throw new Error(data.message || ('Request failed (' + res.status + ')'));
    }
    return data;
  }

  // ---------- auth screen ----------
  const authScreen = document.getElementById('authScreen');
  const appScreen = document.getElementById('appScreen');
  const messageEl = document.getElementById('message');
  const tabs = document.querySelectorAll('.tab');
  const forms = document.querySelectorAll('#authView .form');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      forms.forEach((f) => f.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab + 'Form').classList.add('active');
      hideMessage();
    });
  });
  function showMessage(text, type) { messageEl.textContent = text; messageEl.className = 'message ' + type; }
  function hideMessage() { messageEl.className = 'message'; }

  function storeSession(user, token) {
    localStorage.setItem('hna_token', token);
    localStorage.setItem('hna_user', JSON.stringify(user));
  }

  async function submitAuth(url, payload, successMessage) {
    try {
      const data = await api(url, { method: 'POST', body: payload });
      showMessage(successMessage, 'success');
      storeSession(data.data.user, data.data.token);
      setTimeout(() => enterApp(data.data.user, data.data.token), 300);
    } catch (err) {
      showMessage(err.message || 'Could not reach the server. Please try again.', 'error');
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

  document.getElementById('signoutBtn').addEventListener('click', () => {
    localStorage.removeItem('hna_token');
    localStorage.removeItem('hna_user');
    state.token = null; state.user = null;
    appScreen.classList.remove('active');
    authScreen.style.display = 'flex';
    hideMessage();
  });

  // ---------- modal ----------
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  document.getElementById('modalClose').addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
  function openModal(title, bodyHtml) {
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHtml;
    modalOverlay.classList.remove('hidden');
  }
  function closeModal() { modalOverlay.classList.add('hidden'); modalBody.innerHTML = ''; }

  // ---------- app shell ----------
  const sidebar = document.getElementById('sidebar');
  const content = document.getElementById('content');
  let currentSection = 'dashboard';

  sidebar.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-section]');
    if (!btn) return;
    sidebar.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentSection = btn.dataset.section;
    renderSection();
  });

  function enterApp(user, token) {
    state.user = user; state.token = token;
    authScreen.style.display = 'none';
    appScreen.classList.add('active');
    document.getElementById('topUserName').textContent = user.name + ' (' + user.role + ')';
    renderSection();
  }

  function renderSection() {
    const renderers = {
      dashboard: renderDashboard,
      customers: renderCustomers,
      billing: renderBilling,
      staff: renderStaff,
      publications: renderPublications,
      grievances: renderGrievances
    };
    (renderers[currentSection] || renderDashboard)();
  }

  function showLoading() { content.innerHTML = '<div class="loading">Loading…</div>'; }
  function showError(err) { content.innerHTML = '<div class="error-box">' + esc(err.message || 'Something went wrong.') + '</div>'; }

  // ---------- DASHBOARD ----------
  async function renderDashboard() {
    showLoading();
    try {
      const { data: s } = await api('/api/dashboard/stats');
      content.innerHTML = `
        <h2>Dashboard</h2>
        <div class="kpis">
          <div class="kpi"><div class="val">${s.totalCustomers}</div><div class="lbl">Total Customers</div></div>
          <div class="kpi"><div class="val">${s.activeCustomers}</div><div class="lbl">Active Customers</div></div>
          <div class="kpi"><div class="val">${money(s.billing.monthlyBilled)}</div><div class="lbl">Monthly Billed</div></div>
          <div class="kpi"><div class="val">${money(s.billing.collected)}</div><div class="lbl">Collected</div></div>
          <div class="kpi"><div class="val">${money(s.billing.outstanding)}</div><div class="lbl">Outstanding</div></div>
          <div class="kpi"><div class="val">${s.staff.active} / ${s.staff.total}</div><div class="lbl">Active Staff</div></div>
          <div class="kpi"><div class="val">${s.subscriptions.active}</div><div class="lbl">Active Subscriptions</div></div>
          <div class="kpi"><div class="val">${s.grievances.open}</div><div class="lbl">Open Grievances</div></div>
        </div>
      `;
    } catch (err) { showError(err); }
  }

  // ---------- CUSTOMERS ----------
  async function loadCustomers(search) {
    const q = search ? '?search=' + encodeURIComponent(search) + '&limit=100' : '?limit=100';
    const { data } = await api('/api/customers' + q);
    state.customers = data;
    return data;
  }

  async function renderCustomers() {
    showLoading();
    try {
      const list = await loadCustomers();
      paintCustomers(list);
    } catch (err) { showError(err); }
  }

  function paintCustomers(list) {
    content.innerHTML = `
      <h2>Customers</h2>
      <div class="toolbar">
        <input type="search" id="custSearch" placeholder="Search name or mobile…">
        <button class="btn" id="addCustBtn">+ Add Customer</button>
      </div>
      <div class="panel">
        <table>
          <thead><tr><th>Name</th><th>Mobile</th><th>Area</th><th>Status</th><th>Wallet</th><th></th></tr></thead>
          <tbody id="custRows"></tbody>
        </table>
      </div>
    `;
    const rows = document.getElementById('custRows');
    if (!list.length) {
      rows.innerHTML = '<tr class="empty-row"><td colspan="6">No customers yet.</td></tr>';
    } else {
      rows.innerHTML = list.map((c) => `
        <tr>
          <td>${esc(c.name)}</td>
          <td>${esc(c.mobileNumber || '—')}</td>
          <td>${esc(c.area || '—')}</td>
          <td><span class="badge ${c.status === 'active' ? 'green' : 'gray'}">${esc(c.status)}</span></td>
          <td>${money(c.walletBalance)}</td>
          <td style="text-align:right;white-space:nowrap;">
            <button class="btn link" data-toggle="${c.id}">${c.status === 'active' ? 'Deactivate' : 'Activate'}</button>
            <button class="btn link danger" data-del="${c.id}">Delete</button>
          </td>
        </tr>
      `).join('');
    }

    document.getElementById('addCustBtn').addEventListener('click', openAddCustomerModal);
    let searchTimer;
    document.getElementById('custSearch').addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      const val = e.target.value;
      searchTimer = setTimeout(async () => {
        try { paintCustomers(await loadCustomers(val)); } catch (err) { showError(err); }
      }, 250);
    });
    rows.querySelectorAll('[data-toggle]').forEach((b) => b.addEventListener('click', async () => {
      try { await api('/api/customers/' + b.dataset.toggle + '/toggle-status', { method: 'PATCH' }); renderCustomers(); }
      catch (err) { alert(err.message); }
    }));
    rows.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', async () => {
      if (!confirm('Delete this customer? This cannot be undone.')) return;
      try { await api('/api/customers/' + b.dataset.del, { method: 'DELETE' }); renderCustomers(); }
      catch (err) { alert(err.message); }
    }));
  }

  function openAddCustomerModal() {
    openModal('Add Customer', `
      <form id="custForm">
        <label>Name</label><input name="name" required>
        <label>Mobile Number</label><input name="mobileNumber" required>
        <label>Email</label><input name="email" type="email">
        <div class="field-row">
          <div><label>Area</label><input name="area"></div>
          <div><label>Address</label><input name="address"></div>
        </div>
        <button class="submit" type="submit">Save Customer</button>
      </form>
    `);
    document.getElementById('custForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      try {
        await api('/api/customers', { method: 'POST', body: Object.fromEntries(f) });
        closeModal(); renderCustomers();
      } catch (err) { alert(err.message); }
    });
  }

  // ---------- BILLING ----------
  async function renderBilling() {
    showLoading();
    try {
      const [{ data: bills }] = await Promise.all([api('/api/billing')]);
      if (!state.customers.length) await loadCustomers();
      const custName = (id) => (state.customers.find((c) => c.id === id) || {}).name || 'Unknown';
      content.innerHTML = `
        <h2>Billing</h2>
        <div class="toolbar">
          <span></span>
          <button class="btn" id="addBillBtn">+ Create Bill</button>
        </div>
        <div class="panel">
          <table>
            <thead><tr><th>Customer</th><th>Period</th><th>Amount</th><th>Paid</th><th>Status</th><th></th></tr></thead>
            <tbody id="billRows"></tbody>
          </table>
        </div>
      `;
      const rows = document.getElementById('billRows');
      if (!bills.length) {
        rows.innerHTML = '<tr class="empty-row"><td colspan="6">No bills yet.</td></tr>';
      } else {
        rows.innerHTML = bills.map((b) => `
          <tr>
            <td>${esc(custName(b.customerId))}</td>
            <td>${b.month}/${b.year}</td>
            <td>${money(b.amount)}</td>
            <td>${money(b.paidAmount)}</td>
            <td><span class="badge ${b.status === 'paid' ? 'green' : b.status === 'partial' ? 'amber' : 'red'}">${esc(b.status)}</span></td>
            <td style="text-align:right;">${b.status !== 'paid' ? `<button class="btn link" data-pay="${b.id}" data-due="${b.amount - b.paidAmount}">Record Payment</button>` : ''}</td>
          </tr>
        `).join('');
      }
      document.getElementById('addBillBtn').addEventListener('click', openAddBillModal);
      rows.querySelectorAll('[data-pay]').forEach((b) => b.addEventListener('click', () => openPaymentModal(b.dataset.pay, b.dataset.due)));
    } catch (err) { showError(err); }
  }

  function openAddBillModal() {
    const now = new Date();
    const options = state.customers.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
    openModal('Create Bill', `
      <form id="billForm">
        <label>Customer</label><select name="customerId" required>${options}</select>
        <div class="field-row">
          <div><label>Month</label><input name="month" type="number" min="1" max="12" value="${now.getMonth() + 1}" required></div>
          <div><label>Year</label><input name="year" type="number" value="${now.getFullYear()}" required></div>
        </div>
        <label>Amount (₹)</label><input name="amount" type="number" step="0.01" required>
        <button class="submit" type="submit">Save Bill</button>
      </form>
    `);
    document.getElementById('billForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(e.target));
      f.month = Number(f.month); f.year = Number(f.year); f.amount = Number(f.amount);
      try { await api('/api/billing', { method: 'POST', body: f }); closeModal(); renderBilling(); }
      catch (err) { alert(err.message); }
    });
  }

  function openPaymentModal(billId, due) {
    openModal('Record Payment', `
      <form id="payForm">
        <label>Amount Paid (₹, due ${money(due)})</label><input name="amountPaid" type="number" step="0.01" value="${Number(due)}" required>
        <label>Payment Method</label>
        <select name="paymentMethod">
          <option>UPI</option><option>Cash</option><option>Bank Transfer</option>
        </select>
        <label>Reference / UTR</label><input name="reference">
        <button class="submit" type="submit">Save Payment</button>
      </form>
    `);
    document.getElementById('payForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(e.target));
      f.amountPaid = Number(f.amountPaid); f.billId = billId;
      try { await api('/api/billing/payment', { method: 'POST', body: f }); closeModal(); renderBilling(); }
      catch (err) { alert(err.message); }
    });
  }

  // ---------- STAFF ----------
  async function renderStaff() {
    showLoading();
    try {
      const { data: list } = await api('/api/staff');
      state.staff = list;
      content.innerHTML = `
        <h2>Staff</h2>
        <div class="toolbar"><span></span><button class="btn" id="addStaffBtn">+ Add Staff</button></div>
        <div class="panel">
          <table>
            <thead><tr><th>Name</th><th>Role</th><th>Mobile</th><th>Daily Rate</th><th>Status</th><th></th></tr></thead>
            <tbody id="staffRows"></tbody>
          </table>
        </div>
      `;
      const rows = document.getElementById('staffRows');
      if (!list.length) {
        rows.innerHTML = '<tr class="empty-row"><td colspan="6">No staff yet.</td></tr>';
      } else {
        rows.innerHTML = list.map((st) => `
          <tr>
            <td>${esc(st.name)}</td><td>${esc(st.role || '—')}</td><td>${esc(st.mobileNumber || '—')}</td>
            <td>${money(st.dailyRate)}</td>
            <td><span class="badge ${st.status === 'active' ? 'green' : 'gray'}">${esc(st.status)}</span></td>
            <td style="text-align:right;"><button class="btn link" data-att="${st.id}">Mark Attendance</button></td>
          </tr>
        `).join('');
      }
      document.getElementById('addStaffBtn').addEventListener('click', openAddStaffModal);
      rows.querySelectorAll('[data-att]').forEach((b) => b.addEventListener('click', () => openAttendanceModal(b.dataset.att)));
    } catch (err) { showError(err); }
  }

  function openAddStaffModal() {
    openModal('Add Staff', `
      <form id="staffForm">
        <label>Name</label><input name="name" required>
        <div class="field-row">
          <div><label>Role</label><input name="role" placeholder="Delivery Boy"></div>
          <div><label>Mobile</label><input name="mobileNumber" required></div>
        </div>
        <div class="field-row">
          <div><label>Area</label><input name="area"></div>
          <div><label>Daily Rate (₹)</label><input name="dailyRate" type="number" step="0.01"></div>
        </div>
        <button class="submit" type="submit">Save Staff</button>
      </form>
    `);
    document.getElementById('staffForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(e.target));
      try { await api('/api/staff', { method: 'POST', body: f }); closeModal(); renderStaff(); }
      catch (err) { alert(err.message); }
    });
  }

  function openAttendanceModal(staffId) {
    const today = new Date().toISOString().slice(0, 10);
    openModal('Mark Attendance', `
      <form id="attForm">
        <label>Date</label><input name="date" type="date" value="${today}" required>
        <label>Status</label>
        <select name="status"><option>Present</option><option>Absent</option></select>
        <button class="submit" type="submit">Save Attendance</button>
      </form>
    `);
    document.getElementById('attForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(e.target));
      f.staffId = staffId;
      try { await api('/api/staff/attendance', { method: 'POST', body: f }); closeModal(); }
      catch (err) { alert(err.message); }
    });
  }

  // ---------- PUBLICATIONS ----------
  async function renderPublications() {
    showLoading();
    try {
      const { data: list } = await api('/api/subscriptions/publications');
      state.publications = list;
      content.innerHTML = `
        <h2>Publications</h2>
        <div class="toolbar"><span></span><button class="btn" id="addPubBtn">+ Add Publication</button></div>
        <div class="panel">
          <table>
            <thead><tr><th>Name</th><th>Type</th><th>Monthly Rate</th></tr></thead>
            <tbody id="pubRows"></tbody>
          </table>
        </div>
      `;
      const rows = document.getElementById('pubRows');
      rows.innerHTML = list.length
        ? list.map((p) => `<tr><td>${esc(p.name)}</td><td>${esc(p.type || '—')}</td><td>${money(p.monthlyRate)}</td></tr>`).join('')
        : '<tr class="empty-row"><td colspan="3">No publications yet.</td></tr>';
      document.getElementById('addPubBtn').addEventListener('click', openAddPublicationModal);
    } catch (err) { showError(err); }
  }

  function openAddPublicationModal() {
    openModal('Add Publication', `
      <form id="pubForm">
        <label>Name</label><input name="name" required>
        <div class="field-row">
          <div><label>Type</label><input name="type" placeholder="daily"></div>
          <div><label>Monthly Rate (₹)</label><input name="monthlyRate" type="number" step="0.01"></div>
        </div>
        <button class="submit" type="submit">Save Publication</button>
      </form>
    `);
    document.getElementById('pubForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(e.target));
      try { await api('/api/subscriptions/publications', { method: 'POST', body: f }); closeModal(); renderPublications(); }
      catch (err) { alert(err.message); }
    });
  }

  // ---------- GRIEVANCES ----------
  async function renderGrievances() {
    showLoading();
    try {
      const { data: list } = await api('/api/grievances');
      if (!state.customers.length) await loadCustomers();
      const custName = (id) => (state.customers.find((c) => c.id === id) || {}).name || 'Unknown';
      content.innerHTML = `
        <h2>Grievances</h2>
        <div class="panel">
          <table>
            <thead><tr><th>Customer</th><th>Date</th><th>Notes</th><th>Status</th><th></th></tr></thead>
            <tbody id="grvRows"></tbody>
          </table>
        </div>
      `;
      const rows = document.getElementById('grvRows');
      rows.innerHTML = list.length
        ? list.map((g) => `
            <tr>
              <td>${esc(custName(g.customerId))}</td>
              <td>${fmtDate(g.date)}</td>
              <td>${esc(g.notes || '—')}</td>
              <td><span class="badge ${g.status === 'resolved' ? 'green' : 'amber'}">${esc(g.status)}</span></td>
              <td style="text-align:right;">${g.status !== 'resolved' ? `<button class="btn link" data-resolve="${g.id}">Resolve</button>` : ''}</td>
            </tr>
          `).join('')
        : '<tr class="empty-row"><td colspan="5">No grievances on file.</td></tr>';
      rows.querySelectorAll('[data-resolve]').forEach((b) => b.addEventListener('click', async () => {
        const resolution = prompt('Resolution note (optional):') || '';
        try { await api('/api/grievances/' + b.dataset.resolve + '/resolve', { method: 'PATCH', body: { resolution } }); renderGrievances(); }
        catch (err) { alert(err.message); }
      }));
    } catch (err) { showError(err); }
  }

  // ---------- restore session on load ----------
  const savedToken = localStorage.getItem('hna_token');
  const savedUser = localStorage.getItem('hna_user');
  if (savedToken && savedUser) {
    try { enterApp(JSON.parse(savedUser), savedToken); } catch (e) { /* ignore corrupt storage */ }
  }
})();
