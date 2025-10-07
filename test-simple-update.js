// Test simple update with only valid fields
const API_URL = "https://kioskapi.gandom-perfume.ir";
const STRAPI_TOKEN = "506061ccebba94b76a5367d675f321b661507da2a96d32157153d6d1eebf633a583705d25da01f8d2d064e3bcd629b2ee8d7a439927ed863c1bfc71a3f449c4d619329fda1d4969865724874e1ba7f7508862dfd7a0f348b7c9dcadddf6831043f690c9f956132b013094e48717a1b8668a184a2fb6b0b22b4bfd76dab73d3d2";

async function testSimpleUpdate() {
  const documentId = "ucw3b5l9a2orkarmrj2vgvrl";

  console.log("Testing simple update...");
  const updatePayload = {
    name_fa: "مفیستو",
    name_en: "Mefisto",
    gender: "Male",
    season: "Warm seasons",
    family: "Aromatic Fruity",
    character: "Cool and Spicy - Updated",
    notes: {
      top: ["لیمو", "گریپ فروت", "برگاموت"],
      middle: ["زنبق", "اسطوخودوس", "رز"],
      base: ["سدر", "صندل", "کهربا", "مشک"]
    },
    brand: 2,
    collection: 2
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
    console.error("Update failed:", JSON.stringify(errorData, null, 2));
    return;
  }

  const updateResult = await updateResponse.json();
  console.log("Update successful!");
  console.log("Updated character:", updateResult.data.character);
}

testSimpleUpdate().catch(console.error);
