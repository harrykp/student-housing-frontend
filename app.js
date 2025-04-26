// app.js (frontend entry)

const BACKEND_URL = 'https://student-housing-backend.onrender.com';

// ——— Auth Handlers ———————————————————————————————————————————————————
async function login(event) {
  event.preventDefault();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!email || !password) {
    return alert('Both fields are required.');
  }
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type':'application/json' },
      body:    JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
    const { token } = await res.json();
    localStorage.setItem('token', token);
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
  if (!username || !email || !phone || !password) {
    return alert('All fields are required.');
  }
  try {
    const res = await fetch(`${BACKEND_URL}/api/users`, {
      method:  'POST',
      headers: { 'Content-Type':'application/json' },
      body:    JSON.stringify({ username, email, phone, password })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Registration failed');
    alert('Registration successful!');
    window.location.href = 'login.html';
  } catch (err) {
    console.error(err);
    alert(`Registration failed: ${err.message}`);
  }
}

// ——— Utility —————————————————————————————————————————————————————————
async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`Fetch ${url} failed (${res.status})`);
  return res.json();
}

// ——— Student Sections —————————————————————————————————————————————————
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
  } catch (err) {
    console.error(err);
    alert('Failed to load hostels.');
  }
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
      const hostel = hostels.find(h => h.id === r.hostel_id)?.name || '—';
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

  // Hostels filter
  if (type === 'hostel' || type === 'all') {
    let hostels = await fetchJSON(`${BACKEND_URL}/api/hostels`);
    hostels = hostels.filter(h => {
      if (location && !h.address?.toLowerCase().includes(location) && !h.name.toLowerCase().includes(location)) return false;
      return true;
    });
    const ul = document.getElementById('hostels-list');
    ul.innerHTML = '';
    hostels.forEach(h => {
      const li = document.createElement('li');
      li.innerHTML = `<h3>${h.name}</h3><p>${h.address || h.description}</p>`;
      ul.appendChild(li);
    });
  }

  // Rooms filter
  if (type === 'room' || type === 'all') {
    let rooms = await fetchJSON(`${BACKEND_URL}/api/rooms`);
    const hostels = await fetchJSON(`${BACKEND_URL}/api/hostels`);
    rooms = rooms.map(r => ({
      ...r,
      hostel_name: hostels.find(h=>h.id===r.hostel_id)?.name || ''
    })).filter(r => {
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
    const ul = document.getElementById('rooms-list');
    ul.innerHTML = '';
    rooms.forEach(r => {
      const div = document.createElement('div');
      div.className = 'room-card';
      div.innerHTML = `
        <img src="${r.photo_url}" alt="${r.name}">
        <h3>${r.name}</h3>
        <p>Price: ${r.price} / mo</p>
        <p>Occupancy: ${r.occupancy_limit}</p>
        <p>Hostel: ${r.hostel_name}</p>`;
      ul.appendChild(div);
    });
  }
}

function clearSearch(event) {
  event.preventDefault();
  document.getElementById('search-form').reset();
  loadHostelsSection();
  loadRoomsSection();
}

// ——— Dashboard Loader ———————————————————————————————————————————————————
async function loadDashboard() {
  const token = localStorage.getItem('token');
  if (!token) {
    return window.location.href = 'login.html';
  }
  try {
    const res = await fetch(`${BACKEND_URL}/api/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();

    // Profile
    document.getElementById('student-name').textContent  = data.profile.username;
    document.getElementById('student-email').textContent = data.profile.email;

    // Stats
    document.getElementById('total-applications').textContent    = data.stats.total ?? 0;
    document.getElementById('pending-applications').textContent  = data.stats.pending ?? 0;
    document.getElementById('accepted-applications').textContent = data.stats.accepted ?? 0;
    document.getElementById('rejected-applications').textContent = data.stats.rejected ?? 0;

    // Hostels list on dashboard
    const list = document.getElementById('hostels-list');
    if (list) {
      list.innerHTML = '';
      data.hostels.forEach(h => {
        const div = document.createElement('div');
        div.className = 'hostel-card';
        div.innerHTML = `<h3>${h.name}</h3><p>${h.address}</p>`;
        list.appendChild(div);
      });
    }

    // Recent activities
    const actList = document.getElementById('recent-activities-list');
    if (actList) {
      actList.innerHTML = '';
      data.activities.forEach(a => {
        const li = document.createElement('li');
        li.textContent = a;
        actList.appendChild(li);
      });
    }

  } catch (err) {
    console.error('Dashboard load error:', err);
    alert('Failed to load dashboard.');
  }
}

// ——— DOM Ready —————————————————————————————————————————————————————
window.addEventListener('DOMContentLoaded', () => {
  // Auth forms
  document.getElementById('login-form')?.addEventListener('submit', login);
  document.getElementById('register-form')?.addEventListener('submit', register);

  // Student pages
  document.getElementById('hostels-list')  && loadHostelsSection();
  document.getElementById('rooms-list')    && loadRoomsSection();
  document.getElementById('search-form')   && (
    document.getElementById('search-form').addEventListener('submit', performSearch),
    document.getElementById('clear-search-button').addEventListener('click', clearSearch)
  );
  document.getElementById('student-name')  && loadDashboard();
});
