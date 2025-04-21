
// Backend Base URL
const BACKEND_URL = 'https://student-housing-backend.onrender.com'; // Replace with your backend's deployed URL

/**
 * Fetch and display the list of hostels from the backend
 */
async function loadHostels() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/hostels`); // Fetch hostels from backend
        if (!response.ok) {
            throw new Error(`Failed to fetch hostels: ${response.statusText}`);
        }

        const hostels = await response.json(); // Parse JSON response

        // Display hostels in the page
        const hostelsList = document.getElementById('hostels-list');
        hostelsList.innerHTML = ''; // Clear existing content
        hostels.forEach(hostel => {
            const li = document.createElement('li');
            li.textContent = `${hostel.name} - ${hostel.address}`;
            hostelsList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading hostels:', error.message);
    }
}

/**
 * Fetch and display the student's dashboard data from the backend
 */
async function loadDashboard() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/dashboard`);
        if (!response.ok) {
            throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
        }

        const data = await response.json();

        // Populate profile information
        document.getElementById('student-name').textContent = data.name;
        document.getElementById('student-email').textContent = data.email;

        // Populate applications table
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
    } catch (error) {
        console.error('Error loading dashboard:', error.message);
    }
}

/**
 * Submit a new application to the backend
 */
async function submitApplication(studentId, roomId) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/applications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                student_id: studentId,
                room_id: roomId,
                status: 'Pending'
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to submit application: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Application submitted successfully:', result);
        alert('Application submitted successfully!');
    } catch (error) {
        console.error('Error submitting application:', error.message);
    }
}

// Example: Attach event listener for application submission
document.getElementById('apply-button')?.addEventListener('click', () => {
    const studentId = 1; // Example student ID
    const roomId = 2; // Example room ID
    submitApplication(studentId, roomId);
});

// Load hostels and dashboard data when the page loads
window.addEventListener('DOMContentLoaded', () => {
    loadHostels(); // Load hostels data
    loadDashboard(); // Load dashboard data
});