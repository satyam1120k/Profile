import React from 'react'
import { motion } from 'framer-motion'
import { Download, Calendar, MapPin, GraduationCap, Briefcase, Award } from 'lucide-react'
import './Resume.css'

interface ResumeProps {
  onPageChange: (page: number) => void
}

const Resume: React.FC<ResumeProps> = ({ onPageChange }) => {
  const education = [
    {
      degree: 'B.Tech Honors in Data Science',
      institution: 'CSVTU',
      period: '2021 - Present',
      location: 'India',
      description: 'Focus on data science, machine learning, and artificial intelligence'
    }
  ]

  const experience = [
    {
      title: 'Full Stack Developer',
      company: 'Freelance',
      period: '2022 - Present',
      location: 'Remote',
      description: 'Building web applications and mobile apps using modern technologies'
    },
    {
      title: 'AI Research Assistant',
      company: 'University Project',
      period: '2023 - Present',
      location: 'CSVTU',
      description: 'Working on computer vision and machine learning projects'
    }
  ]

  const achievements = [
    'Developed 20+ web applications and mobile apps',
    'Specialized in AI and computer vision technologies',
    'Contributed to open-source projects',
    'Led team projects in university'
  ]

  const handleDownloadCV = () => {
    // Create a simple CV download
    const cvContent = `
Satyam Patel
Full Stack Developer | AI Enthusiast

EDUCATION
B.Tech Honors in Data Science - CSVTU (2021-Present)

EXPERIENCE
Full Stack Developer - Freelance (2022-Present)
- Built 20+ web applications and mobile apps
- Specialized in React, Flutter, and AI technologies

AI Research Assistant - CSVTU (2023-Present)
- Working on computer vision and machine learning projects
- Developing innovative AI solutions

SKILLS
Languages: Python, C++, Dart, JavaScript
Frameworks: React, Flutter, Node.js
Tools: OpenCV, MediaPipe, Firebase, Git
Soft Skills: Teamwork, Problem Solving, Research

PROJECTS
- Weather Software
- Catalog App (Flutter)
- AI-Based BPPV Pose Guide
- Drone Detection System

CONTACT
Email: satyam@example.com
GitHub: github.com/satyam-patel
LinkedIn: linkedin.com/in/satyam-patel
    `
    
    const blob = new Blob([cvContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Satyam_Patel_CV.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="resume-container">
      <motion.div
        className="resume-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="resume-title">Resume</h1>
        <p className="resume-subtitle">My Education & Experience</p>
        
        <motion.button
          className="download-cv-btn"
          onClick={handleDownloadCV}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Download size={18} />
          Download CV
        </motion.button>
      </motion.div>

      <motion.div
        className="resume-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="education-section">
          <h2 className="section-title">
            <GraduationCap size={24} />
            Education
          </h2>
          <div className="timeline">
            {education.map((item, index) => (
              <motion.div
                key={index}
                className="timeline-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h3 className="timeline-title">{item.degree}</h3>
                  <div className="timeline-meta">
                    <span className="institution">{item.institution}</span>
                    <span className="period">
                      <Calendar size={14} />
                      {item.period}
                    </span>
                    <span className="location">
                      <MapPin size={14} />
                      {item.location}
                    </span>
                  </div>
                  <p className="timeline-description">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="experience-section">
          <h2 className="section-title">
            <Briefcase size={24} />
            Experience
          </h2>
          <div className="timeline">
            {experience.map((item, index) => (
              <motion.div
                key={index}
                className="timeline-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h3 className="timeline-title">{item.title}</h3>
                  <div className="timeline-meta">
                    <span className="company">{item.company}</span>
                    <span className="period">
                      <Calendar size={14} />
                      {item.period}
                    </span>
                    <span className="location">
                      <MapPin size={14} />
                      {item.location}
                    </span>
                  </div>
                  <p className="timeline-description">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="achievements-section">
          <h2 className="section-title">
            <Award size={24} />
            Key Achievements
          </h2>
          <div className="achievements-list">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                className="achievement-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
              >
                <span className="achievement-bullet">✦</span>
                <span>{achievement}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Resume




