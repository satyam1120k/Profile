import React from 'react'
import { motion } from 'framer-motion'
import { Download, Mail, Github, Linkedin } from 'lucide-react'
import './Home.css'

interface HomeProps {
  onPageChange: (page: number) => void
}

const Home: React.FC<HomeProps> = ({ onPageChange }) => {
  const socialLinks = [
    { icon: Mail, label: 'Email', url: 'mailto:satyam@example.com' },
    { icon: Github, label: 'GitHub', url: 'https://github.com/satyam-patel' },
    { icon: Linkedin, label: 'LinkedIn', url: 'https://linkedin.com/in/satyam-patel' }
  ]

  return (
    <div className="home-container">
      <motion.div
        className="home-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="profile-section">
          <motion.div
            className="profile-image-container"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="profile-image">
              <div className="image-placeholder">
                <span>SP</span>
              </div>
            </div>
            <div className="image-border"></div>
          </motion.div>

          <div className="profile-info">
            <h1 className="profile-name">Satyam Patel</h1>
            <h2 className="profile-title">Full Stack Developer | AI Enthusiast</h2>
            <p className="profile-tagline">"Turning ideas into immersive experiences."</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="home-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="bio-section">
          <h3 className="section-title">Welcome to my digital garden! 🌸</h3>
          <p className="bio-text">
            I'm a passionate Full Stack Developer with a deep love for creating innovative 
            solutions that bridge the gap between technology and human experience. 
            My journey in tech has been driven by curiosity and a desire to build 
            meaningful applications that make a difference.
          </p>
          <p className="bio-text">
            Currently pursuing B.Tech Honors in Data Science at CSVTU, I specialize 
            in web development, AI, and computer vision. When I'm not coding, you'll 
            find me exploring new technologies, contributing to open-source projects, 
            or sharing knowledge with the developer community.
          </p>
        </div>

        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-number">3+</span>
            <span className="stat-label">Years Experience</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">20+</span>
            <span className="stat-label">Projects Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">5+</span>
            <span className="stat-label">Technologies</span>
          </div>
        </div>

        <div className="action-buttons">
          <motion.button
            className="btn btn-primary"
            onClick={() => onPageChange(3)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download size={18} />
            View Resume
          </motion.button>
          
          <motion.button
            className="btn btn-secondary"
            onClick={() => onPageChange(4)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Projects
          </motion.button>
        </div>

        <div className="social-links">
          {socialLinks.map((link, index) => (
            <motion.a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <link.icon size={20} />
              <span>{link.label}</span>
            </motion.a>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default Home




