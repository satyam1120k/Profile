import React from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Database,
  Smartphone,
  Globe,
  Trophy,
  ExternalLink,
  Star,
  Code2,
  Award,
} from "lucide-react";
import "./Skills.css";

interface SkillsProps {
  onPageChange: (page: number) => void;
}

const Skills: React.FC<SkillsProps> = ({ onPageChange }) => {
  const expertiseSections = [
    {
      title: "Artificial Intelligence & Machine Learning",
      icon: Brain,
      emoji: "🤖",
      accent: "#f472b6",
      points: [
        "Deep Learning (ANN, CNNs, RNNs, Transformers)",
        "Machine Learning Algorithms",
        "Model Training, Validation & Optimization",
        "Optimization Algorithms for hyper-parameter tuning",
      ],
    },
    {
      title: "Computer Vision",
      icon: Smartphone,
      emoji: "🎥",
      accent: "#60a5fa",
      points: [
        "Pose Estimation (MediaPipe, OpenCV)",
        "Image Segmentation & Classification",
        "Object Detection & Tracking",
        "Feature Engineering & Preprocessing",
      ],
    },
    {
      title: "Data Science & Analytics",
      icon: Database,
      emoji: "🧠",
      accent: "#34d399",
      points: [
        "Data Cleaning & Feature Engineering",
        "Statistical Analysis & Hypothesis Testing",
        "Exploratory Data Analysis (EDA)",
        "Data Modeling & Pipeline Design",
      ],
    },
    {
      title: "Data Structures & Algorithm Design (DSA & ADA)",
      icon: Code2,
      emoji: "🧮",
      accent: "#facc15",
      points: [
        "Core Data Structures (arrays, lists, trees, graphs, heaps, hashmaps)",
        "Algorithm Design: divide & conquer, dynamic programming, greedy, backtracking",
        "Competitive problem solving — LeetCode & contest-style practice",
        "Applying algorithms to ML/data pipelines & system performance",
      ],
    },
    {
      title: "Tools & Frameworks",
      icon: Globe,
      emoji: "🛠",
      accent: "#a78bfa",
      points: [
        "Languages: Python, C++, SQL",
        "Libraries: TensorFlow, PyTorch, OpenCV, MediaPipe",
        "Tools: Git, Docker, Jupyter, VS Code",
        "Scientific Stack: NumPy, SciPy, Pandas, Matplotlib",
        "Frontend Tools: React, TypeScript (basic)",
      ],
    },
    {
      title: "Engineering Practices",
      icon: Award,
      emoji: "📦",
      accent: "#fb7185",
      points: [
        "Research-oriented development & reproducible experiments",
        "Experimental design and evaluation metrics",
        "Clear documentation & reporting",
        "System design for AI workflows",
      ],
    },
  ];

  const codingProfiles = [
    {
      platform: "LeetCode",
      // username: "samir1120k",
      stats: [
        { label: "Rating", value: "1486", icon: Star },
        { label: "Problems Solved", value: "450+", icon: Code2 },
      ],
      color: "#FFA116",
      url: "https://leetcode.com/u/satyam1120k",
      icon: "🏆",
      description: "Algorithm & Data Structures",
      logo: "/logo/leetcode_logo.png",
    },
    {
      platform: "Codeforces",
      // username: "samir1120k",
      stats: [
        { label: "Rating", value: "1090", icon: Star },
        { label: "Problems Solved", value: "20+", icon: Code2 },
      ],
      color: "#1F8ACB",
      url: "https://codeforces.com/profile/satyam1120k",
      icon: "⚡",
      description: "Competitive Programming",
      logo: "/logo/codeforces_logo.png",
    },
  ];

  return (
    <div className="skills-container">
      <motion.div
        className="skills-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="skills-title">Skills</h1>
        <p className="skills-subtitle">My Technical Expertise</p>
      </motion.div>

      <motion.div
        className="skills-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="expertise-grid">
          {expertiseSections.map((section, index) => (
            <motion.div
              key={section.title}
              className="expertise-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <div className="expertise-card-header">
                <span
                  className="expertise-emoji"
                  style={{ color: section.accent }}
                >
                  {section.emoji}
                </span>
                <section.icon size={24} style={{ color: section.accent }} />
                <h2>{section.title}</h2>
              </div>
              <ul className="expertise-list">
                {section.points.map((point, pointIndex) => (
                  <li key={pointIndex}>
                    <span
                      className="bullet-dot"
                      style={{ backgroundColor: section.accent }}
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Coding Profiles Section */}
        <motion.div
          className="coding-profiles-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <div className="section-header">
            <Trophy size={28} />
            <h2 className="section-title">Coding Profiles</h2>
            <p className="section-subtitle">
              My Competitive Programming Journey
            </p>
          </div>

          <div className="profiles-grid">
            {codingProfiles.map((profile, index) => (
              <motion.a
                key={index}
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="profile-card"
                whileHover={{ scale: 1.05, y: -8 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + index * 0.1 }}
              >
                <div className="profile-header">
                  <div
                    className="profile-icon"
                    style={{ backgroundColor: profile.color }}
                  >
                    <img
                      src={profile.logo}
                      alt={`${profile.platform} logo`}
                      className="platform-logo"
                    />
                  </div>
                  <div className="profile-info">
                    <h3 className="profile-platform">{profile.platform}</h3>
                    <p className="profile-description">{profile.description}</p>
                  </div>
                  <ExternalLink size={18} className="external-link" />
                </div>

                <div className="profile-stats">
                  {profile.stats.map((stat, statIndex) => (
                    <div key={statIndex} className="stat-item">
                      <div className="stat-icon">
                        <stat.icon size={18} />
                      </div>
                      <div className="stat-content">
                        <span className="stat-label">{stat.label}</span>
                        <span className="stat-value">{stat.value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="profile-footer">
                  {/* <span className="profile-username">@{profile.username}</span> */}
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Skills;
