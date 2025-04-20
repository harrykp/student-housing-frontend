// Backend base URL (replace with your actual backend URL)
const BASE_URL = 'https://student-housing-backend.onrender.com';

// Function to fetch hostels from the backend
async function fetchHostels() {
  try {
    const response = await fetch(`${BASE_URL}/api/hostels`);
    if (!response.ok) {
      throw new Error('Failed to fetch hostels');
    }
    const hostels = await response.json();
    displayHostels(hostels);
  } catch (error) {
    console.error('Error:', error);
    const hostelsList = document.getElementById('hostels-list');
    hostelsList.innerHTML = `<li>Error loading hostels. Please try again later.</li>`;
  }
}

// Function to display hostels on the page
function displayHostels(hostels) {
  const hostelsList = document.getElementById('hostels-list');
  hostelsList.innerHTML = ''; // Clear any existing content

  hostels.forEach((hostel) => {
    const li = document.createElement('li');
    li.textContent = `${hostel.name} - ${hostel.address}`;
    hostelsList.appendChild(li);
  });
}

// Fetch and display hostels when the page loads
fetchHostels();