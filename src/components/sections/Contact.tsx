import React, { useState } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import {
  Mail,
  Github,
  Linkedin,
  Send,
  User,
  MessageSquare,
  Phone,
  CheckCircle,
  XCircle,
} from "lucide-react";
import "./Contact.css";

interface ContactProps {
  onPageChange: (page: number) => void;
}

const Contact: React.FC<ContactProps> = ({ onPageChange }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");

  // EmailJS configuration
  const EMAILJS_SERVICE_ID = "service_juamdms";
  const EMAILJS_TEMPLATE_ID = "template_p9l4eao";
  const EMAILJS_PUBLIC_KEY = "yeF0ZSPanlC4UmIVv";

  const socialLinks = [
    {
      icon: Mail,
      label: "Email",
      value: "satyam1120k@gmail.com",
      url: "mailto:satyam1120k@gmail.com",
      color: "#EA4335",
    },
    {
      icon: Github,
      label: "GitHub",
      value: "github.com/satyam-patel",
      url: "https://github.com/samir1120k",
      color: "#333",
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      value: "linkedin.com/in/satyam-patel",
      url: "https://linkedin.com/in/satyam-patel-8a4254279",
      color: "#0077B5",
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Initialize EmailJS
      emailjs.init(EMAILJS_PUBLIC_KEY);

      // Prepare template parameters
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        to_email: "satyam1120k@gmail.com", // Your email address
      };

      // Send email
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      console.log("Email sent successfully:", response);

      // Success
      setSubmitStatus("success");
      setStatusMessage(
        "Thank you for your message! I'll get back to you soon."
      );

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      setSubmitStatus("error");
      setStatusMessage(
        "Sorry, there was an error sending your message. Please try again or contact me directly."
      );
    } finally {
      setIsSubmitting(false);

      // Clear status message after 5 seconds
      setTimeout(() => {
        setSubmitStatus("idle");
        setStatusMessage("");
      }, 5000);
    }
  };

  return (
    <div className="contact-container">
      <motion.div
        className="contact-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="contact-title">Contact</h1>
        <p className="contact-subtitle">Let's work together!</p>
      </motion.div>

      <div className="contact-content">
        <motion.div
          className="contact-info"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h2 className="section-title">Get in Touch</h2>
          <p className="contact-description">
            I'm always open to discussing new projects, creative ideas, or
            opportunities to be part of your visions. Feel free to reach out!
          </p>

          <div className="social-links">
            {socialLinks.map((link, index) => (
              <motion.a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div
                  className="social-icon"
                  style={{ backgroundColor: link.color }}
                >
                  <link.icon size={20} />
                </div>
                <div className="social-info">
                  <span className="social-label">{link.label}</span>
                  <span className="social-value">{link.value}</span>
                </div>
              </motion.a>
            ))}
          </div>

          <div className="contact-quote">
            <blockquote>
              "The best way to predict the future is to invent it."
            </blockquote>
            <cite>- Alan Kay</cite>
          </div>
        </motion.div>

        <motion.div
          className="contact-form-container"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <h2 className="section-title">Send a Message</h2>

          {/* Status Message */}
          {submitStatus !== "idle" && (
            <motion.div
              className={`status-message ${submitStatus}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="status-icon">
                {submitStatus === "success" ? (
                  <CheckCircle size={20} />
                ) : (
                  <XCircle size={20} />
                )}
              </div>
              <span>{statusMessage}</span>
            </motion.div>
          )}

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-icon">
                <User size={18} />
              </div>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <div className="input-icon">
                <Mail size={18} />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <div className="input-icon">
                <MessageSquare size={18} />
              </div>
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <div className="input-icon">
                <MessageSquare size={18} />
              </div>
              <textarea
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleInputChange}
                rows={5}
                required
                disabled={isSubmitting}
              />
            </div>

            <motion.button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
            >
              {isSubmitting ? (
                <div className="loading-spinner" />
              ) : (
                <>
                  <Send size={18} />
                  Send Message
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
