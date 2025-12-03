import React from "react";
import { motion } from "framer-motion";
import { Download, Mail, Github, Linkedin, Briefcase } from "lucide-react";
import "./Home.css";

interface HomeProps {
  onPageChange: (page: number) => void;
}

const Home: React.FC<HomeProps> = ({ onPageChange }) => {
  const socialLinks = [
    { icon: Mail, label: "Email", url: "mailto:satyam1120k@example.com" },
    { icon: Github, label: "GitHub", url: "https://github.com/satyam1120k" },
    {
      icon: Linkedin,
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/satyam1120k",
    },
  ];

  return (
    <div className="home-container">
      {/* Header */}
      <motion.div
        className="home-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="profile-section">
          {/* Info */}
          <div className="profile-info">
            <h1 className="profile-name">Satyam Patel</h1>
            <h2 className="profile-title">Data Science & AI Engineer</h2>
            {/* <p className="profile-tagline">"Delivering intelligent, scalable, and high-performance AI solutions."</p> */}
          </div>

          <motion.div
            className="profile-image-container"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img
              src="logo/profile_photo.jpg"
              alt="Satyam Patel"
              className="profile-photo"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="home-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="bio-section">
          <h3 className="section-title">Professional Summary</h3>
          <p className="bio-text">
            I am an Data Science & AI Engineer specializing in computer vision,
            machine learning, and real-time intelligent systems. I build
            scalable, production-ready solutions that integrate deep learning,
            optimization, and modern software engineering practices.
          </p>
          <p className="bio-text">
            My work spans across healthcare automation, UAV optimization,
            sensor-driven intelligence, and full-stack AI applications. I focus
            on delivering measurable impact, high reliability, and end-to-end
            technical execution — from research and model development to
            deployment.
          </p>
        </div>

        {/* Core Competencies */}
        <div className="core-competencies">
          <h3 className="section-title">Core Competencies</h3>
          <div className="competencies-list">
            <span className="competency-item">Data Science</span>
            <span className="competency-separator">•</span>
            <span className="competency-item">Computer Vision</span>
            <span className="competency-separator">•</span>
            <span className="competency-item">Deep Learning</span>
            <span className="competency-separator">•</span>
            <span className="competency-item">ML Engineering</span>
            <span className="competency-separator">•</span>
            <span className="competency-item">Agentic AI</span>
            <span className="competency-separator">•</span>
            <span className="competency-item">System Design</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="action-buttons">
          <motion.button
            className="btn btn-primary"
            onClick={() => onPageChange(3)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Briefcase size={18} />
            View Projects
          </motion.button>

          <motion.button
            className="btn btn-secondary"
            onClick={() => {
              const pdfPath = "/python resume.pdf";
              const link = document.createElement("a");
              link.href = pdfPath;
              link.download = "Satyam_Patel_Resume.pdf";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download size={18} />
            View Resume
          </motion.button>

          <motion.button
            className="btn btn-secondary"
            onClick={() => onPageChange(6)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Mail size={18} />
            Contact Me
          </motion.button>
        </div>

        {/* Social Links */}
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
  );
};

export default Home;
