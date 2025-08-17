import React from 'react'
import './LoadingScreen.css'

const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="cherry-blossom-container">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`petal petal-${i + 1}`} />
          ))}
        </div>
        
        <div className="loading-text">
          <h1 className="loading-title">Satyam Patel</h1>
          <p className="loading-subtitle">Loading your journey...</p>
        </div>
        
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        
        <div className="loading-quote">
          "We all live inside our own fantasies."
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen

