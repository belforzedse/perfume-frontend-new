// Test API connection
const API_URL = "https://kioskapi.gandom-perfume.ir";
const STRAPI_TOKEN = "506061ccebba94b76a5367d675f321b661507da2a96d32157153d6d1eebf633a583705d25da01f8d2d064e3bcd629b2ee8d7a439927ed863c1bfc71a3f449c4d619329fda1d4969865724874e1ba7f7508862dfd7a0f348b7c9dcadddf6831043f690c9f956132b013094e48717a1b8668a184a2fb6b0b22b4bfd76dab73d3d2";

async function testAPI() {
  const params = new URLSearchParams();
  params.set("populate[brand][fields][0]", "name");
  params.set("populate[collection][fields][0]", "name");
  params.set("populate[notes]", "*");
  params.set("populate[cover][fields][0]", "url");
  params.set("populate[cover][fields][1]", "alternativeText");
  params.set("pagination[page]", "1");
  params.set("pagination[pageSize]", "100");

  const url = `${API_URL}/api/perfumes?${params.toString()}`;
  console.log("Testing URL:", url);

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
    });

    console.log("Response status:", response.status);
    console.log("Response OK:", response.ok);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Error body:", errorBody);
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("Success! Got", data.data?.length, "perfumes");
    console.log("First perfume:", data.data?.[0]);
    return data;
  } catch (error) {
    console.error("Fetch error:", error.message);
    console.error("Full error:", error);
    throw error;
  }
}

testAPI();
