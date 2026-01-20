import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    BarChart3,
    TrendingUp,
    Plus,
    Sparkles,
    FileSpreadsheet,
    Camera,
    Loader2,
    Trash2,
    Users,
    UserPlus,
    X
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie,
    LineChart,
    Line,
    Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import Tesseract from 'tesseract.js';
import ReportModal from '../components/ReportModal';
import NotificationToast from '../components/NotificationToast';
import { api } from '../api';

const CURRENCY_SYMBOLS = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥'
};

const INITIAL_USERS = [
    { id: 1, name: 'Alex (Dad)', salary: 5000, color: '#6366f1', avatar: '👨‍💼' },
    { id: 2, name: 'Sarah (Mom)', salary: 4500, color: '#f43f5e', avatar: '👩‍⚕️' },
    { id: 3, name: 'Emma', salary: 1200, color: '#10b981', avatar: '👧' },
];

const DEFAULT_CATEGORIES = {
    Food: { icon: '☕', color: '#f43f5e' },
    Home: { icon: '🏠', color: '#6366f1' },
    Utilities: { icon: '⚡', color: '#f59e0b' },
    Transport: { icon: '🚗', color: '#10b981' },
    Medical: { icon: '🏥', color: '#ec4899' },
    Income: { icon: '💰', color: '#22c55e' },
    Other: { icon: '➕', color: '#94a3b8' },
};

