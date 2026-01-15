import './PatternPages.css';

export default function PatternPages({ patternDimensions, dmcGrid, gridSize, onClose }) {
  const CELLS_PER_PAGE_WIDTH = 60;
  const CELLS_PER_PAGE_HEIGHT = 85;
  const CELL_SIZE_MM = 3;

  // Calcular el desplazamiento (offset) para ignorar los márgenes negros
  const offsetX = (gridSize - patternDimensions.width) / 2;
  const offsetY = (gridSize - patternDimensions.height) / 2;

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
        // Sumar el offset para acceder a la posición correcta en dmcGrid
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

  // Función para renderizar una página
  const renderPage = (pageIndex) => {
    const pagePattern = getPagePattern(pageIndex);
    const pageRow = Math.floor(pageIndex / pagesHorizontal);
    const pageCol = pageIndex % pagesHorizontal;

    const startY = pageRow * CELLS_PER_PAGE_HEIGHT;
    const startX = pageCol * CELLS_PER_PAGE_WIDTH;

    const endY = Math.min(startY + CELLS_PER_PAGE_HEIGHT, patternDimensions.height);
    const endX = Math.min(startX + CELLS_PER_PAGE_WIDTH, patternDimensions.width);

    // Calcular el número actual de filas y columnas en esta página
    const actualHeight = endY - startY;
    const actualWidth = endX - startX;

    // Calcular tamaño total de la página en mm (sin escalar)
    const pageWidthMm = actualWidth * CELL_SIZE_MM;
    const pageHeightMm = actualHeight * CELL_SIZE_MM;

    return (
      <div key={pageIndex} className="pattern-page">
        <div className="page-number">{pageIndex + 1}</div>
        <div 
          className="page-grid"
          style={{
            width: `${pageWidthMm}mm`,
            height: `${pageHeightMm}mm`,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {pagePattern.map((row, y) => (
            <div 
              key={y} 
              className="grid-row"
              style={{ 
                display: 'flex',
                height: `${CELL_SIZE_MM}mm`,
                width: '100%'
              }}
            >
              {row.map((dmc, x) => (
                <div
                  key={`${y}-${x}`}
                  className="grid-cell"
                  style={{
                    width: `${CELL_SIZE_MM}mm`,
                    height: `${CELL_SIZE_MM}mm`,
                    backgroundColor: dmc ? (dmc.hex.startsWith('#') ? dmc.hex : '#' + dmc.hex) : '#ffffff',
                    border: '0.5px solid #ddd',
                    boxSizing: 'border-box',
                    flexShrink: 0
                  }}
                  title={dmc ? `${dmc.description} (${dmc.floss})` : 'Empty'}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="pattern-pages-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Pattern Pages for Printing (A4 - 60x85 cells per page)</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="pages-info">
          <p>Total pages: <strong>{totalPages}</strong> ({pagesHorizontal}×{pagesVertical})</p>
          <p>Each cell: <strong>{CELL_SIZE_MM}×{CELL_SIZE_MM} mm</strong> | Grid: 60×85 cells per page</p>
        </div>
        <div className="pages-grid-container">
          {Array.from({ length: totalPages }).map((_, pageIndex) => renderPage(pageIndex))}
        </div>
      </div>
    </div>
  );
}
