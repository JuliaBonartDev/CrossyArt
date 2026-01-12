import { useState, useRef } from 'react';
import Button from './Button';
import ImageContainer from './ImageContainer';
import dmcColors from '../../rgb-dmc.json';
import { jsPDF } from 'jspdf';
import './Home.css';

export default function Home() {
  const [selectedSize, setSelectedSize] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [patternImageUrl, setPatternImageUrl] = useState(null);
  const [patternColors, setPatternColors] = useState([]);
  const [showColorModal, setShowColorModal] = useState(false);
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

  // Función para descargar el patrón
  const handleDownloadPattern = () => {
    if (!patternImageUrl) {
      alert('There is no image to download. Please create a pattern first.');
      return;
    }

    const link = document.createElement('a');
    link.href = patternImageUrl;
    link.download = 'crossy-art-pattern.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // Función para abrir la modal de colores
  const handleViewColorPalette = () => {
    if (patternColors.length === 0) {
      alert('There is no pattern created. Please create a pattern first.');
      return;
    }
    setShowColorModal(true);
  };

  // Función para cerrar la modal
  const handleCloseColorModal = () => {
    setShowColorModal(false);
  };

  // Función para descargar la lista de colores como imagen
  const handleDownloadColorPalette = () => {
    if (patternColors.length === 0) {
      alert('There is no pattern created. Please create a pattern first.');
      return;
    }

    // Crear PDF en formato A4
    const doc = new jsPDF('p', 'mm', 'a4'); // portrait, mm, A4
    
    const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
    const marginTop = 15;
    const marginSide = 10;
    const columnWidth = (pageWidth - marginSide * 2 - 10) / 3; // Tres columnas con espacio entre
    const columnSpacing = 5;
    
    // Título
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('CrossyArt - Color Palette', marginSide, marginTop);
    
    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(marginSide, marginTop + 5, pageWidth - marginSide, marginTop + 5);
    
    let yPosition = marginTop + 15; // Posición inicial después del título
    const itemHeight = 20; // Altura de cada item de color
    const colorBoxSize = 10; // Tamaño del cuadrado de color en mm
    const maxYPerPage = pageHeight - 15; // Espacio máximo por página
    
    // Procesar colores en tres columnas
    let columnIndex = 0;
    let currentXPosition = marginSide;
    
    for (let i = 0; i < patternColors.length; i++) {
      const color = patternColors[i];
      
      // Si nos pasamos del espacio disponible, crear nueva página
      if (yPosition + itemHeight > maxYPerPage) {
        doc.addPage();
        yPosition = marginTop + 15;
        columnIndex = 0;
        currentXPosition = marginSide;
      }
      
      // Calcular la posición X según la columna
      if (columnIndex === 0) {
        currentXPosition = marginSide;
      } else if (columnIndex === 1) {
        currentXPosition = marginSide + columnWidth + columnSpacing;
      } else {
        currentXPosition = marginSide + (columnWidth + columnSpacing) * 2;
      }
      
      const hexColor = color.hex.startsWith('#') ? color.hex : '#' + color.hex;
      
      // Convertir hex a RGB para jsPDF
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16)
        ] : [0, 0, 0];
      };
      
      const [r, g, b] = hexToRgb(hexColor);
      
      // Dibujar cuadrado de color
      doc.setFillColor(r, g, b);
      doc.rect(currentXPosition, yPosition - 4, colorBoxSize, colorBoxSize, 'F');
      
      // Borde del cuadrado
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.5);
      doc.rect(currentXPosition, yPosition - 4, colorBoxSize, colorBoxSize);
      
      // Texto: nombre del color
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'bold');
      doc.text(color.description, currentXPosition + colorBoxSize + 3, yPosition);
      
      // Texto: Floss y Row
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(`Floss: ${color.floss} | Row: ${color.row}`, currentXPosition + colorBoxSize + 3, yPosition + 4);
      
      // Cambiar de columna
      columnIndex++;
      if (columnIndex > 2) {
        columnIndex = 0;
        yPosition += itemHeight;
      }
    }
    
    // Descargar PDF
    doc.save('crossy-art-color-palette.pdf');
  };

  // Función para procesar la imagen en un patrón de cuadrícula
  const processImageToPattern = () => {
    // Validar que se ha seleccionado un tamaño
    if (!selectedSize) {
      alert('Please select a pattern size before converting.');
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

    // Extraer colores únicos del patrón
    const uniqueColors = new Map();
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const dmc = dmcGrid[y][x];
        const key = dmc.hex; // Usar hex como clave para evitar duplicados
        if (!uniqueColors.has(key)) {
          uniqueColors.set(key, dmc);
        }
      }
    }

    // Convertir a array y ordenar alfabéticamente por description
    const colorArray = Array.from(uniqueColors.values())
      .sort((a, b) => a.description.localeCompare(b.description));
    
    setPatternColors(colorArray);
    
    console.log('DMC pattern created:', dmcGrid);
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
          <Button variant="primary" size="medium" onClick={handleDownloadPattern}>Download the pattern</Button>
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

        <Button variant="primary" size="medium" onClick={handleViewColorPalette}>View color palette</Button>

        {/* Delete and Download Buttons */}
        <div className="button-group">
          <Button variant="primary" size="medium" onClick={handleDownloadColorPalette}>Download color palette</Button>
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

      {/* Modal de Color Palette */}
      {showColorModal && (
        <div className="modal-overlay" onClick={handleCloseColorModal}>
          <div className="color-palette-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Color Palette</h2>
              <button className="modal-close-btn" onClick={handleCloseColorModal}>×</button>
            </div>
            <div className="color-palette-list">
              {patternColors.map((color) => (
                <div key={color.hex} className="color-item">
                  <div 
                    className="color-box"
                    style={{ 
                      backgroundColor: color.hex.startsWith('#') ? color.hex : '#' + color.hex 
                    }}
                  ></div>
                  <div className="color-info">
                    <p className="color-name"><strong>{color.description}</strong></p>
                    <p className="color-detail">Floss: {color.floss}</p>
                    <p className="color-detail">Row: {color.row}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
