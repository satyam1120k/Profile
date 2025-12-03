import React from "react";
import { motion } from "framer-motion";
import {
    Calendar,
    MapPin,
    GraduationCap,
    Briefcase,
} from "lucide-react";
import "./Experience.css";

interface ExperienceProps {
    onPageChange: (page: number) => void;
}

const Experience: React.FC<ExperienceProps> = ({ onPageChange }) => {
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
        {
            title: "Ex Research Intern",
            company: "IIT BHU ,Varanasi",
            period: "Jan 2025 - June 2025",
            location: "Varanasi, India",
            description: "Working on computer vision and machine learning projects",
        },
    ];

    return (
        <div className="experience-container">
            <motion.div
                className="experience-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1 className="experience-title">Experience & Education</h1>
                <p className="experience-subtitle"> My Professional Journey </p>
            </motion.div>

            <motion.div
                className="experience-content"
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
            </motion.div>
        </div>
    );
};

export default Experience;
