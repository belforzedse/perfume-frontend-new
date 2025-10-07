// Check what fields exist on perfume
const API_URL = "https://kioskapi.gandom-perfume.ir";
const STRAPI_TOKEN = "506061ccebba94b76a5367d675f321b661507da2a96d32157153d6d1eebf633a583705d25da01f8d2d064e3bcd629b2ee8d7a439927ed863c1bfc71a3f449c4d619329fda1d4969865724874e1ba7f7508862dfd7a0f348b7c9dcadddf6831043f690c9f956132b013094e48717a1b8668a184a2fb6b0b22b4bfd76dab73d3d2";

async function checkFields() {
  const params = new URLSearchParams();
  params.set("populate[brand][fields][0]", "name");
  params.set("populate[collection][fields][0]", "name");
  params.set("populate[notes]", "*");
  params.set("populate[cover][fields][0]", "url");

  const response = await fetch(`${API_URL}/api/perfumes/ucw3b5l9a2orkarmrj2vgvrl?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      Accept: "application/json",
    },
  });

  const data = await response.json();
  console.log("Perfume fields:");
  console.log(JSON.stringify(data.data, null, 2));
}

checkFields().catch(console.error);
