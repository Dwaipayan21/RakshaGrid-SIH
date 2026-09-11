const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000/api/v1'


// =========================================================
// FETCH CENSUS VILLAGE DATA
// =========================================================

export const fetchVillageData = async () => {

  const response =
    await fetch(
      `${API_BASE_URL}/village-data?page=1&limit=100`
    )


  if (!response.ok) {

    throw new Error(
      `Failed to fetch village data: ${response.status}`
    )

  }


  const result =
    await response.json()


  if (!result.success) {

    throw new Error(
      result.message ||
      'Failed to fetch village data.'
    )

  }


  // IMPORTANT:
  // VillageDataPanel expects an array.
  // Backend returns { success, data, ... }.
  return result.data || []

}


// =========================================================
// FETCH SINGLE CENSUS VILLAGE
// =========================================================

export const fetchVillageById =
  async (id) => {

    if (!id) {

      throw new Error(
        'Village ID is required.'
      )

    }


    const response =
      await fetch(
        `${API_BASE_URL}/village-data/${encodeURIComponent(id)}`
      )


    if (!response.ok) {

      throw new Error(
        `Failed to fetch village: ${response.status}`
      )

    }


    const result =
      await response.json()


    if (!result.success) {

      throw new Error(
        result.message ||
        'Failed to fetch village.'
      )

    }


    return result.data

  }


// =========================================================
// API BASE URL
// =========================================================

export {
  API_BASE_URL,
}