import './PatternPages.css';
import { getSymbolForColor } from '../utils/symbolMapper';

export default function PatternPages({ patternDimensions, dmcGrid, gridSize, onClose, isSymbolicMode = false, symbolMap = null }) {
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

  // Función para renderizar símbolos en SVG
  const renderSymbolSvg = (symbolType, color, size) => {
    const center = size / 2;
    const padding = size * 0.15;

    switch (symbolType) {
      case 'dot':
        return <circle cx={center} cy={center} r={size / 8} fill={color} />;

      case 'cross':
        return (
          <>
            <line x1={padding} y1={center} x2={size - padding} y2={center} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={center} y1={padding} x2={center} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'xCross':
        return (
          <>
            <line x1={padding} y1={size - padding} x2={size - padding} y2={padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={padding} y1={padding} x2={size - padding} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'plus':
        return (
          <>
            <line x1={padding} y1={center} x2={size - padding} y2={center} stroke={color} strokeWidth="2" strokeLinecap="round" />
            <line x1={center} y1={padding} x2={center} y2={size - padding} stroke={color} strokeWidth="2" strokeLinecap="round" />
          </>
        );

      case 'star': {
        const innerRadius = size / 8;
        const outerRadius = size / 4;
        const spikes = 5;
        let points = '';
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI) / spikes - Math.PI / 2;
          const px = center + Math.cos(angle) * radius;
          const py = center + Math.sin(angle) * radius;
          points += `${px},${py} `;
        }
        return <polygon points={points} fill={color} />;
      }

      case 'heart':
        return (
          <path
            d={`M ${center} ${center + size / 6} C ${center - size / 6} ${center - size / 6}, ${center - size / 3} ${center - size / 6}, ${center} ${center - size / 4} C ${center + size / 3} ${center - size / 6}, ${center + size / 6} ${center - size / 6}, ${center} ${center + size / 6}`}
            fill={color}
          />
        );

      case 'diamond':
        return (
          <polygon
            points={`${center},${padding} ${size - padding},${center} ${center},${size - padding} ${padding},${center}`}
            fill={color}
          />
        );

      case 'square':
        return (
          <rect x={center - size / 8} y={center - size / 8} width={size / 4} height={size / 4} fill={color} />
        );

      case 'triangle':
        return (
          <polygon
            points={`${center},${padding} ${size - padding},${size - padding} ${padding},${size - padding}`}
            fill={color}
          />
        );

      case 'circle':
        return (
          <circle cx={center} cy={center} r={size / 5} fill="none" stroke={color} strokeWidth="1.5" />
        );

      case 'line':
        return (
          <line x1={padding} y1={center} x2={size - padding} y2={center} stroke={color} strokeWidth="2" strokeLinecap="round" />
        );

      case 'slash':
        return (
          <line x1={padding} y1={size - padding} x2={size - padding} y2={padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        );

      case 'backslash':
        return (
          <line x1={padding} y1={padding} x2={size - padding} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        );

      case 'arrow':
        return (
          <>
            <line x1={center} y1={padding} x2={center} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={center - size / 8} y1={padding + size / 8} x2={center} y2={padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={center + size / 8} y1={padding + size / 8} x2={center} y2={padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'checkmark':
        return (
          <polyline
            points={`${padding},${center} ${center - padding},${size - padding} ${size - padding},${padding}`}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      case 'x':
        return (
          <>
            <line x1={padding} y1={padding} x2={size - padding} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={size - padding} y1={padding} x2={padding} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'asterisk':
        return (
          <>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const angle = (i * Math.PI) / 3;
              const x1 = center + Math.cos(angle) * (size / 6);
              const y1 = center + Math.sin(angle) * (size / 6);
              const x2 = center - Math.cos(angle) * (size / 6);
              const y2 = center - Math.sin(angle) * (size / 6);
              return (
                <line key={i} x1={x2} y1={y2} x2={x1} y2={y1} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
              );
            })}
          </>
        );

      case 'hash':
        return (
          <>
            <line x1={padding} y1={center - size / 8} x2={size - padding} y2={center - size / 8} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={padding} y1={center + size / 8} x2={size - padding} y2={center + size / 8} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={center - size / 8} y1={padding} x2={center - size / 8} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={center + size / 8} y1={padding} x2={center + size / 8} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'percent':
        return (
          <>
            <circle cx={size / 4} cy={size / 4} r={size / 12} fill={color} />
            <circle cx={(size * 3) / 4} cy={(size * 3) / 4} r={size / 12} fill={color} />
            <line x1={padding} y1={size - padding} x2={size - padding} y2={padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      // NÚMEROS (0-9)
      case 'num0':
        return (
          <ellipse cx={center} cy={center} rx={size / 6} ry={size / 5} fill="none" stroke={color} strokeWidth="1.5" />
        );

      case 'num1':
        return (
          <line x1={center} y1={padding} x2={center} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        );

      case 'num2':
        return (
          <path d={`M ${center - size / 6} ${padding + size / 10} Q ${center + size / 6} ${padding} ${center - size / 6} ${center} L ${center + size / 6} ${size - padding}`} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        );

      case 'num3':
        return (
          <>
            <line x1={padding} y1={padding} x2={size - padding} y2={padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={padding} y1={center} x2={size - padding} y2={center} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={padding} y1={size - padding} x2={size - padding} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'num4':
        return (
          <>
            <line x1={size - padding} y1={padding} x2={padding} y2={center} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={padding} y1={center} x2={size - padding} y2={center} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={size - padding} y1={center} x2={size - padding} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'num5':
        return (
          <>
            <line x1={size - padding} y1={padding} x2={padding} y2={padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={padding} y1={padding} x2={padding} y2={center} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <path d={`Q ${size - padding} ${center + size / 10} ${padding} ${size - padding}`} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'num6':
        return (
          <>
            <line x1={size - padding} y1={padding} x2={padding} y2={padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={padding} y1={padding} x2={padding} y2={center + size / 6} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <path d={`A ${size / 6} ${size / 6} 0 0 0 ${size - padding} ${center + size / 6}`} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'num7':
        return (
          <>
            <line x1={padding} y1={padding} x2={size - padding} y2={padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={size - padding} y1={padding} x2={padding} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'num8':
        return (
          <>
            <ellipse cx={center} cy={center - size / 8} rx={size / 6} ry={size / 8} fill="none" stroke={color} strokeWidth="1.5" />
            <ellipse cx={center} cy={center + size / 8} rx={size / 6} ry={size / 8} fill="none" stroke={color} strokeWidth="1.5" />
          </>
        );

      case 'num9':
        return (
          <>
            <path d={`A ${size / 6} ${size / 6} 0 0 0 ${size - padding} ${center - size / 6}`} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={size - padding} y1={center - size / 6} x2={size - padding} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      // LETRAS (A, B, C, D, E, U, V, W, X, Y, Z)
      case 'letterA':
        return (
          <>
            <line x1={padding} y1={size - padding} x2={center} y2={padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={center} y1={padding} x2={size - padding} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={center - size / 6} y1={center} x2={center + size / 6} y2={center} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'letterB':
        return (
          <>
            <line x1={padding} y1={padding} x2={padding} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <path d={`M ${padding} ${padding} L ${size - padding - size / 8} ${padding} A ${size / 8} ${size / 8} 0 0 1 ${size - padding - size / 8} ${center}`} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <path d={`M ${padding} ${center} L ${size - padding - size / 8} ${center} A ${size / 8} ${size / 8} 0 0 1 ${size - padding - size / 8} ${size - padding}`} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={padding} y1={size - padding} x2={size - padding - size / 8} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'letterC':
        return (
          <path d={`A ${size / 5} ${size / 5} 0 0 1 ${center} ${size - padding}`} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        );

      case 'letterD':
        return (
          <>
            <line x1={padding} y1={padding} x2={padding} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <path d={`M ${padding} ${padding} A ${size / 5} ${size / 5} 0 0 1 ${padding + size / 5} ${size - padding}`} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={padding} y1={padding} x2={padding + size / 5} y2={padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'letterE':
        return (
          <>
            <line x1={size - padding} y1={padding} x2={padding} y2={padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={padding} y1={padding} x2={padding} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={padding} y1={size - padding} x2={size - padding} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={padding} y1={center} x2={size - padding - size / 8} y2={center} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'letterU':
        return (
          <>
            <line x1={padding} y1={padding} x2={padding} y2={center + size / 6} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <path d={`A ${size / 5} ${size / 5} 0 0 0 ${size - padding} ${center + size / 6}`} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={size - padding} y1={center + size / 6} x2={size - padding} y2={padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'letterV':
        return (
          <>
            <line x1={padding} y1={padding} x2={center} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={center} y1={size - padding} x2={size - padding} y2={padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'letterW':
        return (
          <>
            <line x1={padding} y1={padding} x2={padding + size / 5} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={padding + size / 5} y1={size - padding} x2={center} y2={padding + size / 6} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={center} y1={padding + size / 6} x2={size - padding - size / 5} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={size - padding - size / 5} y1={size - padding} x2={size - padding} y2={padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'letterX':
        return (
          <>
            <line x1={padding} y1={padding} x2={size - padding} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={size - padding} y1={padding} x2={padding} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'letterY':
        return (
          <>
            <line x1={padding} y1={padding} x2={center} y2={center} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={size - padding} y1={padding} x2={center} y2={center} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={center} y1={center} x2={center} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'letterZ':
        return (
          <>
            <line x1={padding} y1={padding} x2={size - padding} y2={padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={size - padding} y1={padding} x2={padding} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={padding} y1={size - padding} x2={size - padding} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      // SÍMBOLOS GEOMÉTRICOS
      case 'pentagon': {
        let points = '';
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const px = center + (size / 5) * Math.cos(angle);
          const py = center + (size / 5) * Math.sin(angle);
          points += `${px},${py} `;
        }
        return <polygon points={points} fill="none" stroke={color} strokeWidth="1.5" />;
      }

      case 'hexagon': {
        let points = '';
        for (let i = 0; i < 6; i++) {
          const angle = (i * 2 * Math.PI) / 6;
          const px = center + (size / 5) * Math.cos(angle);
          const py = center + (size / 5) * Math.sin(angle);
          points += `${px},${py} `;
        }
        return <polygon points={points} fill="none" stroke={color} strokeWidth="1.5" />;
      }

      case 'octagon': {
        let points = '';
        for (let i = 0; i < 8; i++) {
          const angle = (i * 2 * Math.PI) / 8;
          const px = center + (size / 5) * Math.cos(angle);
          const py = center + (size / 5) * Math.sin(angle);
          points += `${px},${py} `;
        }
        return <polygon points={points} fill="none" stroke={color} strokeWidth="1.5" />;
      }

      case 'decagon': {
        let points = '';
        for (let i = 0; i < 10; i++) {
          const angle = (i * 2 * Math.PI) / 10;
          const px = center + (size / 5) * Math.cos(angle);
          const py = center + (size / 5) * Math.sin(angle);
          points += `${px},${py} `;
        }
        return <polygon points={points} fill="none" stroke={color} strokeWidth="1.5" />;
      }

      case 'semicircle':
        return (
          <>
            <path d={`M ${center - size / 5} ${center} A ${size / 5} ${size / 5} 0 0 0 ${center + size / 5} ${center}`} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={center - size / 5} y1={center} x2={center + size / 5} y2={center} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      // FLECHAS DIRECCIONALES
      case 'arrowUp':
        return (
          <>
            <line x1={center} y1={padding} x2={center} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={center - size / 8} y1={size - padding - size / 6} x2={center} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={center + size / 8} y1={size - padding - size / 6} x2={center} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'arrowDown':
        return (
          <>
            <line x1={center} y1={padding} x2={center} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={center - size / 8} y1={padding + size / 6} x2={center} y2={padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={center + size / 8} y1={padding + size / 6} x2={center} y2={padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'arrowLeft':
        return (
          <>
            <line x1={size - padding} y1={center} x2={padding} y2={center} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={padding + size / 6} y1={center - size / 8} x2={padding} y2={center} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={padding + size / 6} y1={center + size / 8} x2={padding} y2={center} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'arrowRight':
        return (
          <>
            <line x1={padding} y1={center} x2={size - padding} y2={center} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={size - padding - size / 6} y1={center - size / 8} x2={size - padding} y2={center} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={size - padding - size / 6} y1={center + size / 8} x2={size - padding} y2={center} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'arrowUpLeft':
        return (
          <>
            <line x1={size - padding} y1={size - padding} x2={padding} y2={padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={padding} y1={padding} x2={padding + size / 8} y2={padding + size / 8} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={padding} y1={padding} x2={padding + size / 8} y2={padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'arrowUpRight':
        return (
          <>
            <line x1={padding} y1={size - padding} x2={size - padding} y2={padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={size - padding} y1={padding} x2={size - padding - size / 8} y2={padding + size / 8} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={size - padding} y1={padding} x2={size - padding - size / 8} y2={padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'arrowDownLeft':
        return (
          <>
            <line x1={size - padding} y1={padding} x2={padding} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={padding} y1={size - padding} x2={padding + size / 8} y2={size - padding - size / 8} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={padding} y1={size - padding} x2={padding + size / 8} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'arrowDownRight':
        return (
          <>
            <line x1={padding} y1={padding} x2={size - padding} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={size - padding} y1={size - padding} x2={size - padding - size / 8} y2={size - padding - size / 8} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={size - padding} y1={size - padding} x2={size - padding - size / 8} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      // SÍMBOLOS ESPECIALES
      case 'quoteMark':
        return (
          <>
            <circle cx={size / 4} cy={size / 4} r={size / 10} fill="none" stroke={color} strokeWidth="1.5" />
            <line x1={size / 4} y1={size / 3} x2={size / 4} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'doubleQuote':
        return (
          <>
            <circle cx={size / 5} cy={size / 4} r={size / 10} fill="none" stroke={color} strokeWidth="1.5" />
            <circle cx={(3 * size) / 5} cy={size / 4} r={size / 10} fill="none" stroke={color} strokeWidth="1.5" />
            <line x1={size / 5} y1={size / 3} x2={size / 5} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={(3 * size) / 5} y1={size / 3} x2={(3 * size) / 5} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'parenthesis':
        return (
          <>
            <path d={`M ${center + size / 8} ${padding} A ${size / 5} ${size / 5} 0 0 0 ${center + size / 8} ${size - padding}`} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <path d={`M ${center - size / 8} ${padding} A ${size / 5} ${size / 5} 0 0 1 ${center - size / 8} ${size - padding}`} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'bracket':
        return (
          <>
            <line x1={size - padding} y1={padding} x2={padding} y2={padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={padding} y1={padding} x2={padding} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={padding} y1={size - padding} x2={size - padding} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'divide':
        return (
          <>
            <circle cx={center} cy={center - size / 6} r={size / 16} fill="none" stroke={color} strokeWidth="1.5" />
            <line x1={padding} y1={size - padding} x2={size - padding} y2={padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <circle cx={center} cy={center + size / 6} r={size / 16} fill="none" stroke={color} strokeWidth="1.5" />
          </>
        );

      // SÍMBOLOS VARIADOS
      case 'sun': {
        const sunElements = [];
        sunElements.push(<circle key="sun-center" cx={center} cy={center} r={size / 8} fill="none" stroke={color} strokeWidth="1.5" />);
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          const x1 = center + (size / 4.5) * Math.cos(angle);
          const y1 = center + (size / 4.5) * Math.sin(angle);
          const x2 = x1 + (size / 12) * Math.cos(angle);
          const y2 = y1 + (size / 12) * Math.sin(angle);
          sunElements.push(<line key={`sun-ray-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.5" strokeLinecap="round" />);
        }
        return <>{sunElements}</>;
      }

      case 'moon':
        return (
          <>
            <circle cx={center} cy={center} r={size / 5} fill="none" stroke={color} strokeWidth="1.5" />
            <circle cx={center + size / 10} cy={center} r={size / 6} fill="#ffffff" stroke="none" />
          </>
        );

      case 'star2': {
        let points = '';
        const innerRadius = size / 10;
        const outerRadius = size / 4;
        for (let i = 0; i < 10; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          const px = center + Math.cos(angle) * radius;
          const py = center + Math.sin(angle) * radius;
          points += `${px},${py} `;
        }
        return <polygon points={points} fill={color} />;
      }

      case 'cloud': {
        const cloudElements = [];
        cloudElements.push(<circle key="cloud-1" cx={center - size / 8} cy={center} r={size / 8} fill="none" stroke={color} strokeWidth="1.5" />);
        cloudElements.push(<circle key="cloud-2" cx={center + size / 8} cy={center} r={size / 8} fill="none" stroke={color} strokeWidth="1.5" />);
        cloudElements.push(<circle key="cloud-3" cx={center} cy={center + size / 8} r={size / 8} fill="none" stroke={color} strokeWidth="1.5" />);
        return <>{cloudElements}</>;
      }

      case 'note':
        return (
          <>
            <circle cx={center + size / 6} cy={size - padding - size / 8} r={size / 10} fill="none" stroke={color} strokeWidth="1.5" />
            <line x1={center + size / 6} y1={size - padding - size / 4} x2={center + size / 6} y2={padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'spiral': {
        let spiralPath = 'M';
        for (let i = 0; i < 360; i += 10) {
          const angle = (i * Math.PI) / 180;
          const r = (i / 360) * (size / 3);
          const px = center + r * Math.cos(angle);
          const py = center + r * Math.sin(angle);
          spiralPath += ` ${px},${py}`;
        }
        return <path d={spiralPath} fill="none" stroke={color} strokeWidth="1.5" />;
      }

      case 'wave': {
        let wavePath = `M ${padding},${center}`;
        for (let i = 0; i <= size; i += 2) {
          const y_pos = center + (size / 10) * Math.sin((i / size) * Math.PI * 2);
          wavePath += ` L ${padding + i},${y_pos}`;
        }
        return <path d={wavePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />;
      }

      case 'zigzag':
        return (
          <polyline points={`${padding},${padding} ${padding + (size - 2 * padding) / 4},${size - padding} ${padding + (size - 2 * padding) / 2},${padding} ${padding + (3 * (size - 2 * padding)) / 4},${size - padding} ${size - padding},${padding}`} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        );

      case 'dotted': {
        const dotElements = [];
        for (let i = 0; i < 5; i++) {
          dotElements.push(<circle key={`dot-${i}`} cx={padding + i * ((size - 2 * padding) / 4)} cy={center} r={size / 20} fill={color} />);
        }
        return <>{dotElements}</>;
      }

      case 'dashed':
        return (
          <line x1={padding} y1={center} x2={size - padding} y2={center} stroke={color} strokeWidth="1.5" strokeDasharray={`${size / 10},${size / 10}`} strokeLinecap="round" />
        );

      case 'ring':
        return (
          <>
            <circle cx={center} cy={center} r={size / 5} fill="none" stroke={color} strokeWidth="1.5" />
            <circle cx={center} cy={center} r={size / 8} fill="none" stroke={color} strokeWidth="1.5" />
          </>
        );

      case 'target':
        return (
          <>
            <circle cx={center} cy={center} r={size / 5} fill="none" stroke={color} strokeWidth="1.5" />
            <circle cx={center} cy={center} r={size / 10} fill="none" stroke={color} strokeWidth="1.5" />
            <line x1={padding} y1={center} x2={size - padding} y2={center} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={center} y1={padding} x2={center} y2={size - padding} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );

      case 'cross2':
        return (
          <>
            <line x1={center} y1={padding} x2={center} y2={size - padding} stroke={color} strokeWidth="2" strokeLinecap="round" />
            <line x1={padding} y1={center} x2={size - padding} y2={center} stroke={color} strokeWidth="2" strokeLinecap="round" />
          </>
        );

      case 'swirl': {
        let swirlPath = 'M';
        for (let i = 0; i < 720; i += 10) {
          const angle = (i * Math.PI) / 180;
          const r = (i / 720) * (size / 3);
          const px = center + r * Math.cos(angle);
          const py = center + r * Math.sin(angle);
          swirlPath += ` ${px},${py}`;
        }
        return <path d={swirlPath} fill="none" stroke={color} strokeWidth="1.5" />;
      }

      default:
        return (
          <circle cx={center} cy={center} r={size / 8} fill={color} />
        );
    }
  };

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
              {row.map((dmc, x) => {
                // Modo simbólico
                if (isSymbolicMode && symbolMap && dmc) {
                  // Asegurar que el hex tiene # al principio
                  const dmcHex = dmc.hex.startsWith('#') ? dmc.hex : '#' + dmc.hex;
                  const symbolInfo = getSymbolForColor(dmcHex, symbolMap);
                  
                  if (!symbolInfo) {
                    console.warn(`No symbol found for color: ${dmcHex}`, dmc);
                    return (
                      <div
                        key={`${y}-${x}`}
                        className="grid-cell"
                        style={{
                          width: `${CELL_SIZE_MM}mm`,
                          height: `${CELL_SIZE_MM}mm`,
                          backgroundColor: '#ffcccc',
                          border: '0.5px solid #ddd',
                          boxSizing: 'border-box',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title={`ERROR: No symbol for ${dmcHex}`}
                      >
                        ?
                      </div>
                    );
                  }
                  
                  return (
                    <div
                      key={`${y}-${x}`}
                      className="grid-cell"
                      style={{
                        width: `${CELL_SIZE_MM}mm`,
                        height: `${CELL_SIZE_MM}mm`,
                        backgroundColor: '#ffffff',
                        border: '0.5px solid #ddd',
                        boxSizing: 'border-box',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}
                      title={dmc ? `${dmc.description} (${dmc.floss})` : 'Empty'}
                    >
                      <svg
                        width="100%"
                        height="100%"
                        style={{ position: 'absolute' }}
                        viewBox={`0 0 ${CELL_SIZE_MM} ${CELL_SIZE_MM}`}
                      >
                        {renderSymbolSvg(symbolInfo.symbolType, symbolInfo.color, CELL_SIZE_MM)}
                      </svg>
                    </div>
                  );
                }
                
                // Modo colores (original)
                return (
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
                );
              })}
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
          <h2>
            {isSymbolicMode 
              ? 'Pattern Pages - Symbolic Mode (A4 - 60x85 cells per page)' 
              : 'Pattern Pages for Printing (A4 - 60x85 cells per page)'}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="pages-info">
          <p>Total pages: <strong>{totalPages}</strong> ({pagesHorizontal}×{pagesVertical})</p>
          <p>Each cell: <strong>{CELL_SIZE_MM}×{CELL_SIZE_MM} mm</strong> | Grid: 60×85 cells per page</p>
          {isSymbolicMode && <p style={{ color: '#666', fontStyle: 'italic' }}>Viewing symbolic pattern with color symbols</p>}
        </div>
        <div className="pages-grid-container">
          {Array.from({ length: totalPages }).map((_, pageIndex) => renderPage(pageIndex))}
        </div>
      </div>
    </div>
  );
}
