// admin.js

const BACKEND_URL = 'https://student-housing-backend.onrender.com';

// ——— Modal Helpers ————————————————————————————————————————————————
function openModal(id) {
  document.getElementById(id)?.classList.add('active');
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove('active');
}

// ——— Auth —————————————————————————————————————————————————————————
function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

// ——— HOSTELS ————————————————————————————————————————————————————————
async function loadHostelsAdmin() {
  const [hRes, rRes] = await Promise.all([
    fetch(`${BACKEND_URL}/api/hostels`),
    fetch(`${BACKEND_URL}/api/rooms`)
  ]);
  const hostels = await hRes.json();
  const rooms   = await rRes.json();
  const tbody   = document.getElementById('hostels-table-body');
  tbody.innerHTML = '';

  hostels.forEach(h => {
    const linked = rooms
      .filter(r => r.hostel_id === h.id)
      .map(r => r.name)
      .join(', ') || '—';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${h.id}</td>
      <td>${h.name}</td>
      <td>${h.description}</td>
      <td>${h.occupancy_limit}</td>
      <td>${linked}</td>
      <td><a href="${h.photo_url}" target="_blank">View</a></td>
      <td>
        <button class="edit-hostel" data-id="${h.id}">Edit</button>
        <button class="delete-hostel" data-id="${h.id}">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

async function openHostelForm(id = '') {
  ['hostel-id','hostel-name','hostel-description','hostel-occupancy','hostel-photo']
    .forEach(f => document.getElementById(f).value = '');

  if (id) {
    const res = await fetch(`${BACKEND_URL}/api/hostels/${id}`);
    if (!res.ok) return alert('Hostel not found.');
    const h = await res.json();
    document.getElementById('hostel-id').value          = h.id;
    document.getElementById('hostel-name').value        = h.name;
    document.getElementById('hostel-description').value = h.description;
    document.getElementById('hostel-occupancy').value   = h.occupancy_limit;
    document.getElementById('hostel-photo').value       = h.photo_url;
  }
  openModal('hostel-form-modal');
}

async function saveHostel(e) {
  e.preventDefault();
  const id = document.getElementById('hostel-id').value;
  const payload = {
    name:            document.getElementById('hostel-name').value.trim(),
    description:     document.getElementById('hostel-description').value.trim(),
    occupancy_limit: Number(document.getElementById('hostel-occupancy').value),
    photo_url:       document.getElementById('hostel-photo').value.trim()
  };
  await fetch(
    `${BACKEND_URL}/api/hostels${id ? `/${id}` : ''}`,
    {
      method:  id ? 'PUT' : 'POST',
      headers: { 'Content-Type':'application/json' },
      body:    JSON.stringify(payload)
    }
  );
  closeModal('hostel-form-modal');
  loadHostelsAdmin();
}

async function deleteHostel(id) {
  if (!confirm('Delete this hostel?')) return;
  await fetch(`${BACKEND_URL}/api/hostels/${id}`, { method:'DELETE' });
  loadHostelsAdmin();
}

// ——— ROOMS ————————————————————————————————————————————————————————————
async function loadRoomsAdmin() {
  const [rRes, hRes] = await Promise.all([
    fetch(`${BACKEND_URL}/api/rooms`),
    fetch(`${BACKEND_URL}/api/hostels`)
  ]);
  const rooms   = await rRes.json();
  const hostels = await hRes.json();
  const tbody   = document.getElementById('rooms-table-body');
  tbody.innerHTML = '';

  rooms.forEach(r => {
    const hostelName = (hostels.find(h => h.id === r.hostel_id) || {}).name || '—';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.id}</td>
      <td>${r.name}</td>
      <td>${r.description}</td>
      <td>${r.price}</td>
      <td>${r.occupancy_limit}</td>
      <td>${hostelName}</td>
      <td><a href="${r.photo_url}" target="_blank">View</a></td>
      <td>
        <button class="edit-room" data-id="${r.id}">Edit</button>
        <button class="delete-room" data-id="${r.id}">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

async function openRoomForm(id = '') {
  ['room-id','room-name','room-description','room-price','room-occupancy','room-hostel-id','room-photo']
    .forEach(f => document.getElementById(f).value = '');

  if (id) {
    const res = await fetch(`${BACKEND_URL}/api/rooms/${id}`);
    if (!res.ok) return alert('Room not found.');
    const r = await res.json();
    document.getElementById('room-id').value           = r.id;
    document.getElementById('room-name').value         = r.name;
    document.getElementById('room-description').value  = r.description;
    document.getElementById('room-price').value        = r.price;
    document.getElementById('room-occupancy').value    = r.occupancy_limit;
    document.getElementById('room-hostel-id').value    = r.hostel_id;
    document.getElementById('room-photo').value        = r.photo_url;
  }
  openModal('room-form-modal');
}

async function saveRoom(e) {
  e.preventDefault();
  const id = document.getElementById('room-id').value;
  const payload = {
    name:            document.getElementById('room-name').value.trim(),
    description:     document.getElementById('room-description').value.trim(),
    price:           Number(document.getElementById('room-price').value),
    occupancy_limit: Number(document.getElementById('room-occupancy').value),
    hostel_id:       Number(document.getElementById('room-hostel-id').value),
    photo_url:       document.getElementById('room-photo').value.trim()
  };
  await fetch(
    `${BACKEND_URL}/api/rooms${id ? `/${id}` : ''}`,
    {
      method:  id ? 'PUT' : 'POST',
      headers: { 'Content-Type':'application/json' },
      body:    JSON.stringify(payload)
    }
  );
  closeModal('room-form-modal');
  loadRoomsAdmin();
}

async function deleteRoom(id) {
  if (!confirm('Delete this room?')) return;
  await fetch(`${BACKEND_URL}/api/rooms/${id}`, { method:'DELETE' });
  loadRoomsAdmin();
}

// ——— Initialization ——————————————————————————————————————————————————
window.addEventListener('DOMContentLoaded', () => {
  // Logout always available
  document.getElementById('logout-link')?.addEventListener('click', logout);

  // If the hostels table is present, wire up its logic
  const hostelsTable = document.getElementById('hostels-table-body');
  if (hostelsTable) {
    loadHostelsAdmin();
    hostelsTable.addEventListener('click', e => {
      const btn = e.target;
      if (btn.matches('.edit-hostel'))   openHostelForm(btn.dataset.id);
      if (btn.matches('.delete-hostel')) deleteHostel(btn.dataset.id);
    });
    document.getElementById('create-hostel-button')?.addEventListener('click', () => openHostelForm());
    document.getElementById('hostel-form-cancel')?.addEventListener('click', e => {
      e.preventDefault();
      closeModal('hostel-form-modal');
    });
    document.getElementById('hostel-form')?.addEventListener('submit', saveHostel);
  }

  // If the rooms table is present, wire up its logic
  const roomsTable = document.getElementById('rooms-table-body');
  if (roomsTable) {
    loadRoomsAdmin();
    roomsTable.addEventListener('click', e => {
      const btn = e.target;
      if (btn.matches('.edit-room'))   openRoomForm(btn.dataset.id);
      if (btn.matches('.delete-room')) deleteRoom(btn.dataset.id);
    });
    document.getElementById('create-room-button')?.addEventListener('click', () => openRoomForm());
    document.getElementById('room-form-cancel')?.addEventListener('click', e => {
      e.preventDefault();
      closeModal('room-form-modal');
    });
    document.getElementById('room-form')?.addEventListener('submit', saveRoom);
  }
});
