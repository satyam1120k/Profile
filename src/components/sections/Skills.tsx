import React from "react";
import { motion } from "framer-motion";
import {
  Code,
  Brain,
  Database,
  Smartphone,
  Globe,
  Trophy,
  ExternalLink,
  Star,
  Target,
  Zap,
  Code2,
  Award,
  TrendingUp,
} from "lucide-react";
import "./Skills.css";

interface SkillsProps {
  onPageChange: (page: number) => void;
}

const Skills: React.FC<SkillsProps> = ({ onPageChange }) => {
  const skillCategories = [
    {
      title: "Programming Languages",
      icon: Code,
      skills: [
        { name: "Python", level: 80, color: "#3776AB" },
        { name: "C++", level: 80, color: "#00599C" },
        { name: "SQL", level: 80, color: "#00B4AB" },
        { name: "JavaScript", level: 40, color: "#F7DF1E" },
      ],
    },
    {
      title: "Frameworks & Libraries",
      icon: Globe,
      skills: [
        { name: "React", level: 30, color: "#61DAFB" },
        { name: "Flutter", level: 40, color: "#02569B" },
        { name: "Node.js", level: 40, color: "#339933" },
        { name: "FastAPI", level: 60, color: "#009688" },
        { name: "OpenCV", level: 75, color: "#5C3EE8" },
        { name: "NumPy", level: 85, color: "#013243" },
        { name: "Pandas", level: 80, color: "#150458" },
        { name: "Matplotlib", level: 70, color: "#d62728" },
        { name: "TensorFlow", level: 75, color: "#FF6F00" },
        { name: "PyTorch", level: 70, color: "#EE4C2C" },
        { name: "LangChain", level: 65, color: "#32a852" },
        { name: "LangGraph", level: 65, color: "#329ba8" },
      ],
    },
    {
      title: "Tools & Technologies",
      icon: Database,
      skills: [
        { name: "MediaPipe", level: 65, color: "#FF6B6B" },
        { name: "Firebase", level: 30, color: "#FFCA28" },
        { name: "Git", level: 80, color: "#F05032" },
        { name: "LangSmith", level: 60, color: "#2E86AB" },
        { name: "Docker", level: 50, color: "#2496ED" },
      ],
    },
    {
      title: "Soft Skills",
      icon: Brain,
      skills: [
        { name: "Problem Solving", level: 80, color: "#2196F3" },
        { name: "Research", level: 75, color: "#9C27B0" },
        { name: "Teamwork", level: 70, color: "#4CAF50" },
        { name: "Communication", level: 60, color: "#FF9800" },
      ],
    },
  ];

  const codingProfiles = [
    {
      platform: "LeetCode",
      username: "satyam-patel",
      stats: [
        { label: "Problems Solved", value: "350+", icon: Target },
        { label: "Rank", value: "#427,312", icon: Trophy },
      ],
      color: "#FFA116",
      url: "https://leetcode.com/u/samir1120k",
      icon: "🏆",
      description: "Algorithm & Data Structures",
      logo: "/logo/leetcode_logo.png",
    },
    {
      platform: "Codeforces",
      username: "satyam-patel",
      stats: [
        { label: "Rating", value: "1052", icon: Star },
        { label: "Problems", value: "65+", icon: Code2 },
      ],
      color: "#1F8ACB",
      url: "https://codeforces.com/profile/samir1120k",
      icon: "⚡",
      description: "Competitive Programming",
      logo: "/logo/codeforces_logo.png",
    },
    {
      platform: "AtCoder",
      username: "satyam-patel",
      stats: [
        { label: "Rating", value: "100", icon: Star },
        { label: "Rank", value: "#45,938", icon: Trophy },
      ],
      color: "#00C851",
      url: "https://atcoder.jp/users/samir1120k",
      icon: "🎯",
      description: "Japanese CP Platform",
      logo: "/logo/atcoder_logo.png",
    },
    {
      platform: "GeeksforGeeks",
      username: "satyam-patel",
      stats: [
        { label: "Rank", value: "#36", icon: Trophy },
        { label: "Problems", value: "70+", icon: Code2 },
      ],
      color: "#2F8D46",
      url: "https://www.geeksforgeeks.org/user/samir1uzfv",
      icon: "💻",
      description: "Interview Preparation",
      logo: "/logo/gfg_logo.jpeg",
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
        {skillCategories.map((category, categoryIndex) => (
          <motion.div
            key={categoryIndex}
            className="skill-category"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + categoryIndex * 0.1 }}
          >
            <div className="category-header">
              <category.icon size={24} />
              <h2 className="category-title">{category.title}</h2>
            </div>

            <div className="skills-grid">
              {category.skills.map((skill, skillIndex) => (
                <motion.div
                  key={skillIndex}
                  className="skill-item"
                  whileHover={{ scale: 1.02, y: -2 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.7 + categoryIndex * 0.1 + skillIndex * 0.05,
                  }}
                >
                  <div className="skill-header">
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-level">{skill.level}%</span>
                  </div>

                  <div className="skill-bar">
                    <motion.div
                      className="skill-progress"
                      style={{ backgroundColor: skill.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{
                        delay: 1 + categoryIndex * 0.1 + skillIndex * 0.05,
                        duration: 1,
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}

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
                  <span className="profile-username">@{profile.username}</span>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="skills-summary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
      >
        <h3 className="summary-title">What I Bring to the Table</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-icon">🚀</div>
            <h4>Fast Development</h4>
            <p>Quick prototyping and efficient coding practices</p>
          </div>
          <div className="summary-item">
            <div className="summary-icon">🎯</div>
            <h4>Problem Solving</h4>
            <p>Analytical thinking and creative solutions</p>
          </div>
          <div className="summary-item">
            <div className="summary-icon">🤝</div>
            <h4>Team Collaboration</h4>
            <p>Excellent communication and teamwork skills</p>
          </div>
          <div className="summary-item">
            <div className="summary-icon">📚</div>
            <h4>Continuous Learning</h4>
            <p>Always exploring new technologies and methodologies</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Skills;
