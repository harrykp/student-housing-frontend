// app.js (frontend entry point)

const BACKEND_URL = 'https://student-housing-backend.onrender.com';

// ——— Authentication Handlers —————————————————————————————————————————
async function login(event) {
  event.preventDefault();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!email || !password) { alert('Both fields are required'); return; }
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
    const { token } = await res.json();
    localStorage.setItem('token', token);
    alert('Login successful');
    window.location.href = 'dashboard.html';
  } catch (err) {
    console.error(err);
    alert(`Login failed: ${err.message}`);
  }
}

async function register(event) {
  event.preventDefault();
  const username = document.getElementById('name').value.trim();
  const email    = document.getElementById('email').value.trim();
  const phone    = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!username || !email || !phone || !password) { alert('All fields required'); return; }
  try {
    const res = await fetch(`${BACKEND_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ username, email, phone, password })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Registration failed');
    alert('Registration successful');
    window.location.href = 'login.html';
  } catch (err) {
    console.error(err);
    alert(`Registration failed: ${err.message}`);
  }
}

// ——— Fetch Helpers —————————————————————————————————————————————————————————
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

// ——— Student Section Loaders —————————————————————————————————————————————
async function loadHostelsSection() {
  try {
    const hostels = await fetchJSON(`${BACKEND_URL}/api/hostels`);
    const ul = document.getElementById('hostels-list');
    ul.innerHTML = '';
    hostels.forEach(h => {
      const li = document.createElement('li');
      li.innerHTML = `<h3>${h.name}</h3><p>${h.address || h.description}</p>`;
      ul.appendChild(li);
    });
  } catch (err) { console.error(err); alert('Failed to load hostels'); }
}

async function loadRoomsSection() {
  try {
    const [rooms, hostels] = await Promise.all([
      fetchJSON(`${BACKEND_URL}/api/rooms`),
      fetchJSON(`${BACKEND_URL}/api/hostels`)
    ]);
    const ul = document.getElementById('rooms-list');
    ul.innerHTML = '';
    rooms.forEach(r => {
      const hostel = hostels.find(h=>h.id===r.hostel_id)?.name || '—';
      const div = document.createElement('div');
      div.className = 'room-card';
      div.innerHTML = `
        <img src="${r.photo_url}" alt="${r.name}">
        <h3>${r.name}</h3>
        <p>Price: ${r.price} / mo</p>
        <p>Occupancy: ${r.occupancy_limit}</p>
        <p>Hostel: ${hostel}</p>`;
      ul.appendChild(div);
    });
  } catch (err) { console.error(err); alert('Failed to load rooms'); }
}

// ——— Dashboard Loader ———————————————————————————————————————————————————
async function loadDashboard() {
...
