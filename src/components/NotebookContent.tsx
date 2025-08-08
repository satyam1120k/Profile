import React from 'react'
import { motion } from 'framer-motion'
import TableOfContents from './sections/TableOfContents'
import Home from './sections/Home'
import About from './sections/About'
import Resume from './sections/Resume'
import Projects from './sections/Projects'
import Skills from './sections/Skills'
import Contact from './sections/Contact'

interface NotebookContentProps {
  currentPage: number
  onPageChange: (page: number) => void
  isNotebookOpen: boolean
  onClose: () => void
}

const NotebookContent: React.FC<NotebookContentProps> = ({ 
  currentPage, 
  onPageChange, 
  isNotebookOpen,
  onClose
}) => {
  const sections = [
    { component: TableOfContents, title: 'Table of Contents' },
    { component: Home, title: 'Home' },
    { component: About, title: 'About Me' },
    { component: Resume, title: 'Resume' },
    { component: Projects, title: 'Projects' },
    { component: Skills, title: 'Skills' },
    { component: Contact, title: 'Contact' }
  ]

  const currentSection = sections[currentPage]

  if (!isNotebookOpen) {
    return null
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80vw',
        height: '80vh',
        maxWidth: '800px',
        maxHeight: '600px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '30px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        border: '2px solid var(--primary-pink, #ffb3d9)',
        overflow: 'hidden',
        zIndex: 1000,
        pointerEvents: 'auto'
      }}
    >
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {sections.map((section, index) => (
          <motion.button
            key={index}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '20px',
              background: currentPage === index ? 'var(--primary-pink, #ffb3d9)' : 'rgba(255, 179, 217, 0.3)',
              color: currentPage === index ? 'white' : 'var(--dark-text, #333)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
            onClick={() => onPageChange(index)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {section.title}
          </motion.button>
        ))}
      </nav>

      {/* Content Section */}
      <motion.div
        key={currentPage}
        style={{
          height: 'calc(100% - 80px)',
          overflow: 'auto',
          padding: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '15px',
          border: '1px solid rgba(255, 179, 217, 0.3)'
        }}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -20 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {React.createElement(currentSection.component, {
          onPageChange: onPageChange
        })}
      </motion.div>

      {/* Close button */}
      <motion.button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '15px',
          right: '20px',
          background: 'rgba(255, 179, 217, 0.8)',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          color: 'white',
          fontWeight: 'bold'
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        ×
      </motion.button>

      {/* Page indicator */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '20px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '5px 10px',
        borderRadius: '15px',
        fontSize: '12px',
        color: 'var(--dark-text, #333)',
        fontWeight: '500'
      }}>
        <span style={{ color: 'var(--primary-pink, #ffb3d9)', fontWeight: '700' }}>
          {currentPage + 1}
        </span>
        <span> / {sections.length}</span>
      </div>
    </div>
  )
}

export default NotebookContent
