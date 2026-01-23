import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReceiptCameraScanner({ onCapture, onCancel }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'black',
                zIndex: 200,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white'
            }}
        >
            <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                    <X size={24} />
                </button>
            </div>

            <p>Camera Scanner Placeholder</p>
            <button
                onClick={() => onCancel()}
                style={{ marginTop: '20px', padding: '10px', background: 'white', color: 'black', border: 'none', borderRadius: '5px' }}
            >
                Close
            </button>
        </motion.div>
    );
}
