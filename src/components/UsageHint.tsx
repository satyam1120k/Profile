import React from 'react'
import { motion } from 'framer-motion'
import './UsageHint.css'

interface UsageHintProps {
    visible: boolean
}

const UsageHint: React.FC<UsageHintProps> = ({ visible }) => {
    if (!visible) return null

    return (
        <motion.div
            className="usage-hint-container"
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            transition={{ duration: 0.5, delay: 1 }}
        >
            <div className="hint-card">
                <div className="hint-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4.5C7.85786 4.5 4.5 7.85786 4.5 12C4.5 16.1421 7.85786 19.5 12 19.5C16.1421 19.5 19.5 16.1421 19.5 12C19.5 7.85786 16.1421 4.5 12 4.5Z" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M12 8V12L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div className="hint-content">
                    <span className="hint-title">Explore the Scene</span>
                    <span className="hint-text">Rotate, Zoom & Click the Book</span>
                </div>
            </div>
        </motion.div>
    )
}

export default UsageHint
