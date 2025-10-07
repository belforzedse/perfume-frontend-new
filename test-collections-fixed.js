// Test collections API without brand populate
const API_URL = "https://kioskapi.gandom-perfume.ir";
const STRAPI_TOKEN = "506061ccebba94b76a5367d675f321b661507da2a96d32157153d6d1eebf633a583705d25da01f8d2d064e3bcd629b2ee8d7a439927ed863c1bfc71a3f449c4d619329fda1d4969865724874e1ba7f7508862dfd7a0f348b7c9dcadddf6831043f690c9f956132b013094e48717a1b8668a184a2fb6b0b22b4bfd76dab73d3d2";

async function testCollections() {
  const params = new URLSearchParams();
  params.set("pagination[pageSize]", "100");
  params.set("sort", "name:asc");

  const url = `${API_URL}/api/collections?${params.toString()}`;
  console.log("Testing URL:", url);

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        Accept: "application/json",
      },
    });

    console.log("Response status:", response.status);
    console.log("Response OK:", response.ok);

    const data = await response.json();

    if (!response.ok) {
      console.error("Error response:", data);
      throw new Error(`HTTP ${response.status}`);
    }

    console.log("Success! Got", data.data?.length, "collections");
    console.log("Collections:", data.data.map(c => c.name).join(", "));
    return data;
  } catch (error) {
    console.error("Fetch error:", error.message);
    throw error;
  }
}

testCollections();
