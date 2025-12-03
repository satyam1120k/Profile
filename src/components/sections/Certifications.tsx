import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, ExternalLink, X } from "lucide-react";
import "./Certifications.css";

interface CertificationsProps {
    onPageChange: (page: number) => void;
}

const Certifications: React.FC<CertificationsProps> = () => {
    const [selectedCert, setSelectedCert] = useState<string | null>(null);
    const certifications = [
        {
            title: "Computer Vision Certificate",
            issuer: "Professional Certification",
            date: "2024",
            image: "certification/cv.jpg",
            link: "https://drive.google.com/drive/u/2/folders/14tP5yMJG44PIPysOCA5A7tOErMFhV7Y3",
        },
        {
            title: "Management Information Systems",
            issuer: "Professional Certification",
            date: "2024",
            image: "certification/mis.jpg",
            link: "https://drive.google.com/drive/u/2/folders/14tP5yMJG44PIPysOCA5A7tOErMFhV7Y3",
        },
        {
            title: "Node.js Certification",
            issuer: "Professional Certification",
            date: "2024",
            image: "certification/node.png",
            link: "https://drive.google.com/drive/u/2/folders/14tP5yMJG44PIPysOCA5A7tOErMFhV7Y3",
        },
        {
            title: "Appreciation Certificate",
            issuer: "Professional Recognition",
            date: "2024",
            image: "certification/satyam Appriciation.jpg",
            link: "https://drive.google.com/drive/u/2/folders/14tP5yMJG44PIPysOCA5A7tOErMFhV7Y3",
        },
        {
            title: "Professional Certificate",
            issuer: "Certification Authority",
            date: "2024",
            image: "certification/satyam certificate.jpg",
            link: "https://drive.google.com/drive/u/2/folders/14tP5yMJG44PIPysOCA5A7tOErMFhV7Y3",
        },
    ];

    return (
        <div className="certifications-container">
            <motion.div
                className="certifications-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1 className="certifications-title">Courses & Certifications</h1>
                <p className="certifications-subtitle">Continuous Learning & Growth</p>
            </motion.div>

            <motion.div
                className="certifications-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
            >
                {certifications.map((cert, index) => (
                    <motion.div
                        key={index}
                        className="certification-card"
                        whileHover={{ scale: 1.03 }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="cert-image-container">
                            <img
                                src={cert.image}
                                alt={cert.title}
                                className="cert-image"
                                onClick={() => setSelectedCert(cert.image)}
                                style={{ cursor: 'pointer' }}
                            />
                        </div>
                        <div className="cert-content">
                            <h3 className="cert-title">{cert.title}</h3>
                            <div className="cert-meta">
                                <span className="cert-issuer">{cert.issuer}</span>
                                <span className="cert-date">{cert.date}</span>
                            </div>
                            <a
                                href={cert.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cert-link"
                            >
                                <ExternalLink size={16} />
                                View Certificate
                            </a>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedCert && (
                    <motion.div
                        className="cert-lightbox"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedCert(null)}
                    >
                        <motion.div
                            className="lightbox-content"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="lightbox-close"
                                onClick={() => setSelectedCert(null)}
                            >
                                <X size={24} />
                            </button>
                            <img src={selectedCert} alt="Certificate" className="lightbox-image" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Certifications;
