/**
 * Every piece of portfolio content shown in the 3D world.
 * Edit this file to update what the billboards, TVs and screens display.
 */

const BASE = import.meta.env.BASE_URL

export const profile = {
  name: 'Satyam Patel',
  role: 'Data Science & AI Engineer',
  photo: `${BASE}logo/profile_photo.jpg`,
  resume: `${BASE}python resume.pdf`,
  email: 'satyam1120k@gmail.com',
  github: 'https://github.com/satyam1120k',
  linkedin: 'https://www.linkedin.com/in/satyam1120k',
  location: 'India',
}

export const homeBio = [
  'I am a Data Science & AI Engineer specializing in computer vision, machine learning, and real-time intelligent systems. I build scalable, production-ready solutions that integrate deep learning, optimization, and modern software engineering practices.',
  'My work spans healthcare automation, UAV optimization, sensor-driven intelligence, and full-stack AI applications — from research and model development to deployment.',
]

export const competencies = [
  'Data Science',
  'Computer Vision',
  'Deep Learning',
  'ML Engineering',
  'Agentic AI',
  'System Design',
]

export const about = [
  'I am a Data Science and AI Engineer focused on building real-time, high-impact intelligent systems that solve meaningful problems. I enjoy working in fast-paced environments where experimentation, innovation, and rapid execution matter.',
  'My expertise spans computer vision, deep learning, machine learning, optimization algorithms, and applied AI engineering. I have built systems for real-time pose estimation, medical AI guidance, UAV optimization using Genetic Algorithms, and federated learning applications. These projects reflect my ability to move quickly from research and prototyping to functional, deployable solutions.',
  'During my research internship at IIT (BHU), I developed an AI-driven BPPV therapy guidance system and an optimization framework that achieved significant performance improvements over traditional methods. I bring strong analytical skills, problem-solving ability, and a hands-on engineering mindset to every project.',
  'I thrive in roles where I can take ownership, iterate fast, solve complex challenges, and contribute directly to product innovation. My goal is to work with teams that value speed, clarity, and building intelligent systems that create real-world impact.',
]

export const expertise = [
  {
    title: 'Artificial Intelligence & Machine Learning',
    emoji: '🤖',
    accent: '#f472b6',
    points: [
      'Deep Learning (ANN, CNNs, RNNs, Transformers)',
      'Machine Learning Algorithms',
      'Model Training, Validation & Optimization',
      'Optimization Algorithms for hyper-parameter tuning',
    ],
  },
  {
    title: 'Computer Vision',
    emoji: '🎥',
    accent: '#60a5fa',
    points: [
      'Pose Estimation (MediaPipe, OpenCV)',
      'Image Segmentation & Classification',
      'Object Detection & Tracking',
      'Feature Engineering & Preprocessing',
    ],
  },
  {
    title: 'Data Science & Analytics',
    emoji: '🧠',
    accent: '#34d399',
    points: [
      'Data Cleaning & Feature Engineering',
      'Statistical Analysis & Hypothesis Testing',
      'Exploratory Data Analysis (EDA)',
      'Data Modeling & Pipeline Design',
    ],
  },
  {
    title: 'Data Structures & Algorithm Design',
    emoji: '🧮',
    accent: '#facc15',
    points: [
      'Core Data Structures (arrays, lists, trees, graphs, heaps, hashmaps)',
      'Algorithm Design: divide & conquer, dynamic programming, greedy, backtracking',
      'Competitive problem solving — LeetCode & contest-style practice',
      'Applying algorithms to ML/data pipelines & system performance',
    ],
  },
  {
    title: 'Tools & Frameworks',
    emoji: '🛠',
    accent: '#a78bfa',
    points: [
      'Languages: Python, C++, SQL',
      'Libraries: TensorFlow, PyTorch, OpenCV, MediaPipe',
      'Tools: Git, Docker, Jupyter, VS Code',
      'Scientific Stack: NumPy, SciPy, Pandas, Matplotlib',
      'Frontend Tools: React, TypeScript (basic)',
    ],
  },
  {
    title: 'Engineering Practices',
    emoji: '📦',
    accent: '#fb7185',
    points: [
      'Research-oriented development & reproducible experiments',
      'Experimental design and evaluation metrics',
      'Clear documentation & reporting',
      'System design for AI workflows',
    ],
  },
]

export const codingProfiles = [
  {
    platform: 'LeetCode',
    rating: '1556',
    solved: '85+',
    description: 'Algorithms & Data Structures',
    color: '#FFA116',
    url: 'https://leetcode.com/u/satyam1120k',
    logo: `${BASE}logo/leetcode_logo.png`,
  },
  {
    platform: 'Codeforces',
    rating: '1092',
    solved: '20+',
    description: 'Competitive Programming',
    color: '#1F8ACB',
    url: 'https://codeforces.com/profile/satyam1120k',
    logo: `${BASE}logo/codeforces_logo.png`,
  },
]

export interface Project {
  title: string
  description: string
  technologies: string[]
  icon: string
  demo: string
  github: string
  category: string
  colors: [string, string]
}

