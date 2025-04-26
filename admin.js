// admin.js

const BACKEND_URL = 'https://student-housing-backend.onrender.com';

// show/hide modals
function openModal(id)  { document.getElementById(id)?.classList.add('active'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('active'); }

// logout
function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

/**
 * Load and render hostels (with linked room names)
 */
async function loadHostelsAdmin() {
  const tbody = document.getElementById('hostels-table-body');
  tbody.innerHTML = '<tr><td colspan="7">Loading hostels…</td></tr>';
  try {
    const [hRes, rRes] = await Promise.all([
      fetch(`${BACKEND_URL}/api/hostels`),
      fetch(`${BACKEND_URL}/api/rooms`)
    ]);
    if (!hRes.ok) throw new Error(`Hostels API ${hRes.status}`);
    if (!rRes.ok) throw new Error(`Rooms API ${rRes.status}`);
    const hostels = await hRes.json();
    const rooms   = await rRes.json();
    if (!Array.isArray(hostels)) throw new Error('Invalid hostels payload');
    if (!Array.isArray(rooms))   throw new Error('Invalid rooms payload');

    tbody.innerHTML = '';
    if (hostels.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7">No hostels found.</td></tr>';
      return;
    }

    hostels.forEach(h => {
      const linkedNames = rooms
        .filter(r => r.hostel_id === h.id)
        .map(r => r.name)
        .join(', ') || '—';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${h.id}</td>
        <td>${h.name}</td>
        <td>${h.description}</td>
        <td>${h.occupancy_limit}</td>
        <td>${linkedNames}</td>
        <td><a href="${h.photo_url}" target="_blank">View</a></td>
        <td>
          <button class="edit-hostel" data-id="${h.id}">Edit</button>
          <button class="delete-hostel" data-id="${h.id}">Delete</button>
        </td>`;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading hostels:', err);
    tbody.innerHTML = `<tr><td colspan="7">Error loading hostels.</td></tr>`;
  }
}

/**
 * Load and render rooms (showing hostel name)
 */
async function loadRoomsAdmin() {
  const tbody = document.getElementById('rooms-table-body');
  tbody.innerHTML = '<tr><td colspan="8">Loading rooms…</td></tr>';
  try {
    const [rRes, hRes] = await Promise.all([
      fetch(`${BACKEND_URL}/api/rooms`),
      fetch(`${BACKEND_URL}/api/hostels`)
    ]);
    if (!rRes.ok) throw new Error(`Rooms API ${rRes.status}`);
    if (!hRes.ok) throw new Error(`Hostels API ${hRes.status}`);
    const rooms   = await rRes.json();
    const hostels = await hRes.json();
    if (!Array.isArray(rooms))   throw new Error('Invalid rooms payload');
    if (!Array.isArray(hostels)) throw new Error('Invalid hostels payload');

    tbody.innerHTML = '';
    if (rooms.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8">No rooms found.</td></tr>';
      return;
    }

    rooms.forEach(r => {
      const hostelName = (hostels.find(h=>h.id===r.hostel_id)||{}).name || '—';
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
  } catch (err) {
    console.error('Error loading rooms:', err);
    tbody.innerHTML = `<tr><td colspan="8">Error loading rooms.</td></tr>`;
  }
}

/**
 * Load and render students
 */
async function loadStudentsAdmin() {
  const tbody = document.getElementById('students-table-body');
  tbody.innerHTML = '<tr><td colspan="5">Loading students…</td></tr>';
  try {
    const res = await fetch(`${BACKEND_URL}/api/users`);
    if (!res.ok) throw new Error(`Users API ${res.status}`);
    const users = await res.json();
    if (!Array.isArray(users)) throw new Error('Invalid users payload');

    tbody.innerHTML = '';
    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">No students found.</td></tr>';
      return;
    }

    users.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${u.id}</td>
        <td>${u.username}</td>
        <td>${u.email}</td>
        <td>${u.phone||''}</td>
        <td>
          <button class="delete-student" data-id="${u.id}">Delete</button>
        </td>`;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading students:', err);
    tbody.innerHTML = `<tr><td colspan="5">Error loading students.</td></tr>`;
  }
}

// Wire up everything when the page loads
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('logout-link')?.addEventListener('click', logout);

  if (location.pathname.endsWith('admin-hostels.html')) {
    loadHostelsAdmin();
    // delegate Edit/Delete clicks
    document.getElementById('hostels-table-body')
      .addEventListener('click', e => {
        if (e.target.matches('.edit-hostel'))  openHostelForm(e.target.dataset.id);
        if (e.target.matches('.delete-hostel')) deleteHostel(e.target.dataset.id);
      });
    document.getElementById('create-hostel-button')
      .addEventListener('click', () => openHostelForm());
    document.getElementById('hostel-form')
      .addEventListener('submit', saveHostel);
  }

  if (location.pathname.endsWith('admin-rooms.html')) {
    loadRoomsAdmin();
    document.getElementById('rooms-table-body')
      .addEventListener('click', e => {
        if (e.target.matches('.edit-room'))  openRoomForm(e.target.dataset.id);
        if (e.target.matches('.delete-room')) deleteRoom(e.target.dataset.id);
      });
    document.getElementById('create-room-button')
      .addEventListener('click', () => openRoomForm());
    document.getElementById('room-form')
      .addEventListener('submit', saveRoom);
  }

  if (location.pathname.endsWith('admin-students.html')) {
    loadStudentsAdmin();
    document.getElementById('students-table-body')
      .addEventListener('click', e => {
        if (e.target.matches('.delete-student')) deleteStudent(e.target.dataset.id);
      });
  }
});
