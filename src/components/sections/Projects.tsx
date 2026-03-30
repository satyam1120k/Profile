import React from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Github,
  Play,
  Code,
  Smartphone,
  Brain,
  Eye,
} from "lucide-react";
import "./Projects.css";

interface ProjectsProps {
  onPageChange: (page: number) => void;
}

const Projects: React.FC<ProjectsProps> = ({ onPageChange }) => {
  const projects = [
    {
      title: "EHR Software",
      description:
        "A comprehensive EHR application with real-time data and a beautiful, modern UI.",
      technologies: ["React (TypeScript)", "FastAPI", "Firebase"],
      image: "🩺",
      demo: "https://satyam1120k.github.io/Meditrack_Frontend/",
      github: "https://github.com/satyam1120k/Meditrack_Frontend",
      category: "API",
    },
    {
      title: "Personal Task Manager",
      description:
        "An AI-powered task manager with real-time sync and a modern UI.",
      technologies: ["React (TypeScript)", "Google Gemini AI", "Firebase Firestore"],
      image: "📝",
      demo: "https://satyam1120k.github.io/ZenTask/",
      github: "https://github.com/satyam1120k/ZenTask",
      category: "Web App",
    },
    
    {
      title: "Vantage AI",
      description:
        "AI-powered resume analyzer that matches resumes to jobs with smart insights",
      technologies: ["Fast API", "LangChain", "React"],
      image: "🚁",
      demo: "https://satyam1120k.github.io/Vantage-AI/",
      github: "https://github.com/satyam1120k/Vantage-AI",
      category: "AI/ML",
    },
    {
      title: "UPSC-Essay-Checker",
      description: "AI-powered UPSC essay evaluator that scores and provides detailed feedback using Gemini",
      technologies: ["Fast API", "LangGraph", "React"],
      image: "🛒",
      demo: "https://satyam1120k.github.io/UPSC-Essay-Checker",
      github: "https://github.com/satyam1120k/UPSC-Essay-Checker",
      category: "API",
    },
    {
      title: "AI-Based BPPV Pose Guide",
      description:
        "Computer vision application for detecting and guiding BPPV poses",
      technologies: ["Python", "OpenCV", "MediaPipe"],
      image: "🧠",
      demo: "",
      github: "https://github.com/satyam-patel/bppv-guide",
      category: "AI/ML",
    },
    {
      title: "Portfolio Website",
      description:
        "Interactive 3D portfolio with anime aesthetics and smooth animations",
      technologies: ["React", "Three.js", "TypeScript"],
      image: "🦋",
      demo: "https://satyam1120k.github.io/Profile/",
      github: "https://github.com/satyam1120k/Profile",
      category: "Web App",
    },
  ];

  const categories = ["All", "Web App", "API", "AI/ML"];
  const [selectedCategory, setSelectedCategory] = React.useState("All");

  const filteredProjects =
    selectedCategory === "All"
      ? projects
      : projects.filter((project) => project.category === selectedCategory);

  return (
    <div className="projects-container">
      <motion.div
        className="projects-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="projects-title">Projects</h1>
        <p className="projects-subtitle">My Work & Achievements</p>
      </motion.div>

      <motion.div
        className="category-filter"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        {categories.map((category, index) => (
          <motion.button
            key={category}
            className={`filter-btn ${selectedCategory === category ? "active" : ""
              }`}
            onClick={() => setSelectedCategory(category)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
          >
            {category}
          </motion.button>
        ))}
      </motion.div>

      <motion.div
        className="projects-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        {filteredProjects.map((project, index) => (
          <motion.div
            key={index}
            className="project-card"
            whileHover={{
              scale: 1.02,
              y: -5,
              rotateY: 5,
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
          >
            <div className="project-image">
              <span className="project-emoji">{project.image}</span>
              <div className="project-overlay">
                <div className="project-links">
                  <motion.a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-link demo"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Play size={16} />
                    Demo
                  </motion.a>
                  <motion.a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-link github"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Github size={16} />
                    Code
                  </motion.a>
                </div>
              </div>
            </div>

            <div className="project-content">
              <div className="project-category">{project.category}</div>
              <h3 className="project-title">{project.title}</h3>
              <p className="project-description">{project.description}</p>

              <div className="project-technologies">
                {project.technologies.map((tech, techIndex) => (
                  <span key={techIndex} className="tech-tag">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="projects-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <p className="footer-text">
          Want to see more? Check out my{" "}
          <a
            href="https://github.com/satyam1120k"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>{" "}
          for additional projects!
        </p>
      </motion.div>
    </div>
  );
};

export default Projects;
