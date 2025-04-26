// app.js (entry point for your frontend)

// Backend Base URL
const BACKEND_URL = 'https://student-housing-backend.onrender.com';

// Utility to set text content safely
function setTextContent(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/**
 * Fetch and display the list of hostels
 */
async function loadHostels() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/hostels`);
    if (!res.ok) throw new Error(`Hostels fetch error: ${res.status}`);
    const hostels = await res.json();
    const list = document.getElementById('hostels-list');
    if (!list) return;
    list.innerHTML = '';
    hostels.forEach(({ name, address }) => {
      const li = document.createElement('li');
      li.textContent = `${name} - ${address}`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error('Error loading hostels:', err.message);
  }
}

/**
 * Fetch and display dashboard data (requires valid JWT)
 */
async function loadDashboard() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('No auth token, skipping dashboard fetch');
    return;
  }
  try {
    const res = await fetch(`${BACKEND_URL}/api/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Dashboard fetch error: ${res.status}`);
    const data = await res.json();
    if (data.error) {
      console.error('API error:', data.error);
      return;
    }
    populateProfile(data.profile || {});
    populateStats(data.stats || {});
    populateHostels(data.hostels || []);
    populateRecentActivities(data.activities || []);
  } catch (err) {
    console.error('Error loading dashboard:', err.message);
    alert('Failed to load dashboard.');
  }
}

function populateProfile({ username, email }) {
  setTextContent('student-name', username || 'N/A');
  setTextContent('student-email', email || 'N/A');
}

function populateStats({ total, pending, accepted, rejected }) {
  setTextContent('total-applications', total ?? 0);
  setTextContent('pending-applications', pending ?? 0);
  setTextContent('accepted-applications', accepted ?? 0);
  setTextContent('rejected-applications', rejected ?? 0);
}

function populateHostels(hostels) {
  const container = document.getElementById('hostels-list');
  if (!container) return;
  container.innerHTML = '';
  hostels.forEach(({ name, address }) => {
    const div = document.createElement('div');
    div.className = 'hostel-card';
    div.innerHTML = `<h3>${name}</h3><p>${address}</p>`;
    container.appendChild(div);
  });
}

function populateRecentActivities(activities) {
  const list = document.getElementById('recent-activities-list');
  if (!list) return;
  list.innerHTML = '';
  activities.forEach(activity => {
    const li = document.createElement('li');
    li.textContent = activity;
    list.appendChild(li);
  });
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
    console.error('Error submitting application:', err.message);
    alert('Failed to submit application.');
  }
}

// **User Authentication Handlers**
async function login(event) {
  event.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    alert('Both email and password are required.');
    return;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || errData.message || 'Login failed');
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
  const username        = document.getElementById('name').value.trim();
  const email           = document.getElementById('email').value.trim();
  const phone           = document.getElementById('phone').value.trim();
  const password        = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirm-password')?.value.trim();

  if (!username || !email || !phone || !password) {
    alert('All fields are required.');
    return;
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    alert('Passwords do not match.');
    return;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, phone, password })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || errData.message || 'Registration failed');
    }

    alert('Registration successful!');
    window.location.href = 'login.html';
  } catch (err) {
    console.error('Register error:', err);
    alert(`Registration failed: ${err.message}`);
  }
}

// DOM-ready: attach all form and button handlers
window.addEventListener('DOMContentLoaded', () => {
  loadHostels();
  if (localStorage.getItem('token')) {
    loadDashboard();
  }
  document.getElementById('login-form')?.addEventListener('submit', login);
  document.getElementById('register-form')?.addEventListener('submit', register);
  document.getElementById('apply-button')?.addEventListener('click', () => {
    const userId = Number(localStorage.getItem('userId'));
    const roomId = Number(document.getElementById('room-id')?.value);
    submitApplication(userId, roomId);
  });
  document.getElementById('search-button')?.addEventListener('click', async () => {
    const query = document.getElementById('search-input')?.value.trim();
    if (!query) return;
    // implement search logic here
  });
});
