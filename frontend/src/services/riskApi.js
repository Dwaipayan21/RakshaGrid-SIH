const API_BASE_URL = 'http://127.0.0.1:5000/api/v1';

export async function assessSettlementRisk(settlement) {
    const response = await fetch(`${API_BASE_URL}/risk/assess`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            settlement,
        }),
    });

    const data = await response.json();

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
    const response = await fetch(`${API_BASE_URL}/risk/health`);

    const data = await response.json();

    if (!response.ok) {
        throw new Error('Risk engine health check failed');
    }

    return data;
}