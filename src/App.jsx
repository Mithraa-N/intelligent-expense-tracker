import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BarChart3,
  Wallet,
  TrendingUp,
  Plus,
  History,
  PieChart,
  ShieldCheck,
  Settings,
  X,
  PlusCircle,
  Coffee,
  ShoppingBag,
  Home,
  Zap,
  Car,
  HeartPulse,
  MoreHorizontal,
  ChevronRight,
  Sparkles,
  FileSpreadsheet,
  Camera,
  Upload,
  Loader2,
  Trash2,
  Users,
  UserPlus
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
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import Tesseract from 'tesseract.js';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import ReportModal from './components/ReportModal';

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥'
};

// Initial Mock Data
const INITIAL_USERS = [
  { id: 1, name: 'Alex (Dad)', salary: 5000, color: '#6366f1', avatar: '👨‍💼' },
  { id: 2, name: 'Sarah (Mom)', salary: 4500, color: '#f43f5e', avatar: '👩‍⚕️' },
  { id: 3, name: 'Emma', salary: 1200, color: '#10b981', avatar: '👧' },
];

const INITIAL_EXPENSES = [
  { id: 1, userId: 1, title: 'Starbucks Coffee', amount: 5.50, category: 'Food', date: '2026-01-08' },
  { id: 2, userId: 2, title: 'Grocery Store', amount: 120.00, category: 'Food', date: '2026-01-08' },
  { id: 3, userId: 1, title: 'Monthly Rent', amount: 1200.00, category: 'Home', date: '2026-01-01' },
  { id: 4, userId: 2, title: 'Electricity Bill', amount: 85.00, category: 'Utilities', date: '2026-01-05' },
  { id: 5, userId: 3, title: 'Uber Ride', amount: 25.00, category: 'Transport', date: '2026-01-07' },
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

function Dashboard({ auth, setAuth }) {
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('sh_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('sh_users');
    const parsed = saved ? JSON.parse(saved) : INITIAL_USERS;
    // Migration: ensure every user has a salary field
    return parsed.map(u => ({ ...u, salary: u.salary || 0 }));
  });

  const [currentUser, setCurrentUser] = useState(users[0]);

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('manual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    description: ''
  });
  const [newUser, setNewUser] = useState({ name: '', salary: '' });
  const [newCat, setNewCat] = useState({ name: '', icon: '📎', color: '#6366f1' });

  const fileInputRef = useRef(null);
  const ocrInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('sh_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('sh_categories', JSON.stringify(categories));
  }, [categories]);

  const totalSpent = useMemo(() =>
    expenses.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0),
    [expenses]);

  const totalIncome = useMemo(() =>
    expenses.filter(e => e.type === 'income').reduce((acc, curr) => acc + curr.amount, 0),
    [expenses]);

  const categoryData = useMemo(() => {
    const data = {};
    expenses.filter(e => e.type === 'expense').forEach(ex => {
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
      const val = ex.type === 'expense' ? -ex.amount : ex.amount;
      data[ex.date] = (data[ex.date] || 0) + val;
    });
    return Object.keys(data).sort().map(date => ({ date, amount: data[date] }));
  }, [expenses]);

  const userSpending = useMemo(() => {
    const data = users.map(u => ({
      ...u,
      total: expenses
        .filter(e => e.userId === u.id && e.type === 'expense')
        .reduce((a, b) => a + b.amount, 0)
    }));
    return data;
  }, [expenses, users]);

  const generateTips = () => {
    const tips = [];
    const foodSpend = expenses.filter(e => e.category === 'Food').reduce((a, b) => a + b.amount, 0);
    const utilitySpend = expenses.filter(e => e.category === 'Utilities').reduce((a, b) => a + b.amount, 0);

    // Dynamic Expenditure Minimization Tips
    if (foodSpend > totalSpent * 0.25) {
      tips.push({
        title: 'Food Budget Optimization',
        desc: `Your food spend is ${Math.round((foodSpend / totalSpent) * 100)}% of total. Switch to meal-planning to save ~$150/mo.`,
        severity: 'warning',
        action: 'Switch to Store Brands'
      });
    }

    // Salary-based "Way to Spend" Insights
    const totalHouseholdSalary = users.reduce((acc, u) => acc + (u.salary || 0), 0);
    const householdSavingsTarget = totalHouseholdSalary * 0.2;
    const currentSavingsPotential = totalHouseholdSalary - totalSpent;

    if (currentSavingsPotential > 0) {
      tips.push({
        title: 'Expenditure Strategy',
        desc: `You have ${currencySymbol}${currentSavingsPotential.toFixed(0)} remaining. Goal: Put ${currencySymbol}${householdSavingsTarget.toFixed(0)} (20%) into high-yield savings.`,
        severity: 'success',
        action: 'Move to Savings'
      });
    } else {
      tips.push({
        title: 'Budget Deficit Alert',
        desc: `Expenses exceed total household income by ${currencySymbol}${Math.abs(currentSavingsPotential).toFixed(0)}.`,
        severity: 'danger',
        action: 'Review Large Bills'
      });
    }

    if (utilitySpend > 200) {
      tips.push({
        title: 'Energy Mini-Audit',
        desc: 'Electricity bill is high. Unplugging devices at night can save 5-10% on utilities.',
        severity: 'info',
        action: 'Unplug Standby Devices'
      });
    }

    // Individual User Behavioral Tips
    const usersWithTotal = userSpending.filter(u => u.total > 0);
    const highSpender = usersWithTotal.length > 0
      ? usersWithTotal.reduce((prev, current) => (prev.total > current.total) ? prev : current)
      : null;

    if (highSpender && totalSpent > 0 && highSpender.total > totalSpent * 0.5) {
      tips.push({
        title: `${highSpender.name}'s Spending Alert`,
        desc: `${highSpender.name} accounts for ${Math.round((highSpender.total / totalSpent) * 100)}% of household cost.`,
        severity: 'danger',
        action: 'Suggest Limit'
      });
    }

    if (expenses.length > 5) {
      tips.push({
        title: 'Expenditure Minimizer',
        desc: 'Consider a "No-Spend Weekend" to cut impulse transport costs by up to 15%.',
        severity: 'success',
        action: 'Plan No-Spend Days'
      });
    }

    return tips;
  };

  const handleManualAdd = (e) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amount) return;

    if (editingExpense) {
      const updated = expenses.map(ex => ex.id === editingExpense.id ? {
        ...newExpense,
        id: editingExpense.id,
        userId: currentUser.id,
        amount: parseFloat(newExpense.amount)
      } : ex);
      setExpenses(updated);
      setEditingExpense(null);
    } else {
      const expense = {
        ...newExpense,
        id: Date.now(),
        userId: currentUser.id,
        amount: parseFloat(newExpense.amount)
      };
      setExpenses([expense, ...expenses]);
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const startEdit = (expense) => {
    setEditingExpense(expense);
    setNewExpense({
      title: expense.title,
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
    if (users.length <= 1) return alert("At least one user must remain.");
    setUsers(users.filter(u => u.id !== id));
    setExpenses(expenses.filter(e => e.userId !== id));
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
    if (Object.keys(categories).length <= 1) return alert("Must have at least one category.");
    const next = { ...categories };
    delete next[name];
    setCategories(next);
  };

  const resetForm = () => {
    setNewExpense({
      title: '',
      amount: '',
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      description: ''
    });
    setEditingExpense(null);
    setActiveTab('manual');
    setIsProcessing(false);
  };

  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      const newEntries = data.map((row, idx) => ({
        id: Date.now() + idx,
        userId: currentUser.id,
        title: row.Title || row.title || 'Imported',
        amount: parseFloat(row.Amount || row.amount || 0),
        category: row.Category || row.category || 'Other',
        date: row.Date || row.date || new Date().toISOString().split('T')[0]
      })).filter(ex => ex.amount > 0);

      setExpenses(prev => [...newEntries, ...prev]);
      setIsProcessing(false);
      setIsAddModalOpen(false);
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
        title: text.split('\n')[0]?.substring(0, 20) || "Scanned",
        amount: amountMatch ? parseFloat(amountMatch[0]) : ""
      }));
      setActiveTab('manual');
    } catch (err) { alert("OCR Failed"); }
    setIsProcessing(false);
  };

  const deleteExpense = (id) => setExpenses(expenses.filter(e => e.id !== id));

  const currencySymbol = useMemo(() => CURRENCY_SYMBOLS[auth.currency] || '$', [auth.currency]);

  const handleLogout = () => {
    localStorage.removeItem('sh_auth');
    setAuth(null);
  };

  return (
    <div className="container">
      {/* Header & User Switcher */}
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem', background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Household Intel
            </h1>
            <p style={{ color: 'var(--text-dim)' }}>Hello, {auth.name}! Managed collaborative minimization.</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '20px' }}>
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => setCurrentUser(u)}
                  style={{
                    background: currentUser.id === u.id ? 'var(--primary)' : 'transparent',
                    border: 'none', padding: '0.5rem 1rem', borderRadius: '14px', cursor: 'pointer',
                    color: currentUser.id === u.id ? 'white' : 'var(--text-dim)',
                    transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{u.avatar}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{u.name.split(' ')[0]}</span>
                </button>
              ))}
              <button
                onClick={() => setIsUserModalOpen(true)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <UserPlus size={18} />
              </button>
            </div>
            <button
              onClick={() => setIsReportModalOpen(true)}
              style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border)', padding: '0.875rem 1.25rem', borderRadius: '16px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <BarChart3 size={18} /> Reports
            </button>
            <button
              onClick={handleLogout}
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.875rem 1.25rem', borderRadius: '16px', fontWeight: 600, cursor: 'pointer' }}
            >
              Sign Out
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', border: 'none', padding: '0.875rem 1.75rem', borderRadius: '16px', fontWeight: 600, cursor: 'pointer' }}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="grid-layout">
        {/* Sidebar: Tips to minimize expenditure */}
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
              {generateTips().map((tip, i) => (
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

        {/* Main Analytics */}
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
              <h3>Category Pressure</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={categoryData}>
                  <XAxis dataKey="name" hide />
                  <Tooltip contentStyle={{ background: 'var(--bg-dark)', border: 'none' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {categoryData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
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

          <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <TrendingUp size={32} color="var(--success)" style={{ marginBottom: '0.5rem' }} />
            <h3>Efficiency Score</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)' }}>
              {totalIncome > 0 ? Math.round(((totalIncome - totalSpent) / totalIncome) * 100) : 0}%
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Savings rate relative to all inflows</p>
          </div>
        </main>

        {/* History */}
        <aside className="col-right">
          <div className="glass" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Audit Trail</h3>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {expenses.map(ex => {
                const user = users.find(u => u.id === ex.userId);
                return (
                  <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '1.2rem' }}>{user?.avatar || '👤'}</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.8rem' }}>{ex.title}</h4>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{ex.category} • {user?.name.split(' ')[0]}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.85rem', color: ex.type === 'income' ? 'var(--success)' : 'white' }}>
                        {ex.type === 'income' ? '+' : '-'}{currencySymbol}{ex.amount.toFixed(2)}
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => startEdit(ex)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.7rem' }}>Edit</button>
                        <button onClick={() => deleteExpense(ex.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.7rem' }}>Delete</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* Modals */}
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

                    <input placeholder="Title / Payee" value={newExpense.title} onChange={e => setNewExpense({ ...newExpense, title: e.target.value })} style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <input type="number" placeholder={`Amount (${currencySymbol})`} value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />
                      <select value={newExpense.category} onChange={e => setNewExpense({ ...newExpense, category: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border)', color: 'white' }}>
                        {Object.keys(categories).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <input type="date" value={newExpense.date} onChange={e => setNewExpense({ ...newExpense, date: e.target.value })} style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />

                    <textarea
                      placeholder="Description (Optional)"
                      value={newExpense.description}
                      onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
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
          // ... (User modal code remains the same as previously implemented)
          <div className="overlay" style={{ zIndex: 110 }}>
            {/* Same existing User Modal content */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: '2rem', width: '400px', maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Manage Household</h3>
                <button onClick={() => setIsUserModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              {/* User List */}
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
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('sh_auth');
    return saved ? JSON.parse(saved) : null;
  });

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!auth ? <Login onLogin={setAuth} /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={auth ? <Dashboard auth={auth} setAuth={setAuth} /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}
