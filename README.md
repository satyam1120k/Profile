# 🌸 3D Anime Portfolio - Satyam Patel

A stunning, interactive 3D animated portfolio website with anime aesthetics, featuring a cherry blossom garden scene and an animated notebook interface.

## 🌐 Live Demo

**[View Live Portfolio](https://samir1120k.github.io/Profile/)** ✨

Experience the interactive 3D portfolio with cherry blossoms, animated notebook, and smooth transitions.

## ✨ Features

### 🎨 Visual Design

- **Anime-inspired aesthetics** with soft pinks, greens, and whites
- **Cherry blossom garden** with falling petals and ambient lighting
- **Bloom lighting effects** and soft fog for dreamy atmosphere
- **Responsive design** for desktop and mobile devices

### 📖 Interactive Notebook

- **3D notebook** with realistic page-turning animations
- **7 portfolio sections** with smooth transitions:
  - Table of Contents
  - Home (Profile & Bio)
  - About Me (Story & Education)
  - Resume (Timeline & Download CV)
  - Projects (3D Cards with Live Demos)
  - Skills (Animated Progress Bars)
  - Contact (Form & Social Links)

### 🎵 Audio & Effects

- **Ambient soundtrack** with gentle background music
- **Sound effects** for page turning and interactions
- **Smooth scroll-based animations** and camera transitions

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/samir1120k/Profile.git
   cd Profile
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Three.js** - 3D graphics
- **React Three Fiber** - React renderer for Three.js
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Vite** - Build tool

## 📁 Project Structure

```
src/
├── components/
│   ├── sections/          # Portfolio sections
│   │   ├── TableOfContents.tsx
│   │   ├── Home.tsx
│   │   ├── About.tsx
│   │   ├── Resume.tsx
│   │   ├── Projects.tsx
│   │   ├── Skills.tsx
│   │   └── Contact.tsx
│   ├── CherryBlossomGarden.tsx
│   ├── Notebook.tsx
│   ├── PortfolioContent.tsx
│   ├── AudioManager.tsx
│   └── LoadingScreen.tsx
├── App.tsx
├── main.tsx
└── index.css
```

## 🎯 Portfolio Content

### 👤 Home

- **Name**: Satyam Patel
- **Title**: Full Stack Developer | AI Enthusiast
- **Tagline**: "Turning ideas into immersive experiences."
- **Quick stats** and social links

### 📘 About

- **Education**: B.Tech Honors in Data Science, CSVTU
- **Interests**: Web Dev, AI, Computer Vision
- **Quote**: "Creativity begins where comfort ends."

### 📄 Resume

- **Education timeline**
- **Experience timeline**
- **Download CV** functionality
- **Key achievements**

### 🛠️ Projects

- **Weather Software**
- **Catalog App (Flutter)**
- **AI-Based BPPV Pose Guide**
- **Drone Detection System**
- **E-Commerce Platform**
- **Portfolio Website**

### 💡 Skills

- **Languages**: Python, C++, Dart, JavaScript
- **Frameworks**: React, Flutter, Node.js
- **Tools**: OpenCV, MediaPipe, Firebase, Git
- **Soft skills**: Teamwork, Problem Solving, Research

### 📬 Contact

- **Email**: satyam@example.com
- **Social media** links
- **Contact form** with validation

## 🎨 Customization

### Colors

The portfolio uses CSS custom properties for easy color customization:

```css
:root {
  --primary-pink: #ffb3d9;
  --secondary-pink: #ff8cc6;
  --soft-green: #a8e6cf;
  --light-green: #dcedc1;
  --pure-white: #ffffff;
  --soft-white: #f8f9fa;
  --dark-text: #2c3e50;
  --accent-purple: #e8b4cb;
}
```

### Content

Update the content in each section component to personalize your portfolio:

1. **Personal Information**: Update `src/components/sections/Home.tsx`
2. **About Section**: Modify `src/components/sections/About.tsx`
3. **Resume**: Edit `src/components/sections/Resume.tsx`
4. **Projects**: Update `src/components/sections/Projects.tsx`
5. **Skills**: Modify `src/components/sections/Skills.tsx`
6. **Contact**: Update `src/components/sections/Contact.tsx`

## 🚀 Deployment

### GitHub Pages (Recommended)

This portfolio is optimized for GitHub Pages deployment:

1. **Build the project**

   ```bash
   npm run build
   ```

2. **Enable GitHub Pages**

   - Go to your repository Settings
   - Navigate to Pages section
   - Select "Deploy from a branch"
   - Choose `gh-pages` branch or `main` branch with `/docs` folder
   - Set source to `/docs` or `/dist`

3. **Configure base path** (if needed)

   - Update `vite.config.ts` with your repository name:

   ```typescript
   export default defineConfig({
     base: "/Profile/",
     // ... other config
   });
   ```

4. **Deploy automatically**
   - Set up GitHub Actions for automatic deployment
   - Or manually push the built files to the deployment branch

### Alternative Deployment Options

#### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`

#### Deploy to Netlify

1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify

## 🎮 Controls

- **Mouse/Touch**: Navigate through 3D scene
- **Scroll**: Zoom in/out of notebook
- **Click**: Interact with notebook pages
- **Navigation**: Use sidebar buttons to jump to sections

## 🌟 Features in Detail

### 3D Scene

- **Cherry blossom trees** with animated foliage
- **Falling petals** with physics simulation
- **Grass ground** with soft green texture
- **Ambient lighting** with bloom effects
- **Camera controls** for immersive experience

### Notebook Interface

- **Realistic 3D book** with spine and pages
- **Page turning animations** with spring physics
- **Interactive pages** with hover effects
- **Sound effects** for page transitions

### Responsive Design

- **Mobile-optimized** layout and controls
- **Touch gestures** for mobile devices
- **Adaptive 3D scene** for different screen sizes
- **Performance optimization** for smooth animations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Three.js** for 3D graphics
- **Framer Motion** for smooth animations
- **Lucide** for beautiful icons
- **Anime aesthetics** for design inspiration

## 📞 Contact

- **Email**: satyam@example.com
- **GitHub**: [github.com/samir1120k](https://github.com/samir1120k)
- **LinkedIn**: [linkedin.com/in/samir1120k](https://linkedin.com/in/samir1120k)

---

**Ready to deploy?** Check out the [GitHub Pages deployment guide](#github-pages-recommended) above! 🚀

Made with ❤️ and lots of cherry blossoms 🌸
