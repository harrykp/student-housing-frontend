// app.js

const BACKEND_URL = 'https://student-housing-backend.onrender.com';

// ——— Auth Handlers ———————————————————————————————————————————————————
async function login(event) {
  event.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!email || !password) {
    alert('Please fill in both fields.');
    return;
  }
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    const { token } = await res.json();
    localStorage.setItem('token', token);
    alert('Login successful!');
    window.location.href = 'dashboard.html';
  } catch (err) {
    console.error('Login error:', err);
    alert(`Login failed: ${err.message}`);
  }
}

async function register(event) {
  event.preventDefault();
  const username = document.getElementById('name').value.trim();
  const email    = document.getElementById('email').value.trim();
  const phone    = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!username || !email || !phone || !password) {
    alert('All fields are required.');
    return;
  }
  try {
    const res = await fetch(`${BACKEND_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, phone, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    alert('Registration successful!');
    window.location.href = 'login.html';
  } catch (err) {
    console.error('Register error:', err);
    alert(`Registration failed: ${err.message}`);
  }
}

// ——— Fetch Helpers —————————————————————————————————————————————————
async function fetchHostels() {
  const res = await fetch(`${BACKEND_URL}/api/hostels`);
  if (!res.ok) throw new Error(`Hostels status ${res.status}`);
  return res.json();
}

async function fetchRooms() {
  const res = await fetch(`${BACKEND_URL}/api/rooms`);
  if (!res.ok) throw new Error(`Rooms status ${res.status}`);
  return res.json();
}

// ——— Render Functions ——————————————————————————————————————————————
function renderHostels(hostels) {
  const ul = document.getElementById('hostels-list');
  ul.innerHTML = '';
  hostels.forEach(h => {
    const li = document.createElement('li');
    li.innerHTML = `
      <h3>${h.name}</h3>
      <p>${h.address || h.description}</p>
    `;
    ul.appendChild(li);
  });
}

function renderRooms(rooms) {
  const ul = document.getElementById('rooms-list');
  ul.innerHTML = '';
  rooms.forEach(r => {
    const div = document.createElement('div');
    div.className = 'room-card';
    div.innerHTML = `
      <img src="${r.photo_url}" alt="${r.name}">
      <h3>${r.name}</h3>
      <p>Price: ${r.price} / mo</p>
      <p>Occupancy limit: ${r.occupancy_limit}</p>
      <p>Hostel: ${r.hostel_name || r.hostel_id}</p>
    `;
    ul.appendChild(div);
  });
}

// ——— Initial Loads —————————————————————————————————————————————————
async function loadHostelsSection() {
  try {
    const hostels = await fetchHostels();
    renderHostels(hostels);
  } catch (err) {
    console.error(err);
    alert('Failed to load hostels.');
  }
}

async function loadRoomsSection() {
  try {
    // fetch hostels so we can annotate room cards with hostel_name
    const [rooms, hostels] = await Promise.all([ fetchRooms(), fetchHostels() ]);
    const enriched = rooms.map(r => {
      const h = hostels.find(h=>h.id===r.hostel_id);
      return { ...r, hostel_name: h?.name || '—' };
    });
    renderRooms(enriched);
  } catch (err) {
    console.error(err);
    alert('Failed to load rooms.');
  }
}

// ——— Search ———————————————————————————————————————————————————————
async function performSearch(event) {
  event.preventDefault();
  const type      = document.getElementById('search-type').value;
  const location  = document.getElementById('search-location').value.trim().toLowerCase();
  const minPrice  = Number(document.getElementById('search-min-price').value);
  const maxPrice  = Number(document.getElementById('search-max-price').value);
  const amenities = document.getElementById('search-amenities').value
                     .split(',').map(a=>a.trim().toLowerCase()).filter(a=>a);

  if (type === 'hostel' || type === 'all') {
    let hostels = await fetchHostels();
    hostels = hostels.filter(h => {
      if (location && !h.address?.toLowerCase().includes(location) && !h.name.toLowerCase().includes(location)) return false;
      return true;
    });
    renderHostels(hostels);
  }
  if (type === 'room' || type === 'all') {
    let rooms = await fetchRooms();
    // annotate with hostel_name for filtering by location
    const hostels = await fetchHostels();
    rooms = rooms.map(r=>({
      ...r,
      hostel_name: (hostels.find(h=>h.id===r.hostel_id)?.name||'')
    }));
    rooms = rooms.filter(r => {
      if (location && !(
            r.hostel_name.toLowerCase().includes(location) ||
            r.description.toLowerCase().includes(location) ||
            r.name.toLowerCase().includes(location)
          )) return false;
      if (!isNaN(minPrice) && r.price < minPrice) return false;
      if (!isNaN(maxPrice) && r.price > maxPrice) return false;
      if (amenities.length) {
        const ams = r.amenities || [];
        if (!amenities.every(a=>ams.map(x=>x.toLowerCase()).includes(a))) return false;
      }
      return true;
    });
    renderRooms(rooms);
  }
}

function clearSearch(event) {
  event.preventDefault();
  document.getElementById('search-form').reset();
  loadHostelsSection();
  loadRoomsSection();
}

// ——— DOM Ready —————————————————————————————————————————————————————
window.addEventListener('DOMContentLoaded', () => {
  const path = location.pathname;
  if (path.endsWith('index.html') || path === '/' || path.endsWith('/index.html')) {
    loadHostelsSection();
    loadRoomsSection();
    // search wiring
    document.getElementById('search-form')?.addEventListener('submit', performSearch);
    document.getElementById('clear-search-button')?.addEventListener('click', clearSearch);
  }
  if (path.endsWith('rooms.html')) {
    loadRoomsSection();
  }
  if (path.endsWith('dashboard.html')) {
    loadDashboard();
  }
  // auth forms
  document.getElementById('login-form')?.addEventListener('submit', login);
  document.getElementById('register-form')?.addEventListener('submit', register);
});
