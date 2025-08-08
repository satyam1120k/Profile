import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TableOfContents from './sections/TableOfContents'
import Home from './sections/Home'
import About from './sections/About'
import Resume from './sections/Resume'
import Projects from './sections/Projects'
import Skills from './sections/Skills'
import Contact from './sections/Contact'
import './PortfolioContent.css'

interface PortfolioContentProps {
  currentPage: number
  onPageChange: (page: number) => void
  isNotebookOpen: boolean
}

const PortfolioContent: React.FC<PortfolioContentProps> = ({ 
  currentPage, 
  onPageChange, 
  isNotebookOpen 
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

  return (
    <div className="portfolio-overlay">
      {/* Navigation */}
      <nav className="navigation">
        {sections.map((section, index) => (
          <motion.button
            key={index}
            className={`nav-button ${currentPage === index ? 'active' : ''}`}
            onClick={() => onPageChange(index)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {section.title}
          </motion.button>
        ))}
      </nav>

      {/* Content Sections */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          className={`content-section ${isNotebookOpen ? 'active' : ''}`}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {React.createElement(currentSection.component, {
            onPageChange: onPageChange
          })}
        </motion.div>
      </AnimatePresence>

      {/* Page indicator */}
      <div className="page-indicator">
        <span className="page-number">{currentPage + 1}</span>
        <span className="page-total">/ {sections.length}</span>
      </div>
    </div>
  )
}

export default PortfolioContent

