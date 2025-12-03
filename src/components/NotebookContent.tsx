import React from 'react'
import { motion } from 'framer-motion'

import Home from './sections/Home'
import About from './sections/About'
import Skills from './sections/Skills'
import Projects from './sections/Projects'
import Experience from './sections/Experience'
import Certifications from './sections/Certifications'
import Contact from './sections/Contact'
import './PortfolioContent.css'

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
    { component: Home, title: 'Home' },
    { component: About, title: 'About Me' },
    { component: Skills, title: 'Skills' },
    { component: Projects, title: 'Projects' },
    { component: Experience, title: 'Experience' },
    { component: Certifications, title: 'Certifications' },
    { component: Contact, title: 'Contact' }
  ]

  if (!isNotebookOpen) {
    return null
  }

  return (
    <div className="notebook-overlay">
      {/* Navigation - Hidden on Mobile */}
      <nav className="notebook-nav">
        {sections.map((section, index) => (
          <motion.button
            key={index}
            className={`nav-btn ${currentPage === index ? 'active' : ''}`}
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
      <div className="notebook-content-container">
        {sections.map((section, index) => (
          <div
            key={index}
            className={`section-wrapper ${currentPage === index ? 'active' : ''}`}
          >
            {React.createElement(section.component, {
              onPageChange: onPageChange
            })}
          </div>
        ))}
      </div>

      {/* Close button */}
      <motion.button
        onClick={onClose}
        className="close-btn"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        ×
      </motion.button>

      {/* Page indicator - Hidden on Mobile */}
      <div className="page-indicator-container">
        <span className="current-page">
          {currentPage + 1}
        </span>
        <span className="total-pages"> / {sections.length}</span>
      </div>
    </div>
  )
}

export default NotebookContent
