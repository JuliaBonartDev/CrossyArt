import { useState } from 'react';
import Button from './Button';
import ImageContainer from './ImageContainer';
import './Home.css';

export default function Home() {
  const [selectedSize, setSelectedSize] = useState(null);

  const sizeOptions = [
    { size: 150, label: '150\nX\n150' },
    { size: 230, label: '230\nX\n230' },
    { size: 300, label: '300\nX\n300' }
  ];

  return (
    <div className="home">
      {/* Header */}
      <header className="header">
        <div className="header-nav">
          <Button variant="primary" size="small">History</Button>
          <Button variant="primary" size="small">Favorites</Button>
          <Button variant="primary" size="small">Read me</Button>
          <Button variant="primary" size="small">Login</Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        
        {/* Section 1: Upload Image */}
        <section className="upload-section">
          <ImageContainer>
            <p>Your image goes here</p>
          </ImageContainer>
          
          <div className="button-group">
            <Button variant="primary" size="medium">Download your image</Button>
            <Button variant="danger" size="medium">Delete</Button>
          </div>
        </section>

        {/* Section 2: Size Selection */}
        <section className="size-selection-section">
          <div className="size-options">
            {sizeOptions.map((option) => (
              <div
                key={option.size}
                className={`size-box ${selectedSize === option.size ? 'selected' : ''}`}
                onClick={() => setSelectedSize(option.size)}
              >
                <span className="size-text">{option.label}</span>
              </div>
            ))}
          </div>

          <div className="arrow-down">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path
                d="M20 5L35 20M20 5L5 20M20 5V35"
                stroke="rgba(255, 255, 255, 0.6)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <Button variant="primary" size="large">CONVERT</Button>
        </section>

        {/* Section 3: Download Pattern */}
        <section className="download-pattern-section">
          <Button variant="primary" size="medium">Download the pattern</Button>
        </section>

        {/* Section 4: Pattern Display */}
        <section className="pattern-display-section">
          <ImageContainer variant="pattern">
            <p>Your color pattern goes here</p>
          </ImageContainer>

          <div className="heart-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path
                d="M20 35C20 35 4 26 4 15C4 9.58 8.03 6 12 6C14.5 6 16.8 7.4 18 9.5C19.2 7.4 21.5 6 24 6C27.97 6 32 9.58 32 15C32 26 16 35 16 35"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <Button variant="primary" size="large">Convert to simbolic</Button>
        </section>

        {/* Delete Button */}
        <div className="final-delete">
          <Button variant="danger" size="medium">Delete</Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Create cross stitch patterns from photos and images</p>
        <p>© 2026 CrossyArt. All rights reserved</p>
        <Button variant="primary" size="small">Help Center</Button>
        <Button variant="primary" size="small">Language</Button>
      </footer>
    </div>
  );
}
