// app.js
const BACKEND_URL = 'https://student-housing-backend.onrender.com';

// ─── Auth & Modal Helpers ───────────────────────────────────────────────────
function setupAuthLink() {
  const link = document.getElementById('auth-link');
  if (!link) return;
  if (localStorage.getItem('token')) {
    link.textContent = 'Logout';
    link.href = '#';
    link.onclick = () => {
      localStorage.clear();
      window.location.href = 'index.html';
    };
  } else {
    link.textContent = 'Login';
    link.href = 'login.html';
  }
}

function setupImageModal() {
  const modal = document.getElementById('image-modal');
  document.getElementById('modal-close')?.addEventListener('click', () => modal.classList.remove('active'));
  modal?.addEventListener('click', e => {
    if (e.target === modal) modal.classList.remove('active');
  });
}

// ─── INDEX PAGE (hostels as columns + nested rooms + filters) ───────────────
let allHostels = [], allRooms = [];

async function fetchAllData() {
  const [hRes, rRes] = await Promise.all([
    fetch(`${BACKEND_URL}/api/hostels`),
    fetch(`${BACKEND_URL}/api/rooms`)
  ]);
  allHostels = await hRes.json();
  allRooms   = await rRes.json();
}

function renderIndex() {
  const container = document.getElementById('hostels-container');
  if (!container) return;

  const locQ = document.getElementById('search-location')?.value.trim().toLowerCase() || '';
  const amQ  = document.getElementById('search-amenities')?.value.trim().toLowerCase() || '';
  const minP = Number(document.getElementById('search-min-price')?.value);
  const maxP = Number(document.getElementById('search-max-price')?.value);
  const maxO = Number(document.getElementById('search-max-occupancy')?.value);

  const roomsFiltered = allRooms.filter(r => {
    const d = (r.description||'').toLowerCase();
    return (!minP || r.price >= minP)
        && (!maxP || r.price <= maxP)
        && (!maxO || r.occupancy_limit <= maxO)
        && (!amQ  || d.includes(amQ));
  });

  container.innerHTML = '';
  allHostels.forEach(h => {
    const addr = (h.address||'').toLowerCase();
    const desc = (h.description||'').toLowerCase();
    if (locQ && !addr.includes(locQ)) return;
    if (amQ  && !desc.includes(amQ)) return;

    const rooms = roomsFiltered.filter(r => r.hostel_id === h.id);
    const col   = document.createElement('div');
    col.className = 'hostel-column';

    const roomsHTML = rooms.length
      ? rooms.map(r => `
        <div class="room-card">
          <h4>${r.name}</h4>
          <p>${r.description}</p>
          <p><strong>Price:</strong> $${r.price}</p>
          <p><strong>Occupancy:</strong> ${r.occupancy_limit}</p>
          <button data-room-id="${r.id}">Apply</button>
          ${r.photo_url?`<button data-src="${r.photo_url}">View</button>`:``}
        </div>
      `).join('')
      : '<p>No rooms available.</p>';

    col.innerHTML = `
      <h3>${h.name}</h3>
      <p>${h.description}</p>
      <div class="rooms-list">${roomsHTML}</div>
    `;
    container.appendChild(col);
  });

  // Attach handlers
  document.querySelectorAll('button[data-room-id]').forEach(btn => {
    btn.onclick = async () => {
      const uid = Number(localStorage.getItem('userId'));
      if (!uid) {
        alert('Please log in first.');
        return window.location = 'login.html';
      }
      try {
        const res = await fetch(`${BACKEND_URL}/api/applications`, {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            user_id: uid,
            room_id: Number(btn.dataset.roomId),
            status: 'Pending'
          })
        });
        if (!res.ok) throw new Error(res.statusText);
        alert('Application submitted!');
      } catch (e) {
        console.error(e);
        alert('Failed to apply.');
      }
    };
  });
  document.querySelectorAll('button[data-src]').forEach(btn => {
    btn.onclick = () => {
      const src = btn.dataset.src;
      if (!src) return alert('No image available');
      document.getElementById('modal-image').src = src;
      document.getElementById('image-modal').classList.add('active');
    };
  });
}

// ─── SIMPLE LOADERS FOR OTHER STUDENT PAGES ─────────────────────────────────
async function loadHostelsPage() {
  const ul = document.getElementById('hostels-list');
  if (!ul) return;
  ul.innerHTML = '<li>Loading…</li>';
  try {
    const res = await fetch(`${BACKEND_URL}/api/hostels`);
    const data = await res.json();
    ul.innerHTML = Array.isArray(data) && data.length
      ? data.map(h => `
          <li>
            <h3>${h.name}</h3>
            <p>${h.description}</p>
            <p><strong>Occupancy:</strong> ${h.occupancy_limit}</p>
            ${h.photo_url?`<img src="${h.photo_url}" style="max-width:150px">`:``}
          </li>
        `).join('')
      : '<li>No hostels.</li>';
  } catch {
    ul.innerHTML = '<li>Error loading.</li>';
  }
}

async function loadRoomsPage() {
  const ul = document.getElementById('rooms-list');
  if (!ul) return;
  ul.innerHTML = '<li>Loading…</li>';
  try {
    const res = await fetch(`${BACKEND_URL}/api/rooms`);
    const data = await res.json();
    ul.innerHTML = Array.isArray(data) && data.length
      ? data.map(r => `
          <li>
            <h3>${r.name}</h3>
            <p>${r.description}</p>
            <p><strong>Price:</strong> $${r.price}</p>
            <p><strong>Occupancy:</strong> ${r.occupancy_limit}</p>
          </li>
        `).join('')
      : '<li>No rooms.</li>';
  } catch {
    ul.innerHTML = '<li>Error loading.</li>';
  }
}

async function loadApplicationsPage() {
  const ul = document.getElementById('applications-list');
  if (!ul) return;
  ul.innerHTML = '<li>Loading…</li>';
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BACKEND_URL}/api/dashboard`, {
      headers:{ 'Authorization': `Bearer ${token}` }
    });
    const apps = (await res.json()).applications||[];
    ul.innerHTML = apps.length
      ? apps.map(a => `<li>Room ${a.room_id} — ${a.status}</li>`).join('')
      : '<li>No applications.</li>';
  } catch {
    ul.innerHTML = '<li>Error loading.</li>';
  }
}

async function loadDashboardPage() {
  const token = localStorage.getItem('token');
  if (!token) return window.location = 'login.html';
  try {
    const res = await fetch(`${BACKEND_URL}/api/dashboard`, {
      headers:{ 'Authorization': `Bearer ${token}` }
    });
    const d = await res.json();
    document.getElementById('student-name').textContent  = d.profile?.username||'N/A';
    document.getElementById('student-email').textContent = d.profile?.email||'N/A';
    document.getElementById('total-applications').textContent    = d.stats?.total   || 0;
    document.getElementById('pending-applications').textContent  = d.stats?.pending || 0;
    document.getElementById('accepted-applications').textContent = d.stats?.accepted|| 0;
    document.getElementById('rejected-applications').textContent = d.stats?.rejected|| 0;

    // Assigned rooms
    const ar = document.getElementById('assigned-rooms-list');
    ar.innerHTML = (d.assignedRooms||[]).length
      ? d.assignedRooms.map(rm => `<li>${rm.room} @ ${rm.hostel}</li>`).join('')
      : '<li>No rooms assigned.</li>';

    // Notifications
    const nl = document.getElementById('notifications-list');
    nl.innerHTML = (d.notifications||[]).length
      ? d.notifications.map(n => `<li>[${new Date(n.created_at).toLocaleString()}] ${n.message}</li>`).join('')
      : '<li>No notifications.</li>';
  } catch {
    alert('Failed to load dashboard.');
  }
}

// ─── AUTH HANDLERS ───────────────────────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const pwd   = document.getElementById('password').value.trim();
  if (!email||!pwd) return alert('Fill both fields');
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ email, password:pwd })
    });
    if (!res.ok) {
      const err = await res.json(); throw new Error(err.error||res.statusText);
    }
    const { token } = await res.json();
    localStorage.setItem('token', token);
    localStorage.setItem('userId', JSON.parse(atob(token.split('.')[1])).id);
    window.location = 'dashboard.html';
  } catch (e) {
    alert(`Login failed: ${e.message}`);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const u = document.getElementById('name').value.trim();
  const eM= document.getElementById('email').value.trim();
  const p = document.getElementById('phone').value.trim();
  const pw= document.getElementById('password').value.trim();
  const cf= document.getElementById('confirm-password').value.trim();
  if (!u||!eM||!p||!pw||!cf) return alert('All fields required');
  if (pw !== cf) return alert('Passwords must match');
  try {
    const res = await fetch(`${BACKEND_URL}/api/users`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ username:u, email:eM, phone:p, password:pw })
    });
    if (!res.ok) {
      const err = await res.json(); throw new Error(err.error||res.statusText);
    }
    alert('Registered! Please log in.');
    window.location = 'login.html';
  } catch (e) {
    alert(`Register failed: ${e.message}`);
  }
}

// ─── PAGE DISPATCHER ─────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  setupAuthLink();
  setupImageModal();

  const page = (location.pathname.split('/').pop()||'index.html').toLowerCase();
  switch (page) {
    case '':  
    case 'index.html':
      await fetchAllData();
      renderIndex();
      document.getElementById('search-button')?.addEventListener('click', renderIndex);
      document.getElementById('clear-search-button')?.addEventListener('click', () => {
        ['search-location','search-amenities','search-min-price','search-max-price','search-max-occupancy']
          .forEach(id => document.getElementById(id).value = '');
        renderIndex();
      });
      break;
    case 'hostels.html':       loadHostelsPage();       break;
    case 'rooms.html':         loadRoomsPage();         break;
    case 'applications.html':  loadApplicationsPage();  break;
    case 'dashboard.html':     loadDashboardPage();     break;
    case 'login.html':         document.getElementById('login-form')?.addEventListener('submit', handleLogin); break;
    case 'register.html':      document.getElementById('register-form')?.addEventListener('submit', handleRegister); break;
  }
});
