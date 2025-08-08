import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, User, FileText, Briefcase, Code, Mail } from 'lucide-react'
import './TableOfContents.css'

interface TableOfContentsProps {
  onPageChange: (page: number) => void
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ onPageChange }) => {
  const sections = [
    { id: 1, title: 'Home', icon: User, description: 'Welcome and introduction' },
    { id: 2, title: 'About Me', icon: BookOpen, description: 'My story and background' },
    { id: 3, title: 'Resume', icon: FileText, description: 'Education and experience' },
    { id: 4, title: 'Projects', icon: Briefcase, description: 'My work and achievements' },
    { id: 5, title: 'Skills', icon: Code, description: 'Technical expertise' },
    { id: 6, title: 'Contact', icon: Mail, description: 'Get in touch' }
  ]

  const handleSectionClick = (pageIndex: number) => {
    if ((window as any).playPageTurnSound) {
      (window as any).playPageTurnSound()
    }
    onPageChange(pageIndex)
  }

  return (
    <div className="toc-container">
      <motion.div
        className="toc-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="toc-title">Portfolio</h1>
        <p className="toc-subtitle">Satyam Patel</p>
        <p className="toc-description">
          Full Stack Developer | AI Enthusiast
        </p>
      </motion.div>

      <div className="toc-sections">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            className="toc-section"
            onClick={() => handleSectionClick(index + 1)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="section-icon">
              <section.icon size={24} />
            </div>
            <div className="section-content">
              <h3 className="section-title">{section.title}</h3>
              <p className="section-description">{section.description}</p>
            </div>
            <div className="section-arrow">
              →
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="toc-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p className="footer-quote">
          "Turning ideas into immersive experiences."
        </p>
      </motion.div>
    </div>
  )
}

export default TableOfContents




