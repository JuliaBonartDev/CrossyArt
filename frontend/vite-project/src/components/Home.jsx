import { useState, useRef } from 'react';
import Button from './Button';
import ImageContainer from './ImageContainer';
import dmcColors from '../../rgb-dmc.json';
import './Home.css';

export default function Home() {
  const [selectedSize, setSelectedSize] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [patternImageUrl, setPatternImageUrl] = useState(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const resultCanvasRef = useRef(null);

  const sizeOptions = [
    { size: 150, label: '150\nX\n150' },
    { size: 230, label: '230\nX\n230' },
    { size: 300, label: '300\nX\n300' }
  ];

  // Handler para procesar la imagen
  const handleImageLoad = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Obtener el canvas y su contexto
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Calcular el tamaño cuadrado (el lado más largo de la imagen)
        const size = Math.max(img.width, img.height);
        canvas.width = size;
        canvas.height = size;

        // Pintar fondo negro
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, size, size);

        // Centrar la imagen
        const x = (size - img.width) / 2;
        const y = (size - img.height) / 2;
        ctx.drawImage(img, x, y);

        // Convertir el canvas a imagen y mostrar
        const imageDataUrl = canvas.toDataURL();
        setProcessedImage(imageDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Handler para abrir el explorador de archivos
  const handleDownloadImageClick = () => {
    fileInputRef.current?.click();
  };

  // Handler para eliminar la imagen cargada
  const handleDeleteImage = () => {
    setProcessedImage(null);
  };

  // Función para calcular la distancia euclidiana entre dos colores RGB
  const colorDistance = (c1, c2) => {
    return Math.sqrt(
      (c1.r - c2.r) ** 2 +
      (c1.g - c2.g) ** 2 +
      (c1.b - c2.b) ** 2
    );
  };

  // Función para encontrar el color DMC más cercano a un color RGB
  const findClosestDMC = (rgb) => {
    let minDist = Infinity;
    let closest = null;

    for (const dmc of dmcColors) {
      const dmcRgb = { r: dmc.r, g: dmc.g, b: dmc.b };
      const dist = colorDistance(rgb, dmcRgb);
      
      if (dist < minDist) {
        minDist = dist;
        closest = dmc;
      }
    }

    return closest;
  };

  // Función para procesar la imagen en un patrón de cuadrícula
  const processImageToPattern = () => {
    // Validar que se ha seleccionado un tamaño
    if (!selectedSize) {
      alert('Por favor, selecciona un tamaño de patrón antes de convertir.');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const gridSize = selectedSize;
    const squareSize = canvas.width / gridSize;
    const colorGrid = [];
    const dmcGrid = [];

    // Recorrer la cuadrícula
    for (let y = 0; y < gridSize; y++) {
      const colorRow = [];
      const dmcRow = [];
      
      for (let x = 0; x < gridSize; x++) {
        // Obtener los datos de píxeles del cuadrado actual
        const imgData = ctx.getImageData(
          x * squareSize,
          y * squareSize,
          squareSize,
          squareSize
        );

        // Calcular el color promedio del cuadrado
        let r = 0, g = 0, b = 0;
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }

        const total = data.length / 4;
        r = Math.round(r / total);
        g = Math.round(g / total);
        b = Math.round(b / total);

        const avgColor = { r, g, b };

        // Encontrar el color DMC más cercano
        const closestDMC = findClosestDMC(avgColor);

        // Guardar colores originales y DMC
        colorRow.push(avgColor);
        dmcRow.push(closestDMC);
      }
      
      colorGrid.push(colorRow);
      dmcGrid.push(dmcRow);
    }

    // Guardar el patrón de colores en el estado
    // setGridPattern(dmcGrid);

    // Crear un canvas de resultado para dibujar el patrón final
    const resultCanvas = resultCanvasRef.current;
    resultCanvas.width = canvas.width;
    resultCanvas.height = canvas.height;
    const resultCtx = resultCanvas.getContext('2d');

    // Dibujar el patrón final con colores DMC
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const dmc = dmcGrid[y][x];
        
        // Usar el color hex del DMC (agregar # si no existe)
        const hexColor = dmc.hex.startsWith('#') ? dmc.hex : '#' + dmc.hex;
        resultCtx.fillStyle = hexColor;
        resultCtx.fillRect(
          x * squareSize,
          y * squareSize,
          squareSize,
          squareSize
        );
      }
    }

    // Convertir el canvas a imagen y mostrar
    const imageDataUrl = resultCanvas.toDataURL();
    setPatternImageUrl(imageDataUrl);
    
    console.log('Patrón DMC creado:', dmcGrid);
  };

  return (
    <div className="home">
      {/* Canvas oculto para procesar la imagen */}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      {/* Canvas de resultado para el patrón DMC */}
      <canvas ref={resultCanvasRef} style={{ display: 'none' }}></canvas>

      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageLoad}
        style={{ display: 'none' }}
      />

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
            {processedImage ? (
              <img 
                src={processedImage} 
                alt="Processed" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <p>Your image goes here</p>
            )}
          </ImageContainer>
          
          <div className="button-group">
            <Button variant="primary" size="medium" onClick={handleDownloadImageClick}>Download your image</Button>
            <Button variant="danger" size="medium" onClick={handleDeleteImage}>Delete</Button>
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

          <Button variant="primary" size="large" onClick={processImageToPattern}>CONVERT</Button>
        </section>

        {/* Section 3: Download Pattern */}
        <section className="download-pattern-section">
          <Button variant="primary" size="medium">Download the pattern</Button>
        </section>

        {/* Section 4: Pattern Display */}
        <section className="pattern-display-section">
          <ImageContainer variant="pattern">
            {patternImageUrl ? (
              <img 
                src={patternImageUrl} 
                alt="DMC Pattern" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <p>Your color pattern goes here</p>
            )}
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
