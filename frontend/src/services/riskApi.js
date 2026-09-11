const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:5000/api/v1';


export async function assessSettlementRisk(settlement) {

    const response =
        await fetch(
            `${API_BASE_URL}/risk/assess`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json',
                },

                body: JSON.stringify({
                    settlement,
                }),
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data?.message ||
            data?.error ||
            'Risk assessment request failed'
        );

    }


    return data;

}


export async function checkRiskEngineHealth() {

    const response =
        await fetch(
            `${API_BASE_URL}/risk/health`
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            'Risk engine health check failed'
        );

    }


    return data;

}