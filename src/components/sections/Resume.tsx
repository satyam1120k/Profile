import React from "react";
import { motion } from "framer-motion";
import {
  Download,
  Calendar,
  MapPin,
  GraduationCap,
  Briefcase,
  Award,
} from "lucide-react";
import "./Resume.css";

interface ResumeProps {
  onPageChange: (page: number) => void;
}

const Resume: React.FC<ResumeProps> = ({ onPageChange }) => {
  const education = [
    {
      degree: "B.Tech Honors in Data Science",
      institution: "CSVTU",
      period: "2022 - Present",
      location: "India",
      description:
        "Focus on data science, machine learning, and artificial intelligence",
      cgpa: "8.3/10",
    },
    {
      degree: "Higher Secondary",
      institution: "K.V.N Public School",
      period: "2019 - 2021",
      location: "India",
      description: "Focus on science and mathematics",
      percentage: "71.8%",
    },
    {
      degree: "Secondary",
      institution: "J.D.S Public School",
      period: "2017 - 2019",
      location: "India",
      description: "Focus on science and mathematics and social studies",
      percentage: "70.0%",
    },
  ];

  const experience = [
    // {
    //   title: "Frontend Developer",
    //   company: "-----------",
    //   period: "------------",
    //   location: "------------",
    //   description:
    //     "Building web applications and mobile apps using modern technologies",
    // },
    {
      title: "Ex Research Intern",
      company: "IIT BHU ,Varanasi",
      period: "Jan 2025 - June 2025",
      location: "Varanasi, India",
      description: "Working on computer vision and machine learning projects",
    },
  ];

  const achievements = [
    "Developed 20+ web applications and mobile apps",
    "Specialized in AI and computer vision technologies",
    "Contributed to open-source projects",
    "Led team projects in university",
  ];

  const handleDownloadCV = () => {
    // Download the PDF resume
    const pdfPath = "/document/Agentic_ai.pdf";
    const link = document.createElement("a");
    link.href = pdfPath;
    link.download = "Satyam_Patel_Resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="resume-container">
      <motion.div
        className="resume-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="resume-title">Resume</h1>
        <p className="resume-subtitle"> Experience & My Education </p>

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
                transition={{ delay: 0.5 + index * 0.1 }}
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
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <div className="timeline-info">
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
                    </div>
                    <div className="timeline-grades">
                      <div className="grade-item">
                        <span className="grade-label">
                          {item.cgpa ? "CGPA" : "Percentage"}
                        </span>
                        <span className="grade-value">
                          {item.cgpa || item.percentage}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="timeline-description">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* <div className="achievements-section">
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
        </div> */}
      </motion.div>
    </div>
  );
};

export default Resume;
