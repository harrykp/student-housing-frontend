const BACKEND_URL = 'https://student-housing-backend.onrender.com';

// Fetch and populate student's dashboard data
async function loadDashboard() {
    const response = await fetch(`${BACKEND_URL}/api/dashboard`);
    const data = await response.json();

    // Populate profile
    document.getElementById('student-name').textContent = data.name;
    document.getElementById('student-email').textContent = data.email;

    // Populate applications
    const applicationsTable = document.getElementById('applications-table');
    applicationsTable.innerHTML = '';
    data.applications.forEach(app => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${app.room}</td>
            <td>${app.status}</td>
            <td>${app.applied_at}</td>
        `;
        applicationsTable.appendChild(row);
    });
}

// Fetch and populate hostels list
async function loadHostels() {
    const response = await fetch(`${BACKEND_URL}/api/hostels`);
    const hostels = await response.json();

    const hostelsList = document.getElementById('hostels-list');
    hostelsList.innerHTML = '';
    hostels.forEach(hostel => {
        const li = document.createElement('li');
        li.textContent = `${hostel.name} - ${hostel.address}`;
        hostelsList.appendChild(li);
    });
}