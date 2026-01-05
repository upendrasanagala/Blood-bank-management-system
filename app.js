/* BASE URL for your Flask API */
const API_URL = "http://127.0.0.1:5000/api";

/* SEARCH DONOR */
async function searchDonor() {
  const bloodValue =
    document.getElementById("searchBlood")?.value.trim() || "";

  const addressValue =
    document.getElementById("searchAddress")?.value.trim().toLowerCase() || "";

  const container = document.getElementById("resultsContainer");

  if (!container) return;

  // Loading state
  container.innerHTML =
    '<p class="text-center text-gray-500">Searching database...</p>';

  try {
    const response = await fetch(
      `${API_URL}/search?blood=${encodeURIComponent(bloodValue)}&address=${encodeURIComponent(addressValue)}`
    );

    const donors = await response.json();

    let tableHTML = `
      <div class="overflow-x-auto shadow-md rounded-lg">
        <table class="min-w-full bg-white text-sm text-left text-gray-700">
          <thead class="bg-red-600 text-white">
            <tr>
              <th class="px-6 py-3">Student ID</th>
              <th class="px-6 py-3">Name</th>
              <th class="px-6 py-3 text-center">Blood Group</th>
              <th class="px-6 py-3">Address</th>
              <th class="px-6 py-3">Phone</th>
            </tr>
          </thead>
          <tbody class="divide-y">
    `;

    if (donors.length === 0) {
      tableHTML += `
        <tr>
          <td colspan="5" class="text-center py-6 text-gray-500">
            No donors found matching your criteria.
          </td>
        </tr>
      `;
    } else {
      donors.forEach((d) => {
        tableHTML += `
          <tr class="hover:bg-red-50">
            <td class="px-6 py-4 font-bold">${d.studentId}</td>
            <td class="px-6 py-4">${d.name}</td>
            <td class="px-6 py-4 text-center">
              <span class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                ${d.blood}
              </span>
            </td>
            <td class="px-6 py-4 capitalize">${d.address}</td>
            <td class="px-6 py-4">${d.phone}</td>
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
    console.error("Search error:", error);
    container.innerHTML =
      '<p class="text-center text-red-600 font-bold">Failed to connect to server.</p>';
  }
}