export const projects: Project[] = [
  {
    title: 'EHR Software',
    description: 'A comprehensive EHR application with real-time data and a beautiful, modern UI.',
    technologies: ['React (TypeScript)', 'FastAPI', 'Firebase'],
    icon: '🩺',
    demo: 'https://satyam1120k.github.io/Meditrack_Frontend/',
    github: 'https://github.com/satyam1120k/Meditrack_Frontend',
    category: 'API',
    colors: ['#0ea5e9', '#6366f1'],
  },
  {
    title: 'Personal Task Manager',
    description: 'An AI-powered task manager with real-time sync and a modern UI.',
    technologies: ['React (TypeScript)', 'Google Gemini AI', 'Firebase Firestore'],
    icon: '📝',
    demo: 'https://satyam1120k.github.io/ZenTask/',
    github: 'https://github.com/satyam1120k/ZenTask',
    category: 'Web App',
    colors: ['#22c55e', '#0d9488'],
  },
  {
    title: 'Vantage AI',
    description: 'AI-powered resume analyzer that matches resumes to jobs with smart insights.',
    technologies: ['FastAPI', 'LangChain', 'React'],
    icon: '🎯',
    demo: 'https://satyam1120k.github.io/Vantage-AI/',
    github: 'https://github.com/satyam1120k/Vantage-AI',
    category: 'AI/ML',
    colors: ['#a855f7', '#ec4899'],
  },
  {
    title: 'UPSC Essay Checker',
    description: 'AI-powered UPSC essay evaluator that scores and gives detailed feedback using Gemini.',
    technologies: ['FastAPI', 'LangGraph', 'React'],
    icon: '✍️',
    demo: 'https://satyam1120k.github.io/UPSC-Essay-Checker',
    github: 'https://github.com/satyam1120k/UPSC-Essay-Checker',
    category: 'API',
    colors: ['#f97316', '#e11d48'],
  },
  {
    title: 'AI-Based BPPV Pose Guide',
    description: 'Computer vision application for detecting and guiding BPPV therapy poses.',
    technologies: ['Python', 'OpenCV', 'MediaPipe'],
    icon: '🧠',
    demo: '',
    github: 'https://github.com/satyam-patel/bppv-guide',
    category: 'AI/ML',
    colors: ['#14b8a6', '#2563eb'],
  },
  {
    title: 'Portfolio Website',
    description: 'This interactive 3D portfolio world, with anime aesthetics and smooth animations.',
    technologies: ['React', 'Three.js', 'TypeScript'],
    icon: '🦋',
    demo: 'https://satyam1120k.github.io/Profile/',
    github: 'https://github.com/satyam1120k/Profile',
    category: 'Web App',
    colors: ['#ec4899', '#7c3aed'],
  },
]

export const experience = [
  {
    title: 'Ex Research Intern',
    company: 'IIT BHU, Varanasi',
    period: 'Jan 2025 – June 2025',
    location: 'Varanasi, India',
    description: 'Working on computer vision and machine learning projects.',
  },
]

export const education = [
  {
    degree: 'B.Tech Honors in Data Science',
    institution: 'CSVTU',
    period: '2022 – Present',
    location: 'India',
    description: 'Focus on data science, machine learning, and artificial intelligence.',
    score: 'CGPA 8.3/10',
  },
  {
    degree: 'Higher Secondary',
    institution: 'K.V.N Public School',
    period: '2019 – 2021',
    location: 'India',
    description: 'Focus on science and mathematics.',
    score: '71.8%',
  },
  {
    degree: 'Secondary',
    institution: 'J.D.S Public School',
    period: '2017 – 2019',
    location: 'India',
    description: 'Focus on science, mathematics and social studies.',
    score: '70.0%',
  },
]

export const certifications = [
  { title: 'Computer Vision Certificate', issuer: 'Professional Certification', date: '2024', image: `${BASE}certification/cv.jpg` },
  { title: 'Management Information Systems', issuer: 'Professional Certification', date: '2024', image: `${BASE}certification/mis.jpg` },
  { title: 'Node.js Certification', issuer: 'Professional Certification', date: '2024', image: `${BASE}certification/node.png` },
  { title: 'Appreciation Certificate', issuer: 'Professional Recognition', date: '2024', image: `${BASE}certification/satyam Appriciation.jpg` },
  { title: 'Professional Certificate', issuer: 'Certification Authority', date: '2024', image: `${BASE}certification/satyam certificate.jpg` },
]

export const contactLinks = [
  { icon: '📧', label: 'Email', value: profile.email, url: `mailto:${profile.email}` },
  { icon: '💼', label: 'LinkedIn', value: 'linkedin.com/in/satyam1120k', url: profile.linkedin },
  { icon: '🐙', label: 'GitHub', value: 'github.com/satyam1120k', url: profile.github },
  { icon: '🏆', label: 'LeetCode', value: 'leetcode.com/u/satyam1120k', url: codingProfiles[0].url },
  { icon: '📄', label: 'Résumé', value: 'Download my résumé (PDF)', url: profile.resume },
]
