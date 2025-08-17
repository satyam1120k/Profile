import React from "react";
import { motion } from "framer-motion";
import { Code, Brain, Database, Smartphone, Globe, Git } from "lucide-react";
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
        { name: "Python", level: 90, color: "#3776AB" },
        { name: "C++", level: 85, color: "#00599C" },
        { name: "SQL", level: 80, color: "#00B4AB" },
        { name: "JavaScript", level: 85, color: "#F7DF1E" },
      ],
    },
    {
      title: "Frameworks & Libraries",
      icon: Globe,
      skills: [
        { name: "React", level: 30, color: "#61DAFB" },
        { name: "Flutter", level: 40, color: "#02569B" },
        { name: "Node.js", level: 50, color: "#339933" },
        { name: "OpenCV", level: 75, color: "#5C3EE8" },
      ],
    },
    {
      title: "Tools & Technologies",
      icon: Database,
      skills: [
        { name: "MediaPipe", level: 85, color: "#FF6B6B" },
        { name: "Firebase", level: 30, color: "#FFCA28" },
        { name: "Git", level: 80, color: "#F05032" },
        { name: "TensorFlow", level: 75, color: "#FF6F00" },
      ],
    },
    {
      title: "Soft Skills",
      icon: Brain,
      skills: [
        { name: "Teamwork", level: 60, color: "#4CAF50" },
        { name: "Problem Solving", level: 90, color: "#2196F3" },
        { name: "Research", level: 85, color: "#9C27B0" },
        { name: "Communication", level: 50, color: "#FF9800" },
      ],
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
      </motion.div>

      <motion.div
        className="skills-summary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
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
