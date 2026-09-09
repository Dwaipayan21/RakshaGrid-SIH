const OSRM_BASE_URL = "https://router.project-osrm.org";

export async function getRoute(from, to) {
  const coordinates =
    `${from.lng},${from.lat};${to.lng},${to.lat}`;

  const url =
    `${OSRM_BASE_URL}/route/v1/driving/${coordinates}` +
    `?overview=full&geometries=geojson`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("OSRM request failed");
  }

  const data = await response.json();

  if (data.code !== "Ok") {
    throw new Error(`OSRM error: ${data.code}`);
  }

  return data.routes[0];
}