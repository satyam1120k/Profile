import React from "react";
import { motion } from "framer-motion";
import "./About.css";

interface AboutProps {
  onPageChange: (page: number) => void;
}

const About: React.FC<AboutProps> = ({ onPageChange }) => {
  return (
    <div className="about-container">
      <motion.div
        className="about-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="about-title">About Me</h1>
      </motion.div>

      <motion.div
        className="about-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {/* Desktop Content */}
        <div className="professional-summary desktop-only">
          <motion.p
            className="summary-paragraph"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            I am a Data Science and AI Engineer focused on building real-time, high-impact intelligent systems that solve meaningful problems. I enjoy working in fast-paced environments where experimentation, innovation, and rapid execution matter.
          </motion.p>

          <motion.p
            className="summary-paragraph"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            My expertise spans computer vision, deep learning, machine learning, optimization algorithms, and applied AI engineering. I have built systems for real-time pose estimation, medical AI guidance, UAV optimization using Genetic Algorithms, and federated learning applications. These projects reflect my ability to move quickly from research and prototyping to functional, deployable solutions.
          </motion.p>

          <motion.p
            className="summary-paragraph"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            During my research internship at IIT (BHU), I developed an AI-driven BPPV therapy guidance system and an optimization framework that achieved significant performance improvements over traditional methods. I bring strong analytical skills, problem-solving ability, and a hands-on engineering mindset to every project.
          </motion.p>

          <motion.p
            className="summary-paragraph highlight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            I thrive in roles where I can take ownership, iterate fast, solve complex challenges, and contribute directly to product innovation. My goal is to work with teams that value speed, clarity, and building intelligent systems that create real-world impact.
          </motion.p>
        </div>

        {/* Mobile Content */}
        <div className="professional-summary mobile-only">
          <motion.p
            className="summary-paragraph"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            I am a Data Science & AI Engineer who loves building real-time, reliable AI systems. My work spans computer vision, deep learning, optimization, and applied machine intelligence. I move fast, think analytically, and enjoy taking ownership in high-growth startup environments. I've built impactful AI systems in medical guidance, UAV optimization, and federated learning, supported by research experience at IIT (BHU).
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default About;
