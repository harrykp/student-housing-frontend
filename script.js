// Backend Base URL
const BASE_URL = "https://student-housing-backend.onrender.com";

// Fetch Hostels
async function fetchHostels() {
  try {
    const response = await fetch(`${BASE_URL}/api/hostels`);
    if (!response.ok) throw new Error("Failed to fetch hostels");
    const hostels = await response.json();

    const hostelsList = document.getElementById("hostels-list");
    hostelsList.innerHTML = ""; // Clear any existing content

    hostels.forEach(({ name, address }) => {
      const li = document.createElement("li");
      li.textContent = `${name} - ${address}`;
      hostelsList.appendChild(li);
    });
  } catch (error) {
    console.error("Error fetching hostels:", error);
    document.getElementById("hostels-list").innerHTML =
      "<li>Error loading hostels. Please try again later.</li>";
  }
}

// Fetch Rooms
async function fetchRooms() {
  try {
    const response = await fetch(`${BASE_URL}/api/rooms`);
    if (!response.ok) throw new Error("Failed to fetch rooms");
    const rooms = await response.json();

    const roomsList = document.getElementById("rooms-list");
    roomsList.innerHTML = ""; // Clear any existing content

    rooms.forEach(({ type, price }) => {
      const li = document.createElement("li");
      li.textContent = `Type: ${type}, Price: $${price}`;
      roomsList.appendChild(li);
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    document.getElementById("rooms-list").innerHTML =
      "<li>Error loading rooms. Please try again later.</li>";
  }
}

// Fetch Data on Page Load
document.addEventListener("DOMContentLoaded", () => {
  fetchHostels();
  fetchRooms();
});

//----------------------------
// Backend base URL (replace with your actual backend URL)
//const BASE_URL = 'https://student-housing-backend.onrender.com';

// Function to fetch hostels from the backend
//async function fetchHostels() {
//  try {
//    const response = await fetch(`${BASE_URL}/api/hostels`);
//    if (!response.ok) {
//      throw new Error('Failed to fetch hostels');
    }
//    const hostels = await response.json();
//    displayHostels(hostels);
//  } catch (error) {
//    console.error('Error:', error);
//    const hostelsList = document.getElementById('hostels-list');
//    hostelsList.innerHTML = `<li>Error loading hostels. Please try again later.</li>`;
//  }
//}

// Function to display hostels on the page
//function displayHostels(hostels) {
//  const hostelsList = document.getElementById('hostels-list');
//  hostelsList.innerHTML = ''; // Clear any existing content

//  hostels.forEach((hostel) => {
//    const li = document.createElement('li');
//    li.textContent = `${hostel.name} - ${hostel.address}`;
//    hostelsList.appendChild(li);
//  });
//}

// Fetch and display hostels when the page loads
//fetchHostels();
