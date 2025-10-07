// Test update perfume with documentId
const API_URL = "https://kioskapi.gandom-perfume.ir";
const STRAPI_TOKEN = "506061ccebba94b76a5367d675f321b661507da2a96d32157153d6d1eebf633a583705d25da01f8d2d064e3bcd629b2ee8d7a439927ed863c1bfc71a3f449c4d619329fda1d4969865724874e1ba7f7508862dfd7a0f348b7c9dcadddf6831043f690c9f956132b013094e48717a1b8668a184a2fb6b0b22b4bfd76dab73d3d2";

async function testUpdate() {
  const documentId = "ucw3b5l9a2orkarmrj2vgvrl"; // First perfume's documentId

  // First, get the current perfume
  console.log("Fetching perfume...");
  const getResponse = await fetch(`${API_URL}/api/perfumes/${documentId}?populate[brand][fields][0]=name&populate[notes]=*`, {
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      Accept: "application/json",
    },
  });

  const currentData = await getResponse.json();
  console.log("Current perfume:", currentData.data.name_fa);

  // Now test update (just update description)
  console.log("\nTesting update...");
  const updatePayload = {
    name_fa: currentData.data.name_fa,
    name_en: currentData.data.name_en,
    description: "Test update " + new Date().toISOString(),
  };

  const updateResponse = await fetch(`${API_URL}/api/perfumes/${documentId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: updatePayload }),
  });

  console.log("Update status:", updateResponse.status);

  if (!updateResponse.ok) {
    const errorData = await updateResponse.json();
    console.error("Update failed:", errorData);
    return;
  }

  const updateResult = await updateResponse.json();
  console.log("Update successful!");
  console.log("New description:", updateResult.data.description);
}

testUpdate().catch(console.error);
