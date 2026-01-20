import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const icons = {
    success: <CheckCircle size={20} className="text-green-400" />,
    error: <AlertCircle size={20} className="text-red-400" />,
    info: <Info size={20} className="text-blue-400" />
};

const colors = {
    success: 'border-green-500/50 bg-green-500/10 text-green-200',
    error: 'border-red-500/50 bg-red-500/10 text-red-200',
    info: 'border-blue-500/50 bg-blue-500/10 text-blue-200'
};

export default function NotificationToast({ notifications, removeNotification }) {
    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            zIndex: 1000,
            pointerEvents: 'none'
        }}>
            <AnimatePresence>
                {notifications.map((notif) => (
                    <NotificationItem
                        key={notif.id}
                        notif={notif}
                        removeNotification={removeNotification}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}

const NotificationItem = ({ notif, removeNotification }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            removeNotification(notif.id);
        }, 5000);

        return () => clearTimeout(timer);
    }, [notif.id, removeNotification]);

    const style = {
        success: { borderLeft: '4px solid #10b981', background: 'rgba(16, 185, 129, 0.1)' },
        error: { borderLeft: '4px solid #ef4444', background: 'rgba(239, 68, 68, 0.1)' },
        info: { borderLeft: '4px solid #3b82f6', background: 'rgba(59, 130, 246, 0.1)' }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            layout
            style={{
                pointerEvents: 'auto',
                minWidth: '300px',
                padding: '16px',
                borderRadius: '8px',
                background: '#1e1e2e',
                color: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'start',
                gap: '12px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                ...style[notif.type]
            }}
        >
            <div style={{ marginTop: '2px' }}>
                {notif.type === 'success' && <CheckCircle size={18} color="#10b981" />}
                {notif.type === 'error' && <AlertCircle size={18} color="#ef4444" />}
                {notif.type === 'info' && <Info size={18} color="#3b82f6" />}
            </div>
            <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 600 }}>
                    {notif.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8, lineHeight: 1.4 }}>
                    {notif.message}
                </p>
            </div>
            <button
                onClick={() => removeNotification(notif.id)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex'
                }}
            >
                <X size={16} />
            </button>
        </motion.div>
    );
};
