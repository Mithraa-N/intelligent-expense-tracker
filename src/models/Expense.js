/**
 * Expense Model Specification
 * @typedef {Object} Expense
 * @property {number|string} id - Unique identifier
 * @property {number} amount - Transaction value
 * @property {string} category - Business category (e.g., Food, Transport)
 * @property {string} description - Brief summary of the spend
 * @property {string} date - ISO date string (YYYY-MM-DD)
 * @property {string} [type] - 'expense' or 'income' (defaults to 'expense')
 * @property {number} [userId] - Associated household member ID
 */

export const createExpense = (data) => ({
    id: data.id || Date.now() + Math.random(),
    amount: parseFloat(data.amount) || 0,
    category: data.category || 'Other',
    description: data.description || '',
    date: data.date || new Date().toISOString().split('T')[0],
    type: data.type || 'expense',
    userId: data.userId || null
});
