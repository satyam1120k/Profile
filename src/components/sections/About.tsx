import React from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Heart, Code, Brain, Users, Target } from 'lucide-react'
import './About.css'

interface AboutProps {
  onPageChange: (page: number) => void
}

const About: React.FC<AboutProps> = ({ onPageChange }) => {
  const interests = [
    { icon: Code, title: 'Web Development', description: 'Building modern web applications with cutting-edge technologies' },
    { icon: Brain, title: 'AI & Machine Learning', description: 'Exploring the frontiers of artificial intelligence and computer vision' },
    { icon: Users, title: 'Open Source', description: 'Contributing to the developer community and sharing knowledge' },
    { icon: Target, title: 'Problem Solving', description: 'Tackling complex challenges with innovative solutions' }
  ]

  return (
    <div className="about-container">
      <motion.div
        className="about-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="about-title">About Me</h1>
        <p className="about-subtitle">My Journey in Technology</p>
      </motion.div>

      <motion.div
        className="about-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="story-section">
          <h2 className="section-title">My Story</h2>
          <p className="story-text">
            Hello! I'm Satyam Patel, a passionate Full Stack Developer and AI enthusiast 
            currently pursuing B.Tech Honors in Data Science at CSVTU. My journey in 
            technology began with a simple curiosity about how things work on the internet, 
            which has evolved into a deep passion for creating meaningful digital experiences.
          </p>
          <p className="story-text">
            I believe that technology should not just solve problems, but also inspire 
            and connect people. This philosophy drives me to build applications that are 
            not only functional but also delightful to use. My approach combines technical 
            expertise with creative problem-solving, always keeping the end-user in mind.
          </p>
        </div>

        <div className="education-section">
          <h2 className="section-title">
            <GraduationCap size={24} />
            Education
          </h2>
          <div className="education-card">
            <div className="education-header">
              <h3>B.Tech Honors in Data Science</h3>
              <span className="institution">CSVTU</span>
            </div>
            <p className="education-description">
              Currently pursuing my degree with a focus on data science, machine learning, 
              and artificial intelligence. This program has provided me with a strong 
              foundation in both theoretical concepts and practical applications.
            </p>
          </div>
        </div>

        <div className="interests-section">
          <h2 className="section-title">
            <Heart size={24} />
            What I Love
          </h2>
          <div className="interests-grid">
            {interests.map((interest, index) => (
              <motion.div
                key={index}
                className="interest-card"
                whileHover={{ scale: 1.02, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="interest-icon">
                  <interest.icon size={24} />
                </div>
                <h3 className="interest-title">{interest.title}</h3>
                <p className="interest-description">{interest.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="quote-section">
          <blockquote className="inspirational-quote">
            "Creativity begins where comfort ends."
          </blockquote>
          <p className="quote-author">- My Philosophy</p>
        </div>

        <div className="values-section">
          <h2 className="section-title">My Values</h2>
          <div className="values-list">
            <div className="value-item">
              <span className="value-bullet">✦</span>
              <span>Continuous Learning - Always exploring new technologies and methodologies</span>
            </div>
            <div className="value-item">
              <span className="value-bullet">✦</span>
              <span>User-Centric Design - Building solutions that truly serve people</span>
            </div>
            <div className="value-item">
              <span className="value-bullet">✦</span>
              <span>Innovation - Pushing boundaries and thinking outside the box</span>
            </div>
            <div className="value-item">
              <span className="value-bullet">✦</span>
              <span>Collaboration - Working together to achieve greater results</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default About




