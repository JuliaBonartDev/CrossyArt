import { useState, useRef, useEffect } from 'react';
import Button from './Button';
import ImageContainer from './ImageContainer';
import PatternPages from './PatternPages';
import dmcColors from '../../rgb-dmc.json';
import { jsPDF } from 'jspdf';
import './Home.css';

export default function Home() {
  const [selectedSize, setSelectedSize] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [patternImageUrl, setPatternImageUrl] = useState(null);
  const [patternColors, setPatternColors] = useState([]);
  const [showColorModal, setShowColorModal] = useState(false);
  const [showPatternPagesModal, setShowPatternPagesModal] = useState(false);
  const [originalImageWidth, setOriginalImageWidth] = useState(null);
  const [originalImageHeight, setOriginalImageHeight] = useState(null);
  const [patternDimensions, setPatternDimensions] = useState(null);
  const [dmcGrid, setDmcGrid] = useState(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const resultCanvasRef = useRef(null);
  const dmcCacheRef = useRef({});

  // Controlar el overflow del body cuando los modales están abiertos
  useEffect(() => {
    if (showColorModal || showPatternPagesModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showColorModal, showPatternPagesModal]);

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
        // Guardar el tamaño original de la imagen
        setOriginalImageWidth(img.width);
        setOriginalImageHeight(img.height);

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

  // Función para cuantizar el color (redondear a múltiplos de 3 para agrupar similares)
  const quantizeColor = (rgb) => {
    const quantize = (value) => Math.round(value / 3) * 3;
    return {
      r: quantize(rgb.r),
      g: quantize(rgb.g),
      b: quantize(rgb.b)
    };
  };

  // Función para crear una clave única para el caché
  const getColorKey = (rgb) => {
    const quantized = quantizeColor(rgb);
    return `${quantized.r},${quantized.g},${quantized.b}`;
  };

  // Función para calcular la distancia euclidiana entre dos colores RGB
  const colorDistance = (c1, c2) => {
    return Math.sqrt(
      (c1.r - c2.r) ** 2 +
      (c1.g - c2.g) ** 2 +
      (c1.b - c2.b) ** 2
    );
  };

  // Función para encontrar el color DMC más cercano (con caché)
  const findClosestDMC = (rgb) => {
    const colorKey = getColorKey(rgb);
    
    // Verificar si el color ya está en caché
    if (dmcCacheRef.current[colorKey]) {
      return dmcCacheRef.current[colorKey];
    }

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

    // Guardar en caché
    dmcCacheRef.current[colorKey] = closest;
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

  // Función para abrir la modal de páginas del patrón
  const handleViewPatternPages = () => {
    if (!patternDimensions || !dmcGrid) {
      alert('There is no pattern created. Please create a pattern first.');
      return;
    }
    setShowPatternPagesModal(true);
  };

  // Función para cerrar la modal de páginas del patrón
  const handleClosePatternPagesModal = () => {
    setShowPatternPagesModal(false);
  };

  // Función para descargar las páginas del patrón como PDF
  const handleDownloadPatternPages = () => {
    if (!patternDimensions || !dmcGrid) {
      alert('There is no pattern created. Please create a pattern first.');
      return;
    }

    const CELLS_PER_PAGE_WIDTH = 60;
    const CELLS_PER_PAGE_HEIGHT = 85;
    const CELL_SIZE_MM = 3;

    // Calcular el desplazamiento (offset) para ignorar los márgenes negros
    const offsetX = (selectedSize - patternDimensions.width) / 2;
    const offsetY = (selectedSize - patternDimensions.height) / 2;

    // Calcular número de páginas
    const pagesHorizontal = Math.ceil(patternDimensions.width / CELLS_PER_PAGE_WIDTH);
    const pagesVertical = Math.ceil(patternDimensions.height / CELLS_PER_PAGE_HEIGHT);
    const totalPages = pagesHorizontal * pagesVertical;

    // Función para obtener el fragmento de patrón para una página específica
    const getPagePattern = (pageIndex) => {
      const pageRow = Math.floor(pageIndex / pagesHorizontal);
      const pageCol = pageIndex % pagesHorizontal;

      const startY = pageRow * CELLS_PER_PAGE_HEIGHT;
      const startX = pageCol * CELLS_PER_PAGE_WIDTH;

      const endY = Math.min(startY + CELLS_PER_PAGE_HEIGHT, patternDimensions.height);
      const endX = Math.min(startX + CELLS_PER_PAGE_WIDTH, patternDimensions.width);

      const pagePattern = [];
      for (let y = startY; y < endY; y++) {
        const row = [];
        for (let x = startX; x < endX; x++) {
          const gridY = Math.round(y + offsetY);
          const gridX = Math.round(x + offsetX);
          
          if (gridY < dmcGrid.length && gridX < dmcGrid[gridY].length) {
            row.push(dmcGrid[gridY][gridX]);
          } else {
            row.push(null);
          }
        }
        pagePattern.push(row);
      }

      return pagePattern;
    };

    // Crear PDF
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

    // Iterar sobre cada página
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      if (pageIndex > 0) {
        doc.addPage();
      }

      const pagePattern = getPagePattern(pageIndex);

      // Dibujar cada celda
      for (let y = 0; y < pagePattern.length; y++) {
        for (let x = 0; x < pagePattern[y].length; x++) {
          const dmc = pagePattern[y][x];
          
          // Calcular posición en mm
          const posX = 10 + x * CELL_SIZE_MM; // Margen izquierdo de 10mm
          const posY = 10 + y * CELL_SIZE_MM; // Margen superior de 10mm

          // Convertir hex a RGB para jsPDF
          const hexColor = dmc ? (dmc.hex.startsWith('#') ? dmc.hex : '#' + dmc.hex) : '#ffffff';
          const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? [
              parseInt(result[1], 16),
              parseInt(result[2], 16),
              parseInt(result[3], 16)
            ] : [255, 255, 255];
          };

          const [r, g, b] = hexToRgb(hexColor);
          doc.setFillColor(r, g, b);
          doc.rect(posX, posY, CELL_SIZE_MM, CELL_SIZE_MM, 'F');

          // Dibujar borde
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.1);
          doc.rect(posX, posY, CELL_SIZE_MM, CELL_SIZE_MM);
        }
      }

      // Agregar número de página
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${pageIndex + 1} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
    }

    // Descargar PDF
    doc.save('crossy-art-pattern-pages.pdf');
  };

  // Función para eliminar el patrón
  const handleDeletePattern = () => {
    setPatternImageUrl(null);
    setPatternColors([]);
    setPatternDimensions(null);
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
    // Limpiar el caché de colores DMC para este nuevo patrón
    dmcCacheRef.current = {};

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

    // Calcular las dimensiones reales del patrón sin márgenes negros
    if (originalImageWidth && originalImageHeight) {
      const patternWidthInCells = Math.round(originalImageWidth / squareSize);
      const patternHeightInCells = Math.round(originalImageHeight / squareSize);
      setPatternDimensions({
        width: patternWidthInCells,
        height: patternHeightInCells
      });
    }

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
    setDmcGrid(dmcGrid);
    
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
          <div className="button-group">
          <Button variant="primary" size="medium" onClick={handleDownloadPattern}>Download the pattern</Button>

          <Button variant="primary" size="medium" onClick={handleDownloadPatternPages}>Download pattern pages</Button>
          </div>
          
          {patternDimensions && (
            <div className="pattern-dimensions">
              <p>Pattern size: <strong>{patternDimensions.width} × {patternDimensions.height}</strong> stitches</p>
            </div>
          )}
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

        <div className="button-group">        
        <Button variant="primary" size="medium" onClick={handleViewColorPalette}>View color palette</Button>

        <Button variant="primary" size="medium" onClick={handleViewPatternPages}>View pattern pages</Button>
        </div>

        {/* Delete and Download Buttons */}
        <div className="button-group">
          <Button variant="primary" size="medium" onClick={handleDownloadColorPalette}>Download color palette</Button>
          <Button variant="danger" size="medium" onClick={handleDeletePattern}>Delete</Button>
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

      {/* Modal de Pattern Pages */}
      {showPatternPagesModal && patternDimensions && dmcGrid && (
        <PatternPages 
          patternDimensions={patternDimensions}
          dmcGrid={dmcGrid}
          gridSize={selectedSize}
          onClose={handleClosePatternPagesModal}
        />
      )}
    </div>
  );
}
