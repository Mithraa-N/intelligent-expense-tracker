const API_BASE_URL = 'http://localhost:8000/api/v1';

export const api = {
    // --- Core Expenses ---
    getExpenses: async () => {
        const resp = await fetch(`${API_BASE_URL}/expenses`);
        return resp.json();
    },

    createExpense: async (expense) => {
        const resp = await fetch(`${API_BASE_URL}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expense)
        });
        return resp.json();
    },

    // --- Intelligence Suite ---
    parseText: async (text) => {
        const resp = await fetch(`${API_BASE_URL}/ai/parse?text=${encodeURIComponent(text)}`, {
            method: 'POST'
        });
        return resp.json();
    },

    getAnomalies: async () => {
        const resp = await fetch(`${API_BASE_URL}/ai/anomalies`);
        return resp.json();
    },

    getForecast: async (days = 30) => {
        const resp = await fetch(`${API_BASE_URL}/ai/forecast?days=${days}`);
        return resp.json();
    },

    getInsights: async () => {
        const resp = await fetch(`${API_BASE_URL}/ai/insights`);
        return resp.json();
    },

    getHealthCheck: async () => {
        const resp = await fetch(`${API_BASE_URL}/ai/health-check`);
        return resp.json();
    }
};
