// app.js (frontend entry point)

const BACKEND_URL = 'https://student-housing-backend.onrender.com';

// ─── HOSTELS ─────────────────────────────────────────────────────────────────
async function loadHostelsSection() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/hostels`);
    if (!res.ok) throw new Error(`Hostels fetch error: ${res.status}`);
    const hostels = await res.json();
    const list = document.getElementById('hostels-list');
    if (!list) return;
    list.innerHTML = '';
    hostels.forEach(h => {
      const li = document.createElement('li');
      li.textContent = `${h.name} – ${h.address || h.description}`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error('Error loading hostels:', err);
    document.getElementById('hostels-list')?.insertAdjacentHTML('beforeend', '<li>Error loading hostels.</li>');
  }
}

// ─── ROOMS ──────────────────────────────────────────────────────────────────
async function loadRoomsSection() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/rooms`);
    if (!res.ok) throw new Error(`Rooms fetch error: ${res.status}`);
    const rooms = await res.json();
    const list = document.getElementById('rooms-list');
    if (!list) return;
    list.innerHTML = '';
    rooms.forEach(r => {
      const div = document.createElement('div');
      div.className = 'room-card';
      div.innerHTML = `
        <img src="${r.photo_url}" alt="${r.name}">
        <h3>${r.name}</h3>
        <p>Price: $${r.price} / mo</p>
        <p>Occupancy: ${r.occupancy_limit}</p>
        <button data-room-id="${r.id}">Apply</button>
      `;
      list.appendChild(div);
    });
    document.querySelectorAll('[data-room-id]').forEach(btn =>
      btn.addEventListener('click', () => {
        const roomId = Number(btn.dataset.roomId);
        const userId = Number(localStorage.getItem('userId'));
        if (!userId) return alert('Please log in first.');
        submitApplication(userId, roomId);
      })
    );
  } catch (err) {
    console.error('Error loading rooms:', err);
    document.getElementById('rooms-list')?.insertAdjacentHTML('beforeend', '<li>Error loading rooms.</li>');
  }
}

async function submitApplication(userId, roomId) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, room_id: roomId, status: 'Pending' })
    });
    if (!res.ok) throw new Error(`Submit error: ${res.status}`);
    alert('Application submitted!');
  } catch (err) {
    console.error('Error submitting application:', err);
    alert('Failed to submit application.');
  }
}

// ─── SEARCH ─────────────────────────────────────────────────────────────────
async function performSearch(e) {
  e.preventDefault();
  const q = document.getElementById('search-input').value.trim().toLowerCase();
  if (!q) {
    loadHostelsSection();
    loadRoomsSection();
    return;
  }
  const [hostels, rooms] = await Promise.all([
    fetch(`${BACKEND_URL}/api/hostels`).then(r => r.json()),
    fetch(`${BACKEND_URL}/api/rooms`).then(r => r.json())
  ]);
  // Filter hostels
  const hList = document.getElementById('hostels-list');
  if (hList) {
    hList.innerHTML = '';
    hostels.filter(h =>
      h.name.toLowerCase().includes(q) ||
      (h.address || h.description).toLowerCase().includes(q)
    ).forEach(h => {
      const li = document.createElement('li');
      li.textContent = `${h.name} – ${h.address || h.description}`;
      hList.appendChild(li);
    });
  }
  // Filter rooms
  const rList = document.getElementById('rooms-list');
  if (rList) {
    rList.innerHTML = '';
    rooms.filter(r =>
      r.name.toLowerCase().includes(q) ||
      (r.description || '').toLowerCase().includes(q)
    ).forEach(r => {
      const div = document.createElement('div');
      div.className = 'room-card';
      div.innerHTML = `
        <img src="${r.photo_url}" alt="${r.name}">
        <h3>${r.name}</h3>
        <p>Price: $${r.price} / mo</p>
        <p>Occupancy: ${r.occupancy_limit}</p>
        <button data-room-id="${r.id}">Apply</button>
      `;
      rList.appendChild(div);
    });
  }
}

function clearSearch() {
  document.getElementById('search-input').value = '';
  loadHostelsSection();
  loadRoomsSection();
}

// ─── AUTH ───────────────────────────────────────────────────────────────────
async function login(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!email || !password) {
    return alert('Please fill in both fields.');
  }
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error || 'Invalid credentials');
    }
    const { token } = await res.json();
    localStorage.setItem('token', token);
    // Decode userId from JWT payload
    const payload = JSON.parse(atob(token.split('.')[1]));
    localStorage.setItem('userId', payload.id);
    window.location.href = 'dashboard.html';
  } catch (err) {
    console.error('Login failed:', err);
    alert(`Login failed: ${err.message}`);
  }
}

async function register(e) {
  e.preventDefault();
  const username = document.getElementById('name').value.trim();
  const email    = document.getElementById('email').value.trim();
  const phone    = document.getElementById('phone').value.trim();
  const pwd      = document.getElementById('password').value.trim();
  const confirm  = document.getElementById('confirm-password').value.trim();
  if (!username || !email || !phone || !pwd || !confirm) {
    return alert('All fields are required.');
  }
  if (pwd !== confirm) {
    return alert('Passwords do not match.');
  }
  try {
    const res = await fetch(`${BACKEND_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ username, email, phone, password: pwd })
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error || 'Registration failed');
    }
    alert('Registration successful!');
    window.location.href = 'login.html';
  } catch (err) {
    console.error('Registration failed:', err);
    alert(`Registration failed: ${err.message}`);
  }
}

// ─── DASHBOARD ──────────────────────────────────────────────────────────────
async function loadDashboard() {
  const token = localStorage.getItem('token');
  if (!token) return window.location.href = 'login.html';
  try {
    const res = await fetch(`${BACKEND_URL}/api/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Dashboard error: ${res.status}`);
    const data = await res.json();
    document.getElementById('student-name').textContent  = data.profile.username;
    document.getElementById('student-email').textContent = data.profile.email;
    document.getElementById('total-applications').textContent    = data.stats.total ?? 0;
    document.getElementById('pending-applications').textContent  = data.stats.pending ?? 0;
    document.getElementById('accepted-applications').textContent = data.stats.accepted ?? 0;
    document.getElementById('rejected-applications').textContent = data.stats.rejected ?? 0;
    // Hostels & activities are rendered inline in dashboard.html
  } catch (err) {
    console.error('Dashboard load error:', err);
    alert('Failed to load dashboard.');
  }
}

// ─── INIT ─────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const p = location.pathname;
  // Home page
  if (p.endsWith('index.html') || p === '/') {
    loadHostelsSection();
    loadRoomsSection();
    document.getElementById('search-button')?.addEventListener('click', performSearch);
    document.getElementById('clear-search-button')?.addEventListener('click', clearSearch);
  }
  // Student views
  if (p.endsWith('hostels.html')) loadHostelsSection();
  if (p.endsWith('rooms.html'))    loadRoomsSection();
  if (p.endsWith('dashboard.html')) loadDashboard();
  // Auth forms
  document.getElementById('login-form')?.addEventListener('submit', login);
  document.getElementById('register-form')?.addEventListener('submit', register);
});