export default function Dashboard({ auth, onLogout }) {
    const [categories, setCategories] = useState(() => {
        const saved = localStorage.getItem('sh_categories');
        return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    });
    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('sh_users');
        const parsed = saved ? JSON.parse(saved) : INITIAL_USERS;
        return parsed.map(u => ({ ...u, salary: u.salary || 0 }));
    });

    const [currentUser, setCurrentUser] = useState(users[0]);

    const [expenses, setExpenses] = useState([]);
    const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
    const [expenseError, setExpenseError] = useState(null);

    const [smartInput, setSmartInput] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [aiInsights, setAiInsights] = useState([]);
    const [anomalies, setAnomalies] = useState([]);
    const [forecast, setForecast] = useState(null);
    const [notifications, setNotifications] = useState([]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('manual');
    const [isProcessing, setIsProcessing] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);

    const [newExpense, setNewExpense] = useState({
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        description: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [newUser, setNewUser] = useState({ name: '', salary: '' });
    const [newCat, setNewCat] = useState({ name: '', icon: '📎', color: '#6366f1' });
    const [isPredictingCategory, setIsPredictingCategory] = useState(false);

    const fileInputRef = useRef(null);
    const ocrInputRef = useRef(null);

    const addNotification = (type, title, message) => {
        setNotifications(prev => [...prev, { id: Date.now(), type, title, message }]);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Fetch expenses from API on mount
    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                setIsLoadingExpenses(true);
                setExpenseError(null);
                const data = await api.getExpenses();
                setExpenses(data || []);
            } catch (err) {
                console.error("Failed to fetch expenses:", err);
                setExpenseError(err.message);
                addNotification('error', 'Fetch Error', 'Unable to load expenses. Please check your connection.');
                setExpenses([]);
            } finally {
                setIsLoadingExpenses(false);
            }
        };

        fetchExpenses();
    }, []);

    useEffect(() => {
        localStorage.setItem('sh_users', JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        localStorage.setItem('sh_categories', JSON.stringify(categories));
    }, [categories]);

    useEffect(() => {
        if (!auth) return;

        const fetchAIData = async () => {
            try {
                const [insightsRes, anomaliesRes, forecastRes] = await Promise.all([
                    api.getInsights(),
                    api.getAnomalies(),
                    api.getForecast(30)
                ]);
                setAiInsights(insightsRes);
                setAnomalies(anomaliesRes);
                setForecast(forecastRes);
            } catch (err) {
                console.error("Failed to fetch AI data", err);
            }
        };

        fetchAIData();
    }, [expenses, auth]);

    // Auto-predict category based on description
    useEffect(() => {
        if (!newExpense.description || newExpense.description.length < 3 || editingExpense) return;

        const timeoutId = setTimeout(async () => {
            setIsPredictingCategory(true);
            try {
                const result = await api.predictCategory(newExpense.description);
                // Only update if the category exists in our list
                if (result && result.category && (categories[result.category] || result.category === 'Other')) {
                    setNewExpense(prev => ({
                        ...prev,
                        category: result.category
                    }));
                }
            } catch (err) {
                console.error("Prediction failed", err);
            } finally {
                setIsPredictingCategory(false);
            }
        }, 800); // 800ms debounce

        return () => clearTimeout(timeoutId);
    }, [newExpense.description]);

    const totalSpent = useMemo(() =>
        expenses.filter(e => e.type === 'expense' || !e.type).reduce((acc, curr) => acc + curr.amount, 0),
        [expenses]);

    const totalIncome = useMemo(() =>
        expenses.filter(e => e.type === 'income').reduce((acc, curr) => acc + curr.amount, 0),
        [expenses]);

    const categoryData = useMemo(() => {
        const data = {};
        expenses.filter(e => e.type === 'expense' || !e.type).forEach(ex => {
            data[ex.category] = (data[ex.category] || 0) + ex.amount;
        });
        return Object.keys(data).map(key => ({
            name: key,
            value: data[key],
            fill: categories[key]?.color || '#8884d8'
        }));
    }, [expenses, categories]);

    const dailySpending = useMemo(() => {
        const data = {};
        expenses.forEach(ex => {
            const val = ex.type === 'income' ? ex.amount : -ex.amount;
            data[ex.date] = (data[ex.date] || 0) + val;
        });
        return Object.keys(data).sort().map(date => ({ date, amount: data[date] }));
    }, [expenses]);

    const userSpending = useMemo(() => {
        const data = users.map(u => ({
            ...u,
            total: expenses
                .filter(e => e.user_id === u.id && (e.type === 'expense' || !e.type))
                .reduce((a, b) => a + b.amount, 0)
        }));
        return data;
    }, [expenses, users]);

    const monthlyTrendData = useMemo(() => {
        const data = {};
        expenses.forEach(ex => {
            const date = new Date(ex.date);
            const sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const displayKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });

            if (!data[sortKey]) {
                data[sortKey] = {
                    sortKey,
                    month: displayKey,
                    expense: 0,
                    income: 0
                };
            }

            if (ex.type === 'income') {
                data[sortKey].income += ex.amount;
            } else {
                data[sortKey].expense += ex.amount;
            }
        });

        return Object.keys(data)
            .sort()
            .map(key => data[key]);
    }, [expenses]);

    const monthlyStats = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
        const lastMonth = lastMonthDate.getMonth();
        const lastYear = lastMonthDate.getFullYear();

        const currentMonthlyExpenses = expenses.filter(e => {
            const d = new Date(e.date);
            return (e.type === 'expense' || !e.type) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const lastMonthlyExpenses = expenses.filter(e => {
            const d = new Date(e.date);
            return (e.type === 'expense' || !e.type) && d.getMonth() === lastMonth && d.getFullYear() === lastYear;
        });

        const currentTotal = currentMonthlyExpenses.reduce((acc, curr) => acc + curr.amount, 0);
        const lastTotal = lastMonthlyExpenses.reduce((acc, curr) => acc + curr.amount, 0);

        const percentChange = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal) * 100 : 0;

        return {
            total: currentTotal,
            count: currentMonthlyExpenses.length,
            lastTotal,
            percentChange,
            isHigher: currentTotal > lastTotal
        };
    }, [expenses]);

    const tips = useMemo(() => {
        const combined = [...aiInsights.map(insight => ({
            title: insight.title,
            desc: insight.message,
            severity: insight.priority === 'high' ? 'danger' : insight.priority === 'medium' ? 'warning' : 'info',
            action: insight.type === 'anomaly_alert' ? 'Verify' : insight.type === 'saving_tip' ? 'Optimize' : 'View'
        }))];

        if (combined.length === 0) {
            combined.push({
                title: 'Intelligence Ready',
                desc: 'Keep adding expenses to unlock deeper AI insights.',
                severity: 'info',
                action: 'Got it'
            });
        }

        return combined;
    }, [aiInsights]);

    const validateForm = () => {
        const errors = {};
        if (!newExpense.description || newExpense.description.trim().length < 3) {
            errors.description = "Description must be at least 3 characters.";
        }
        if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) {
            errors.amount = "Amount must be greater than zero.";
        }
        if (!newExpense.date) {
            errors.date = "Please select a valid date.";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleManualAdd = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setIsProcessing(true);

            if (editingExpense) {
                // Update existing expense
                const updated = await api.updateExpense(editingExpense.id, {
                    description: newExpense.description,
                    amount: parseFloat(newExpense.amount),
                    category: newExpense.category,
                    date: newExpense.date,
                    type: newExpense.type,
                    user_id: currentUser.id
                });

                // Update local state
                setExpenses(expenses.map(ex => ex.id === editingExpense.id ? updated : ex));
                setEditingExpense(null);
            } else {
                // Create new expense
                const created = await api.createExpense({
                    description: newExpense.description,
                    amount: parseFloat(newExpense.amount),
                    category: newExpense.category,
                    date: newExpense.date,
                    type: newExpense.type,
                    user_id: currentUser.id
                });

                // Add to local state
                setExpenses([created, ...expenses]);
            }

            setIsAddModalOpen(false);
            resetForm();
            addNotification('success', editingExpense ? 'Update Success' : 'Entry Added', editingExpense ? 'Transaction updated successfully.' : 'New transaction added successfully.');
        } catch (err) {
            console.error("Failed to save expense:", err);
            addNotification('error', 'Save Failed', err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const startEdit = (expense) => {
        setEditingExpense(expense);
        setNewExpense({
            amount: expense.amount.toString(),
            category: expense.category,
            date: expense.date,
            type: expense.type || 'expense',
            description: expense.description || ''
        });
        setIsAddModalOpen(true);
    };

    const handleAddUser = (e) => {
        e.preventDefault();
        if (!newUser.name.trim() || !newUser.salary) return;
        const userObj = {
            id: Date.now(),
            name: newUser.name,
            salary: parseFloat(newUser.salary),
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            avatar: '👤'
        };
        setUsers([...users, userObj]);
        setNewUser({ name: '', salary: '' });
    };

    const deleteUser = (id) => {
        if (users.length <= 1) return addNotification('error', 'Action Fail', "At least one user must remain.");
        setUsers(users.filter(u => u.id !== id));
        setExpenses(expenses.filter(e => e.user_id !== id));
        if (currentUser.id === id) {
            setCurrentUser(users.find(u => u.id !== id));
        }
    };

    const handleAddCategory = (e) => {
        e.preventDefault();
        if (!newCat.name.trim()) return;
        setCategories({
            ...categories,
            [newCat.name]: { icon: newCat.icon, color: newCat.color }
        });
        setNewCat({ name: '', icon: '📎', color: '#6366f1' });
    };

    const deleteCategory = (name) => {
        if (Object.keys(categories).length <= 1) return addNotification('error', 'Action Fail', "Must have at least one category.");
        const next = { ...categories };
        delete next[name];
        setCategories(next);
    };

    const resetForm = () => {
        setNewExpense({
            amount: '',
            category: 'Food',
            date: new Date().toISOString().split('T')[0],
            type: 'expense',
            description: ''
        });
        setFormErrors({});
        setEditingExpense(null);
        setActiveTab('manual');
        setIsProcessing(false);
    };

    const handleExcelImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsProcessing(true);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            try {
                const results = await Promise.all(data.map(row => {
                    const amount = parseFloat(row.Amount || row.amount || 0);
                    if (amount <= 0) return null;

                    return api.createExpense({
                        description: row.Description || row.description || row.Title || row.title || 'Imported',
                        amount: amount,
                        category: row.Category || row.category || 'Other',
                        date: row.Date || row.date || new Date().toISOString().split('T')[0],
                        type: 'expense',
                        user_id: currentUser.id
                    });
                }));

                const newEntries = results.filter(res => res !== null);
                setExpenses(prev => [...newEntries, ...prev]);
                setExpenses(prev => [...newEntries, ...prev]);
                setIsAddModalOpen(false);
                addNotification('success', 'Import Success', `Successfully imported ${newEntries.length} transactions.`);
            } catch (err) {
                console.error("Import failed:", err);
                addNotification('error', 'Import Failed', err.message);
            } finally {
                setIsProcessing(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleOCR = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsProcessing(true);
        try {
            const result = await Tesseract.recognize(file, 'eng');
            const text = result.data.text;
            const amountMatch = text.match(/[\d]{1,}\.[\d]{2}/);
            setNewExpense(prev => ({
                ...prev,
                description: text.split('\n')[0]?.substring(0, 20) || "Scanned",
                amount: amountMatch ? parseFloat(amountMatch[0]) : ""
            }));

            setActiveTab('manual');
            addNotification('success', 'OCR Success', 'Scanned receipt details found.');
        } catch (err) { addNotification('error', 'OCR Failed', 'Could not read text from image.'); }
        setIsProcessing(false);
    };

    const deleteExpense = async (id) => {
        try {
            await api.deleteExpense(id);
            setExpenses(expenses.filter(e => e.id !== id));
            addNotification('success', 'Deleted', 'Transaction removed.');
        } catch (err) {
            console.error("Failed to delete expense:", err);
            addNotification('error', 'Delete Failed', err.message);
        }
    };

    const currencySymbol = useMemo(() => CURRENCY_SYMBOLS[auth.currency] || '$', [auth.currency]);

    const handleSmartAdd = async (e) => {
        if (e.key !== 'Enter' || !smartInput.trim()) return;
        setIsParsing(true);
        try {
            const data = await api.parseText(smartInput);

            if (data.amount) {
                const created = await api.createExpense({
                    description: data.description || 'Quick Expense',
                    amount: data.amount,
                    category: data.category || 'Other',
                    date: data.date,
                    type: 'expense',
                    user_id: currentUser.id
                });

                setExpenses([created, ...expenses]);
                setSmartInput('');
                addNotification('success', 'Smart Add', 'Expense added instantly!');
            }
        } catch (err) {
            console.error("Smart Add failed", err);
            addNotification('error', 'Smart Add Failed', err.message);
        } finally {
            setIsParsing(false);
        }
    };

    return (
        <div className="container">
            {/* Header & User Switcher */}
            <header style={{ marginBottom: 'var(--space-2xl)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-lg)' }}>
                    <div>
                        <h1 style={{ background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 'var(--space-xs)' }}>
                            Household Intel
                        </h1>
                        <p style={{ color: 'var(--text-dim)', fontSize: 'var(--font-size-sm)', margin: 0 }}>Hello, {auth.name}! Track and optimize household spending.</p>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-xs)', background: 'rgba(255,255,255,0.05)', padding: 'var(--space-xs)', borderRadius: 'var(--radius-lg)' }}>
                            {users.map(u => (
                                <button
                                    key={u.id}
                                    onClick={() => setCurrentUser(u)}
                                    style={{
                                        background: currentUser.id === u.id ? 'var(--primary)' : 'transparent',
                                        padding: 'var(--space-sm) var(--space-md)',
                                        borderRadius: 'var(--radius-md)',
                                        color: currentUser.id === u.id ? 'white' : 'var(--text-dim)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-xs)'
                                    }}
                                >
                                    <span style={{ fontSize: 'var(--font-size-lg)' }}>{u.avatar}</span>
                                    <span style={{ fontSize: 'var(--font-size-xs)' }}>{u.name.split(' ')[0]}</span>
                                </button>
                            ))}
                            <button
                                onClick={() => setIsUserModalOpen(true)}
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                title="Add User"
                            >
                                <UserPlus size={16} />
                            </button>
                        </div>
                        <button
                            onClick={() => setIsReportModalOpen(true)}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                border: '1px solid var(--border)',
                                padding: 'var(--space-sm) var(--space-md)',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-xs)'
                            }}
                        >
                            <BarChart3 size={16} /> <span>Reports</span>
                        </button>
                        <button
                            onClick={onLogout}
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: 'var(--danger)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                padding: 'var(--space-sm) var(--space-md)',
                                borderRadius: 'var(--radius-md)'
                            }}
                        >
                            Sign Out
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            style={{
                                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                color: 'white',
                                padding: 'var(--space-sm) var(--space-lg)',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-xs)'
                            }}
                        >
                            <Plus size={18} /> <span>Add</span>
                        </button>
                    </div>
                </div>

                {/* Smart Add Bar */}
                <div style={{ position: 'relative' }}>
                    <Sparkles size={18} style={{ position: 'absolute', left: 'var(--space-md)', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)', zIndex: 1 }} />
                    <input
                        placeholder="Quick Add: 'Spent ₹250 on lunch yesterday' and press Enter..."
                        value={smartInput}
                        onChange={e => setSmartInput(e.target.value)}
                        onKeyDown={handleSmartAdd}
                        disabled={isParsing}
                        style={{
                            width: '100%',
                            padding: 'var(--space-md) var(--space-md) var(--space-md) 3rem',
                            borderRadius: 'var(--radius-lg)',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border)',
                            color: 'white',
                            fontSize: 'var(--font-size-sm)'
                        }}
                    />
                    {isParsing && <Loader2 size={18} className="spin" style={{ position: 'absolute', right: 'var(--space-md)', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)' }} />}
                </div>
            </header>

            <div className="grid-layout">
                <aside className="col-sidebar">
                    <div className="glass" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18} color="var(--primary)" /> Household Pulse</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {userSpending.map(u => (
                                <div key={u.id}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                                        <span>{u.avatar} {u.name}</span>
                                        <span style={{ fontWeight: 600 }}>{currencySymbol}{u.total.toFixed(0)} / {currencySymbol}{u.salary || 0}</span>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: `${Math.min((u.total / (u.salary || 1)) * 100, 100)}%`, height: '100%', background: u.total > u.salary ? 'var(--danger)' : u.color }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Sparkles size={18} color="var(--accent)" /> Minimization Tips</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {tips.map((tip, i) => (
                                <div key={i} style={{ padding: '1rem', borderRadius: '16px', background: `rgba(${tip.severity === 'warning' ? '245, 158, 11' : tip.severity === 'danger' ? '239, 68, 68' : '34, 197, 94'}, 0.08)`, borderLeft: `4px solid var(--${tip.severity === 'info' ? 'primary' : tip.severity})` }}>
                                    <h4 style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>{tip.title}</h4>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>{tip.desc}</p>
                                    <button style={{ marginTop: '0.75rem', width: '100%', padding: '0.4rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', fontSize: '0.7rem', cursor: 'pointer' }}>
                                        {tip.action}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                <main className="col-main">
                    <div className="glass" style={{ padding: '1.5rem', marginBottom: '1.5rem', height: '320px' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Household Cashflow</h3>
                        <ResponsiveContainer width="100%" height="80%">
                            <AreaChart data={dailySpending}>
                                <defs>
                                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="date" stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                                <Area type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="glass" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0 }}>Category Pulse</h3>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Expense Weightage</span>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '0.8rem' }}
                                        formatter={(value) => `${currencySymbol}${value.toFixed(2)}`}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'center' }}>
                                {categoryData.map((cat, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.fill }}></div>
                                        {cat.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="glass" style={{ padding: '1.5rem' }}>
                            <h3>Savings Snapshot</h3>
                            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Total Income</span>
                                    <span style={{ color: '#22c55e', fontWeight: 700 }}>{currencySymbol}{totalIncome.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Total Expenses</span>
                                    <span style={{ color: '#f43f5e', fontWeight: 700 }}>{currencySymbol}{totalSpent.toFixed(2)}</span>
                                </div>
                                <div style={{ height: '1px', background: 'var(--border)' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Net Balance</span>
                                    <span style={{ color: (totalIncome - totalSpent) >= 0 ? 'var(--primary)' : '#f43f5e', fontWeight: 800 }}>
                                        {currencySymbol}{(totalIncome - totalSpent).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <TrendingUp size={32} color="var(--success)" style={{ marginBottom: '0.5rem' }} />
                            <h3>Efficiency Score</h3>
                            <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)' }}>
                                {totalIncome > 0 ? Math.round(((totalIncome - totalSpent) / totalIncome) * 100) : 0}%
                            </p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Savings rate relative to all inflows</p>
                        </div>
                        <div className="glass" style={{ padding: '1.5rem', textAlign: 'center', position: 'relative' }}>
                            <BarChart3 size={32} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                            <h3>Monthly Burn</h3>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>
                                    {currencySymbol}{monthlyStats.total.toFixed(0)}
                                </p>
                                {monthlyStats.percentChange !== 0 && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '20px',
                                        background: monthlyStats.isHigher ? 'rgba(244, 63, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                        color: monthlyStats.isHigher ? '#f43f5e' : '#22c55e',
                                        marginTop: '0.5rem'
                                    }}>
                                        {monthlyStats.isHigher ? <TrendingUp size={12} style={{ marginRight: '2px' }} /> : <TrendingDown size={12} style={{ marginRight: '2px' }} />}
                                        {Math.abs(monthlyStats.percentChange).toFixed(0)}%
                                    </div>
                                )}
                            </div>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{monthlyStats.count} transactions this month</p>
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '1.5rem', marginTop: '1.5rem', height: '300px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Monthly Momentum</h3>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--primary)' }}></div>
                                    <span style={{ color: 'var(--text-dim)' }}>Expenses</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#22c55e' }}></div>
                                    <span style={{ color: 'var(--text-dim)' }}>Income</span>
                                </div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height="80%">
                            <BarChart data={monthlyTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="month" stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                    contentStyle={{ background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '12px' }}
                                />
                                <Bar dataKey="expense" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </main>

                <aside className="col-right">
                    <div className="glass" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Audit Trail</h3>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '10px' }}>
                                {expenses.length} Entries
                            </span>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }} className="custom-scroll">
                            {expenses.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
                                    <p style={{ fontSize: '0.8rem' }}>No transactions found yet.</p>
                                </div>
                            ) : (
                                expenses.map(ex => {
                                    const user = users.find(u => u.id === ex.userId);
                                    const category = categories[ex.category] || categories['Other'];
                                    return (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            key={ex.id}
                                            className="expense-item"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.8rem',
                                                padding: '1rem',
                                                background: 'rgba(255,255,255,0.02)',
                                                borderRadius: '16px',
                                                border: '1px solid var(--border)',
                                                transition: 'all 0.2s ease',
                                                cursor: 'default'
                                            }}
                                        >
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '12px',
                                                background: `${category.color}15`,
                                                color: category.color,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.2rem'
                                            }}>
                                                {category.icon}
                                            </div>

                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h4 style={{ fontSize: '0.85rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {ex.description}
                                                </h4>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{ex.category}</span>
                                                    <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--border)' }}></span>
                                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{user?.name.split(' ')[0]}</span>
                                                </div>
                                            </div>

                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{
                                                    fontWeight: 700,
                                                    fontSize: '0.9rem',
                                                    margin: 0,
                                                    color: ex.type === 'income' ? 'var(--success)' : 'white'
                                                }}>
                                                    {ex.type === 'income' ? '+' : '-'}{currencySymbol}{ex.amount.toFixed(2)}
                                                </p>
                                                <div className="item-actions" style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', marginTop: '0.3rem' }}>
                                                    <button
                                                        onClick={() => startEdit(ex)}
                                                        style={{
                                                            background: 'rgba(99, 102, 241, 0.1)',
                                                            border: 'none',
                                                            color: 'var(--primary)',
                                                            cursor: 'pointer',
                                                            fontSize: '0.6rem',
                                                            padding: '0.2rem 0.5rem',
                                                            borderRadius: '6px',
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteExpense(ex.id)}
                                                        style={{
                                                            background: 'rgba(239, 68, 68, 0.1)',
                                                            border: 'none',
                                                            color: 'var(--danger)',
                                                            cursor: 'pointer',
                                                            fontSize: '0.6rem',
                                                            padding: '0.2rem 0.4rem',
                                                            borderRadius: '6px',
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </aside>
            </div >

            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="overlay">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass" style={{ width: '450px', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)' }}>
                                {['manual', 'excel', 'ocr'].map(t => (
                                    <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '1rem', border: 'none', background: activeTab === t ? 'var(--primary)' : 'transparent', color: 'white', cursor: 'pointer' }}>{t.toUpperCase()}</button>
                                ))}
                            </div>
                            <div style={{ padding: '2rem' }}>
                                <button onClick={() => setIsAddModalOpen(false)} style={{ position: 'absolute', top: '13rem', right: '2rem', border: 'none', background: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
                                {activeTab === 'manual' && (
                                    <form onSubmit={handleManualAdd}>
                                        <h3 style={{ marginBottom: '1rem' }}>{editingExpense ? 'Edit Entry' : `New Entry for ${currentUser.name}`}</h3>

                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem', borderRadius: '10px' }}>
                                            {['expense', 'income'].map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setNewExpense({ ...newExpense, type })}
                                                    style={{
                                                        flex: 1, padding: '0.5rem', border: 'none', borderRadius: '8px',
                                                        background: newExpense.type === type ? 'var(--primary)' : 'transparent',
                                                        color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
                                                    }}
                                                >
                                                    {type.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>

                                        <div style={{ marginBottom: '1rem' }}>
                                            <input
                                                placeholder="Description / Payee"
                                                value={newExpense.description}
                                                onChange={e => {
                                                    setNewExpense({ ...newExpense, description: e.target.value });
                                                    if (formErrors.description) setFormErrors({ ...formErrors, description: null });
                                                }}
                                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${formErrors.description ? 'var(--danger)' : 'var(--border)'}`, color: 'white' }}
                                            />
                                            {formErrors.description && <p style={{ color: 'var(--danger)', fontSize: '0.7rem', marginTop: '0.25rem' }}>{formErrors.description}</p>}
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                            <div>
                                                <input
                                                    type="number"
                                                    placeholder={`Amount (${currencySymbol})`}
                                                    value={newExpense.amount}
                                                    onChange={e => {
                                                        setNewExpense({ ...newExpense, amount: e.target.value });
                                                        if (formErrors.amount) setFormErrors({ ...formErrors, amount: null });
                                                    }}
                                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${formErrors.amount ? 'var(--danger)' : 'var(--border)'}`, color: 'white' }}
                                                />
                                                {formErrors.amount && <p style={{ color: 'var(--danger)', fontSize: '0.7rem', marginTop: '0.25rem' }}>{formErrors.amount}</p>}
                                            </div>
                                            <div style={{ position: 'relative' }}>
                                                <select value={newExpense.category} onChange={e => setNewExpense({ ...newExpense, category: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border)', color: 'white', height: 'fit-content' }}>
                                                    {Object.keys(categories).map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                                {isPredictingCategory && (
                                                    <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                                                        <Loader2 className="spin" size={14} color="var(--accent)" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '1rem' }}>
                                            <input
                                                type="date"
                                                value={newExpense.date}
                                                onChange={e => {
                                                    setNewExpense({ ...newExpense, date: e.target.value });
                                                    if (formErrors.date) setFormErrors({ ...formErrors, date: null });
                                                }}
                                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${formErrors.date ? 'var(--danger)' : 'var(--border)'}`, color: 'white' }}
                                            />
                                            {formErrors.date && <p style={{ color: 'var(--danger)', fontSize: '0.7rem', marginTop: '0.25rem' }}>{formErrors.date}</p>}
                                        </div>

                                        <textarea
                                            placeholder="Notes (Optional)"
                                            value={newExpense.notes}
                                            onChange={e => setNewExpense({ ...newExpense, notes: e.target.value })}
                                            style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', resize: 'none', height: '80px' }}
                                        />

                                        <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'var(--primary)', border: 'none', color: 'white', fontWeight: 600 }}>
                                            {editingExpense ? 'Update Transaction' : 'Save Transaction'}
                                        </button>
                                    </form>
                                )}
                                {activeTab === 'excel' && (
                                    <div style={{ textAlign: 'center' }}>
                                        <FileSpreadsheet size={40} style={{ marginBottom: '1rem' }} />
                                        <input type="file" ref={fileInputRef} onChange={handleExcelImport} style={{ display: 'none' }} />
                                        <button onClick={() => fileInputRef.current.click()} style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'var(--primary)', border: 'none', color: 'white' }}>{isProcessing ? 'Processing...' : 'Upload Excel'}</button>
                                    </div>
                                )}
                                {activeTab === 'ocr' && (
                                    <div style={{ textAlign: 'center' }}>
                                        <Camera size={40} style={{ marginBottom: '1rem' }} />
                                        <input type="file" ref={ocrInputRef} onChange={handleOCR} style={{ display: 'none' }} />
                                        <button onClick={() => ocrInputRef.current.click()} style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'var(--primary)', border: 'none', color: 'white' }}>{isProcessing ? 'Analyzing...' : 'Scan Receipt'}</button>
                                    </div>
                                )}
                                <button onClick={() => setIsAddModalOpen(false)} style={{ width: '100%', marginTop: '1rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {isUserModalOpen && (
                    <div className="overlay" style={{ zIndex: 110 }}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: '2rem', width: '400px', maxHeight: '80vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0 }}>Manage Household</h3>
                                <button onClick={() => setIsUserModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><X size={20} /></button>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                {users.map(u => (
                                    <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '1.2rem' }}>{u.avatar}</span>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '0.85rem' }}>{u.name}</h4>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{currencySymbol}{u.salary} / mo</p>
                                        </div>
                                        <button onClick={() => deleteUser(u.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.5rem' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <h4 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '0.9rem' }}>Add New Member</h4>
                            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '2rem', marginBottom: '2rem' }}>
                                <input placeholder="Full Name" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />
                                <input type="number" placeholder={`Monthly Salary (${currencySymbol})`} value={newUser.salary} onChange={e => setNewUser({ ...newUser, salary: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />
                                <button type="submit" style={{ width: '100%', padding: '0.8rem', background: 'linear-gradient(135deg, var(--primary), var(--accent))', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Add Member</button>
                            </form>

                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Category Settings</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.8rem', marginBottom: '2rem' }}>
                                {Object.entries(categories).map(([name, cat]) => (
                                    <div key={name} style={{ position: 'relative', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${cat.color}44`, textAlign: 'center' }}>
                                        <span style={{ fontSize: '1.5rem', display: 'block' }}>{cat.icon}</span>
                                        <span style={{ fontSize: '0.7rem', display: 'block', marginTop: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
                                        <button onClick={() => deleteCategory(name)} style={{ position: 'absolute', top: '-5px', right: '-5px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--danger)', color: 'white', border: 'none', fontSize: '0.6rem', cursor: 'pointer' }}>×</button>
                                    </div>
                                ))}
                            </div>

                            <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Add Custom Category</h4>
                            <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input placeholder="Cat Name" value={newCat.name} onChange={e => setNewCat({ ...newCat, name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />
                                    <input placeholder="Emoji Icon" value={newCat.icon} onChange={e => setNewCat({ ...newCat, icon: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />
                                </div>
                                <input type="color" value={newCat.color} onChange={e => setNewCat({ ...newCat, color: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', height: '100%' }} />
                                <button type="submit" style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Save Category</button>
                            </form>

                            <button onClick={() => setIsUserModalOpen(false)} style={{ width: '100%', marginTop: '1.5rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.8rem' }}>Close Management Hub</button>
                        </motion.div>
                    </div>
                )}

                {isReportModalOpen && (
                    <ReportModal
                        isOpen={isReportModalOpen}
                        onClose={() => setIsReportModalOpen(false)}
                        expenses={expenses}
                        users={users}
                        auth={auth}
                        currencySymbol={currencySymbol}
                    />
                )}

                <NotificationToast notifications={notifications} removeNotification={removeNotification} />
            </AnimatePresence>
        </div>
    );
}
