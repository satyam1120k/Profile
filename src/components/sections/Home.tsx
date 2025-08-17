import React from "react";
import { motion } from "framer-motion";
import { Download, Mail, Github, Linkedin } from "lucide-react";
import "./Home.css";

interface HomeProps {
  onPageChange: (page: number) => void;
}

const Home: React.FC<HomeProps> = ({ onPageChange }) => {
  const socialLinks = [
    { icon: Mail, label: "Email", url: "mailto:satyam1120k@example.com" },
    { icon: Github, label: "GitHub", url: "https://github.com/samir1120k" },
    {
      icon: Linkedin,
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/satyam-patel-8a4254279/",
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
          <motion.div
            className="profile-image-container"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="profile-image">
              <div className="image-placeholder">
                <span>SP</span>
              </div>

              {/* Glowing Bulb (SVG with animation) */}
              <motion.svg
                className="bulb-svg"
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFD93B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={{ scale: [1, 1.1, 1], opacity: [0.85, 1, 0.85] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <path d="M9 18h6" />
                <path d="M10 22h4" />
                <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" />
              </motion.svg>

              {/* </> Symbol */}
              <motion.div
                className="code-icon"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              >
                &lt;/&gt;
              </motion.div>
            </div>

            <div className="image-border"></div>
          </motion.div>

          {/* Info */}
          <div className="profile-info">
            <h1 className="profile-name">Satyam Patel</h1>
            <h2 className="profile-title">Engineer of Code & Creativity 👨‍💻</h2>
            <p className="profile-tagline">"From imagination to innovation"</p>
          </div>
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
          <h3 className="section-title">Welcome to my digital garden! 🌸</h3>
          <p className="bio-text">
            I’m Satyam Patel, a passionate Frontend Developer with a flair for
            blending creativity and technology to craft immersive, user-focused
            experiences. My journey in tech is fueled by curiosity, innovation,
            and a mission to build solutions that make a real impact.
          </p>
          <p className="bio-text">
            Currently pursuing B.Tech (Honors) in Data Science at CSVTU, I
            specialize in web development, computer vision, agentic AI systems,
            machine learning, and federated learning. Over the years, I’ve
            worked on diverse projects ranging from interactive web apps to
            advanced AI-powered healthcare tools.
          </p>
          <p className="bio-text">
            Previously, I served as a Research Intern at IIT (BHU) Varanasi for
            6 months, where I contributed to cutting-edge projects in AI-based
            healthcare guidance and UAV optimization using genetic algorithms.
            This experience honed my skills in research-driven problem solving,
            algorithm design, and real-world deployment.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-number">1+</span>
            <span className="stat-label">Years Experience</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">5+</span>
            <span className="stat-label">Projects Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">5+</span>
            <span className="stat-label">Technologies</span>
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
