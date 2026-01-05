/* BASE URL for your Flask API */
const API_URL = "http://127.0.0.1:5000/api";

/* DONOR REGISTRATION */
document.addEventListener("DOMContentLoaded", () => {
  const donorForm = document.getElementById("donorForm");
  if (!donorForm) return;

  donorForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const age = document.getElementById("age").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim().toLowerCase();
    const blood = document.getElementById("blood").value;
    const msg = document.getElementById("msg");

    /* VALIDATIONS */
    if (!name || !email || !age || !phone || !address || !blood) {
      msg.innerText = "Please fill all fields";
      msg.className = "text-red-600 text-center font-bold";
      return;
    }

    if (age < 18) {
      msg.innerText = "Age must be 18 or above";
      msg.className = "text-red-600 text-center font-bold";
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      msg.innerText = "Enter valid 10-digit phone number";
      msg.className = "text-red-600 text-center font-bold";
      return;
    }

    /* SEND DATA TO FLASK BACKEND */
    const donorData = { name, email, age, phone, address, blood };

    try {
      msg.innerText = "Registering...";
      msg.className = "text-blue-600 text-center font-bold";

      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donorData),
      });

      if (response.ok) {
        msg.innerText = "Registration Successful ✔";
        msg.className = "text-green-600 text-center font-bold";
        
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
        donorForm.reset();
      } else {
        msg.innerText = "Server Error. Please try again.";
        msg.className = "text-red-600 text-center font-bold";
      }
    } catch (error) {
      console.error("Error:", error);
      msg.innerText = "Connection Failed. Is the server running?";
      msg.className = "text-red-600 text-center font-bold";
    }
  });
});

/* SEARCH DONOR */
async function searchDonor() {
  const bloodValue = document.getElementById("searchBlood")?.value || "";
  const addressValue = document.getElementById("searchAddress")?.value.trim() || "";
  const container = document.getElementById("resultsContainer");

  if (!container) return;
  
  // Show Loading State
  container.innerHTML = '<p class="text-center text-gray-500">Searching database...</p>';

  try {
    // Call Flask API with query parameters
    const response = await fetch(`${API_URL}/search?blood=${bloodValue}&address=${addressValue}`);
    const filtered = await response.json();

    /* CREATE TABLE HEADER */
    let tableHTML = `
      <div class="overflow-x-auto shadow-md rounded-lg mt-4">
        <table class="min-w-full border-collapse bg-white text-sm text-left text-gray-700">
          <thead class="bg-red-600 text-white uppercase tracking-wider">
            <tr>
              <th class="px-6 py-3 font-semibold">Name</th>
              <th class="px-6 py-3 font-semibold text-center">Blood Group</th>
              <th class="px-6 py-3 font-semibold">Address</th>
              <th class="px-6 py-3 font-semibold">Phone</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
    `;

    if (filtered.length === 0) {
      tableHTML += `
        <tr>
          <td colspan="4" class="text-center py-6 text-gray-500 text-base">
            No donors found matching your criteria.
          </td>
        </tr>
      `;
    } else {
      filtered.forEach((d) => {
        tableHTML += `
          <tr class="hover:bg-red-50 transition duration-150">
            <td class="px-6 py-4 font-medium text-gray-900">${d.name}</td>
            <td class="px-6 py-4 text-center">
              <span class="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-red-200">
                ${d.blood}
              </span>
            </td>
            <td class="px-6 py-4 capitalize">${d.address}</td>
            <td class="px-6 py-4 font-mono text-gray-600">
              <a href="tel:${d.phone}" class="hover:text-red-600 hover:underline">
                ${d.phone}
              </a>
            </td>
          </tr>
        `;
      });
    }

    tableHTML += `
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = tableHTML;

  } catch (error) {
    console.error("Search Error:", error);
    container.innerHTML = '<p class="text-center text-red-600 font-bold">Failed to connect to server.</p>';
  }
}