const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Helper function for handling API errors
const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return null;
    }

    return response.json();
};

export const api = {
    // --- Expense CRUD Operations ---

    getExpenses: async (filters = {}) => {
        const params = new URLSearchParams();

        if (filters.category) params.append('category', filters.category);
        if (filters.type) params.append('type', filters.type);
        if (filters.user_id) params.append('user_id', filters.user_id);
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        if (filters.skip !== undefined) params.append('skip', filters.skip);
        if (filters.limit !== undefined) params.append('limit', filters.limit);

        const url = `${API_BASE_URL}/expenses${params.toString() ? '?' + params.toString() : ''}`;
        const resp = await fetch(url);
        return handleResponse(resp);
    },

    getExpense: async (id) => {
        const resp = await fetch(`${API_BASE_URL}/expenses/${id}`);
        return handleResponse(resp);
    },

    createExpense: async (expense) => {
        const resp = await fetch(`${API_BASE_URL}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expense)
        });
        return handleResponse(resp);
    },

    updateExpense: async (id, expense) => {
        const resp = await fetch(`${API_BASE_URL}/expenses/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expense)
        });
        return handleResponse(resp);
    },

    deleteExpense: async (id) => {
        const resp = await fetch(`${API_BASE_URL}/expenses/${id}`, {
            method: 'DELETE'
        });
        return handleResponse(resp);
    },

    // --- Intelligence Suite ---

    parseText: async (text) => {
        const resp = await fetch(`${API_BASE_URL}/ai/parse?text=${encodeURIComponent(text)}`, {
            method: 'POST'
        });
        return handleResponse(resp);
    },

    getAnomalies: async () => {
        const resp = await fetch(`${API_BASE_URL}/ai/anomalies`);
        return handleResponse(resp);
    },

    getForecast: async (days = 30) => {
        const resp = await fetch(`${API_BASE_URL}/ai/forecast?days=${days}`);
        return handleResponse(resp);
    },

    getInsights: async () => {
        const resp = await fetch(`${API_BASE_URL}/ai/insights`);
        return handleResponse(resp);
    },

    getAnalysis: async () => {
        const resp = await fetch(`${API_BASE_URL}/ai/analyze`);
        return handleResponse(resp);
    },

    getHealthCheck: async () => {
        const resp = await fetch(`${API_BASE_URL}/ai/health-check`);
        return handleResponse(resp);
    },

    predictCategory: async (text) => {
        const resp = await fetch(`${API_BASE_URL}/ai/predict-category?text=${encodeURIComponent(text)}`, {
            method: 'POST'
        });
        return handleResponse(resp);
    }
};
