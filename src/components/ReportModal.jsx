import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Send,
    Share2,
    Calendar,
    Download,
    CheckCircle2,
    Mail,
    Loader2,
    TrendingUp,
    TrendingDown,
    BarChart3
} from 'lucide-react';

export default function ReportModal({ isOpen, onClose, expenses, users, auth, currencySymbol }) {
    const [activePeriod, setActivePeriod] = useState('Monthly');
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const reportData = useMemo(() => {
        const now = new Date();
        const periods = {
            Daily: expenses.filter(ex => ex.date === now.toISOString().split('T')[0]),
            Weekly: expenses.filter(ex => {
                const d = new Date(ex.date);
                const diff = (now - d) / (1000 * 60 * 60 * 24);
                return diff >= 0 && diff <= 7;
            }),
            Monthly: expenses.filter(ex => {
                const d = new Date(ex.date);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }),
            Yearly: expenses.filter(ex => {
                const d = new Date(ex.date);
                return d.getFullYear() === now.getFullYear();
            })
        };

        const currentEntries = periods[activePeriod] || [];
        const expensesOnly = currentEntries.filter(e => e.type === 'expense');
        const incomeOnly = currentEntries.filter(e => e.type === 'income');

        const totalExpense = expensesOnly.reduce((acc, curr) => acc + curr.amount, 0);
        const totalIncome = incomeOnly.reduce((acc, curr) => acc + curr.amount, 0);

        // Group by category
        const categories = {};
        expensesOnly.forEach(ex => {
            categories[ex.category] = (categories[ex.category] || 0) + ex.amount;
        });

        const categoryList = Object.entries(categories)
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount);

        return { totalExpense, totalIncome, categoryList, count: currentEntries.length };
    }, [expenses, activePeriod]);

    const handleSendEmail = () => {
        setIsSending(true);
        // Simulate API call to send email
        setTimeout(() => {
            setIsSending(false);
            setIsSent(true);
            setTimeout(() => setIsSent(false), 3000);
        }, 2000);
    };

    const handleShare = async () => {
        const text = `📊 Household Report (${activePeriod})\nNet Cashflow: ${currencySymbol}${(reportData.totalIncome - reportData.totalExpense).toFixed(2)}\nTotal Spent: ${currencySymbol}${reportData.totalExpense.toFixed(2)}\nGenerated for ${auth.email}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Household Intel Report',
                    text: text,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(text);
            alert('Report summary copied to clipboard!');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="overlay" style={{ zIndex: 120 }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass"
                style={{
                    width: '100%',
                    maxWidth: '600px',
                    padding: '0',
                    overflow: 'hidden',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Header */}
                <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                    <div>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem' }}>
                            <BarChart3 color="var(--primary)" /> Intelligence Reports
                        </h2>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Reports for {auth.email}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Period Selector */}
                <div style={{ display: 'flex', padding: '1rem 2rem', gap: '0.5rem', background: 'rgba(0,0,0,0.1)' }}>
                    {['Daily', 'Weekly', 'Monthly', 'Yearly'].map(p => (
                        <button
                            key={p}
                            onClick={() => setActivePeriod(p)}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                borderRadius: '12px',
                                border: 'none',
                                background: activePeriod === p ? 'var(--primary)' : 'transparent',
                                color: activePeriod === p ? 'white' : 'var(--text-dim)',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div className="glass" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Total Spent</p>
                            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#f43f5e' }}>{currencySymbol}{reportData.totalExpense.toLocaleString()}</h3>
                        </div>
                        <div className="glass" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Total Income</p>
                            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#22c55e' }}>{currencySymbol}{reportData.totalIncome.toLocaleString()}</h3>
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', marginBottom: '2rem', textAlign: 'center', border: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Net Cashflow</p>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: (reportData.totalIncome - reportData.totalExpense) >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
                            {reportData.totalIncome >= reportData.totalExpense ? '+' : '-'}{currencySymbol}{Math.abs(reportData.totalIncome - reportData.totalExpense).toLocaleString()}
                        </h2>
                    </div>

                    <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Category Breakdown</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {reportData.categoryList.length > 0 ? reportData.categoryList.map(cat => (
                            <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '80px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>{cat.name}</div>
                                <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(cat.amount / (reportData.totalExpense || 1)) * 100}%` }}
                                        style={{ height: '100%', background: 'var(--primary)' }}
                                    />
                                </div>
                                <div style={{ width: '80px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 600 }}>{currencySymbol}{cat.amount.toFixed(0)}</div>
                            </div>
                        )) : (
                            <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem' }}>No data for this period</p>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div style={{ padding: '2rem', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={handleSendEmail}
                        disabled={isSending || (reportData.totalExpense === 0 && reportData.totalIncome === 0)}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            borderRadius: '14px',
                            border: 'none',
                            background: isSent ? 'var(--success)' : 'white',
                            color: isSent ? 'white' : 'black',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            transition: 'all 0.3s'
                        }}
                    >
                        {isSending ? <Loader2 className="animate-spin" size={18} /> : isSent ? <CheckCircle2 size={18} /> : <Mail size={18} />}
                        {isSending ? 'Generating & Sending...' : isSent ? 'Report Sent to Mail!' : 'Send to Email'}
                    </button>

                    <button
                        onClick={handleShare}
                        disabled={reportData.totalExpense === 0 && reportData.totalIncome === 0}
                        style={{
                            padding: '1rem 1.5rem',
                            borderRadius: '14px',
                            border: '1px solid var(--border)',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Share2 size={18} /> Share
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
