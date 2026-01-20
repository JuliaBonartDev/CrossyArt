/**
 * Symbol Mapper - Sistema avanzado de mapeo color→símbolo
 * Lista curada (prioriza tipográficos) para máxima diferenciación visual.
 * 60 símbolos × 12 colores = 720 combinaciones únicas (suficiente para 454 DMC).
 */

// Definir tipos de símbolos base (60 símbolos, curados)
const symbolTypes = [
  // Números (0-9)
  'num0', 'num1', 'num2', 'num3', 'num4', 'num5', 'num6', 'num7', 'num8', 'num9',

  // Letras (A-Z)
  'letterA', 'letterB', 'letterC', 'letterD', 'letterE', 'letterF', 'letterG', 'letterH', 'letterI', 'letterJ',
  'letterK', 'letterL', 'letterM', 'letterN', 'letterO', 'letterP', 'letterQ', 'letterR', 'letterS', 'letterT',
  'letterU', 'letterV', 'letterW', 'letterX', 'letterY', 'letterZ',

  // Formas e iconos muy distintos
  'heart', 'diamond', 'square', 'triangle', 'circle',
  'pentagon', 'hexagon', 'octagon', 'decagon', 'semicircle',
  'cloud',

  // Flechas direccionales (gruesas)
  'arrowUp', 'arrowDown', 'arrowLeft', 'arrowRight',

  // Marcadores claros
  'checkmark', 'hash', 'percent', 'equals',
  'bracket', 'parenthesis', 'quoteMark',

  // Patrones
  'spiral', 'zigzag'
];

// Colores para diferenciar - colores PRIMARIOS Y VISUALMENTE MUY DISTINTOS
// TODOS OSCUROS para que se vean sobre fondo blanco
const symbolColors = [
  { name: 'darkGray', color: 'rgb(40, 40, 40)' },          // Gris muy oscuro
  { name: 'gray', color: 'rgb(80, 80, 80)' },              // Gris oscuro
  { name: 'black', color: 'rgb(0, 0, 0)' },                // Negro puro
  { name: 'darkRed', color: 'rgb(139, 0, 0)' },            // Rojo oscuro
  { name: 'blue', color: 'rgb(0, 102, 204)' },             // Azul oscuro (más visible)
  { name: 'darkBlue', color: 'rgb(0, 51, 102)' },          // Azul muy oscuro
  { name: 'green', color: 'rgb(0, 128, 0)' },              // Verde oscuro
  { name: 'darkGreen', color: 'rgb(0, 80, 0)' },           // Verde muy oscuro
  { name: 'orange', color: 'rgb(255, 140, 0)' },           // Naranja vivo
  { name: 'purple', color: 'rgb(102, 0, 102)' },           // Púrpura oscuro
  { name: 'pink', color: 'rgb(200, 50, 100)' },            // Rosa oscuro
  { name: 'brown', color: 'rgb(139, 69, 19)' },            // Marrón
];

// Generar todas las combinaciones: tipo × color = 1,080 combinaciones únicas
// Orden: PRIMERO todos los símbolos con el primer color, LUEGO todos con el segundo color, etc.
// Esto evita duplicaciones: cada símbolo aparece con diferentes colores en lugar de repetir colores
const symbolPatterns = [];
symbolColors.forEach((colorObj) => {
  symbolTypes.forEach((type) => {
    symbolPatterns.push({
      id: `${type}_${colorObj.name}`,
      symbolType: type,
      color: colorObj.color,
      colorName: colorObj.name,
    });
  });
});

console.log(`✓ Symbol mapper initialized with ${symbolPatterns.length} unique symbol+color combinations`);

/**
 * Crea el mapeo de símbolos basado en los colores DMC disponibles
 * Cada color DMC obtiene un símbolo único (tipo + color)
 * @param {Array} dmcColors - Array de colores DMC del rgb-dmc.json
 * @returns {Object} Mapeo de hex color -> información de símbolo + color
 */
export const createSymbolMap = (dmcColors) => {
  const symbolMap = {};
  
  if (!Array.isArray(dmcColors)) {
    console.error('dmcColors is not an array:', dmcColors);
    return symbolMap;
  }
  
  dmcColors.forEach((color, index) => {
    if (!color.hex) {
      console.warn(`Color at index ${index} missing hex property`, color);
      return;
    }
    
    const symbolPattern = symbolPatterns[index % symbolPatterns.length];
    
    // El hex viene sin #, agregamos # para consistencia
    const colorKey = '#' + color.hex;
    
    symbolMap[colorKey] = {
      symbolType: symbolPattern.symbolType,
      color: symbolPattern.color,
      colorName: symbolPattern.colorName,
    };
  });
  
  console.log(`✓ Symbol map created for ${Object.keys(symbolMap).length} DMC colors`);
  return symbolMap;
};


/**
 * Obtiene la información del símbolo para un color específico
 * @param {string} hex - Color en formato hex
 * @param {Object} symbolMap - Mapa de símbolos
 * @returns {Object} Información del símbolo (symbolType, color, colorName)
 */
export const getSymbolForColor = (hex, symbolMap) => {
  if (!symbolMap || !symbolMap[hex]) {
    return {
      symbolType: 'dot',
      color: 'rgb(120, 120, 120)',
      colorName: 'gray',
    };
  }
  return symbolMap[hex];
};

/**
 * Dibuja un símbolo específico en el canvas con su color asignado
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {number} x - Posición X del cuadrado
 * @param {number} y - Posición Y del cuadrado
 * @param {number} size - Tamaño del cuadrado
 * @param {string} symbolType - Tipo de símbolo
 * @param {string} color - Color RGB del símbolo (ej: 'rgb(255, 0, 0)')
 */
export const drawSymbol = (ctx, x, y, size, symbolType, color) => {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const padding = size * 0.15;

  // Configurar estilo con el color asignado
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.5, size / 16);  // Más grueso para mejor visibilidad
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (symbolType) {
    case 'dot': {
      ctx.beginPath();
      ctx.arc(centerX, centerY, size / 8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'cross': {
      // Línea horizontal
      ctx.beginPath();
      ctx.moveTo(x + padding, centerY);
      ctx.lineTo(x + size - padding, centerY);
      ctx.stroke();
      // Línea vertical
      ctx.beginPath();
      ctx.moveTo(centerX, y + padding);
      ctx.lineTo(centerX, y + size - padding);
      ctx.stroke();
      break;
    }

    case 'xCross': {
      // Diagonal /
      ctx.beginPath();
      ctx.moveTo(x + padding, y + size - padding);
      ctx.lineTo(x + size - padding, y + padding);
      ctx.stroke();
      // Diagonal \
      ctx.beginPath();
      ctx.moveTo(x + padding, y + padding);
      ctx.lineTo(x + size - padding, y + size - padding);
      ctx.stroke();
      break;
    }

    case 'plus': {
      // Igual a cross pero más grueso
      ctx.lineWidth = Math.max(2, size / 12);
      // Horizontal
      ctx.beginPath();
      ctx.moveTo(x + padding, centerY);
      ctx.lineTo(x + size - padding, centerY);
      ctx.stroke();
      // Vertical
      ctx.beginPath();
      ctx.moveTo(centerX, y + padding);
      ctx.lineTo(centerX, y + size - padding);
      ctx.stroke();
      break;
    }

    case 'star': {
      // Estrella simple de 5 puntas
      const innerRadius = size / 8;
      const outerRadius = size / 4;
      const spikes = 5;

      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / spikes - Math.PI / 2;
        const px = centerX + Math.cos(angle) * radius;
        const py = centerY + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'heart': {
      // Corazón simple
      const w = size / 3;
      const h = size / 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + h / 2);
      ctx.bezierCurveTo(
        centerX - w, centerY - h / 2,
        centerX - w * 1.5, centerY - h / 2,
        centerX, centerY - h
      );
      ctx.bezierCurveTo(
        centerX + w * 1.5, centerY - h / 2,
        centerX + w, centerY - h / 2,
        centerX, centerY + h / 2
      );
      ctx.fill();
      break;
    }

    case 'diamond': {
      // Rombo
      ctx.beginPath();
      ctx.moveTo(centerX, y + padding);
      ctx.lineTo(x + size - padding, centerY);
      ctx.lineTo(centerX, y + size - padding);
      ctx.lineTo(x + padding, centerY);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'square': {
      // Cuadrado relleno
      const squareSize = size / 2.5;
      ctx.fillRect(
        centerX - squareSize / 2,
        centerY - squareSize / 2,
        squareSize,
        squareSize
      );
      break;
    }

    case 'triangle': {
      // Triángulo hacia arriba
      ctx.beginPath();
      ctx.moveTo(centerX, y + padding);
      ctx.lineTo(x + size - padding, y + size - padding);
      ctx.lineTo(x + padding, y + size - padding);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'circle': {
      // Círculo vacío
      ctx.beginPath();
      ctx.arc(centerX, centerY, size / 5, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'line': {
      // Línea horizontal gruesa
      ctx.lineWidth = Math.max(2, size / 12);
      ctx.beginPath();
      ctx.moveTo(x + padding, centerY);
      ctx.lineTo(x + size - padding, centerY);
      ctx.stroke();
      break;
    }

    case 'slash': {
      // Diagonal /
      ctx.beginPath();
      ctx.moveTo(x + padding, y + size - padding);
      ctx.lineTo(x + size - padding, y + padding);
      ctx.stroke();
      break;
    }

    case 'backslash': {
      // Diagonal \
      ctx.beginPath();
      ctx.moveTo(x + padding, y + padding);
      ctx.lineTo(x + size - padding, y + size - padding);
      ctx.stroke();
      break;
    }

    case 'arrow': {
      // Flecha hacia arriba
      ctx.lineWidth = Math.max(1, size / 18);
      ctx.beginPath();
      ctx.moveTo(centerX, y + padding);
      ctx.lineTo(centerX, y + size - padding);
      ctx.stroke();
      // Punta superior
      ctx.beginPath();
      ctx.moveTo(centerX - size / 8, y + padding + size / 8);
      ctx.lineTo(centerX, y + padding);
      ctx.lineTo(centerX + size / 8, y + padding + size / 8);
      ctx.stroke();
      break;
    }

    case 'checkmark': {
      // Marca de verificación
      ctx.lineWidth = Math.max(1, size / 16);
      ctx.beginPath();
      ctx.moveTo(x + padding, centerY);
      ctx.lineTo(centerX - padding / 2, y + size - padding);
      ctx.lineTo(x + size - padding, y + padding);
      ctx.stroke();
      break;
    }

    case 'x': {
      // X simple
      ctx.beginPath();
      ctx.moveTo(x + padding, y + padding);
      ctx.lineTo(x + size - padding, y + size - padding);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + size - padding, y + padding);
      ctx.lineTo(x + padding, y + size - padding);
      ctx.stroke();
      break;
    }

    case 'asterisk': {
      // Asterisco
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const px1 = centerX + Math.cos(angle) * size / 6;
        const py1 = centerY + Math.sin(angle) * size / 6;
        const px2 = centerX - Math.cos(angle) * size / 6;
        const py2 = centerY - Math.sin(angle) * size / 6;
        ctx.beginPath();
        ctx.moveTo(px2, py2);
        ctx.lineTo(px1, py1);
        ctx.stroke();
      }
      break;
    }

    case 'hash': {
      // Símbolo # (dos líneas horizontales + dos verticales)
      const offset = size / 4;
      ctx.lineWidth = Math.max(1, size / 20);
      ctx.beginPath();
      ctx.moveTo(x + padding, centerY - offset);
      ctx.lineTo(x + size - padding, centerY - offset);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + padding, centerY + offset);
      ctx.lineTo(x + size - padding, centerY + offset);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX - offset, y + padding);
      ctx.lineTo(centerX - offset, y + size - padding);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX + offset, y + padding);
      ctx.lineTo(centerX + offset, y + size - padding);
      ctx.stroke();
      break;
    }

    case 'percent': {
      // Símbolo % (dos puntos + línea diagonal)
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + size / 4, y + size / 4, size / 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + size * 0.75, y + size * 0.75, size / 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, size / 20);
      ctx.beginPath();
      ctx.moveTo(x + padding, y + size - padding);
      ctx.lineTo(x + size - padding, y + padding);
      ctx.stroke();
      break;
    }

    // NÚMEROS (0-9)
    case 'num0': {
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, size / 6, size / 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'num1': {
      ctx.beginPath();
      ctx.moveTo(centerX, y + padding);
      ctx.lineTo(centerX, y + size - padding);
      ctx.stroke();
      break;
    }
    case 'num2': {
      ctx.beginPath();
      ctx.moveTo(centerX - size / 6, y + padding + size / 10);
      ctx.quadraticCurveTo(centerX + size / 6, y + padding, centerX - size / 6, centerY);
      ctx.lineTo(centerX + size / 6, y + size - padding);
      ctx.stroke();
      break;
    }
    case 'num3': {
      ctx.beginPath();
      ctx.moveTo(x + padding, y + padding);
      ctx.lineTo(x + size - padding, y + padding);
      ctx.lineTo(x + padding, centerY);
      ctx.lineTo(x + size - padding, centerY);
      ctx.lineTo(x + padding, y + size - padding);
      ctx.lineTo(x + size - padding, y + size - padding);
      ctx.stroke();
      break;
    }
    case 'num4': {
      ctx.beginPath();
      ctx.moveTo(x + size - padding, y + padding);
      ctx.lineTo(x + padding, centerY);
      ctx.lineTo(x + size - padding, centerY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + size - padding, centerY);
      ctx.lineTo(x + size - padding, y + size - padding);
      ctx.stroke();
      break;
    }
    case 'num5': {
      ctx.beginPath();
      ctx.moveTo(x + size - padding, y + padding);
      ctx.lineTo(x + padding, y + padding);
      ctx.lineTo(x + padding, centerY);
      ctx.quadraticCurveTo(x + size - padding, centerY + size / 10, x + padding, y + size - padding);
      ctx.stroke();
      break;
    }
    case 'num6': {
      ctx.beginPath();
      ctx.moveTo(x + size - padding, y + padding);
      ctx.lineTo(x + padding, y + padding);
      ctx.lineTo(x + padding, centerY + size / 6);
      ctx.arc(centerX, centerY + size / 6, size / 6, Math.PI, 0);
      ctx.stroke();
      break;
    }
    case 'num7': {
      ctx.beginPath();
      ctx.moveTo(x + padding, y + padding);
      ctx.lineTo(x + size - padding, y + padding);
      ctx.lineTo(x + padding, y + size - padding);
      ctx.stroke();
      break;
    }
    case 'num8': {
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - size / 8, size / 6, size / 8, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + size / 8, size / 6, size / 8, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'num9': {
      ctx.beginPath();
      ctx.arc(centerX, centerY - size / 6, size / 6, 0, Math.PI);
      ctx.lineTo(x + size - padding, centerY - size / 6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + size - padding, centerY - size / 6);
      ctx.lineTo(x + size - padding, y + size - padding);
      ctx.stroke();
      break;
    }

    // LETRAS (A, B, C, D, E, U, V, W, X, Y, Z)
    case 'letterA': {
      ctx.beginPath();
      ctx.moveTo(x + padding, y + size - padding);
      ctx.lineTo(centerX, y + padding);
      ctx.lineTo(x + size - padding, y + size - padding);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX - size / 6, centerY);
      ctx.lineTo(centerX + size / 6, centerY);
      ctx.stroke();
      break;
    }
    case 'letterB': {
      ctx.beginPath();
      ctx.moveTo(x + padding, y + padding);
      ctx.lineTo(x + size - padding - size / 8, y + padding);
      ctx.arc(x + size - padding - size / 8, centerY - size / 8, size / 8, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(x + padding, centerY);
      ctx.moveTo(x + padding, centerY);
      ctx.lineTo(x + size - padding - size / 8, centerY);
      ctx.arc(x + size - padding - size / 8, centerY + size / 8, size / 8, Math.PI / 2, -Math.PI / 2, true);
      ctx.lineTo(x + padding, y + size - padding);
      ctx.stroke();
      break;
    }
    case 'letterC': {
      ctx.beginPath();
      ctx.arc(centerX, centerY, size / 5, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      break;
    }
    case 'letterD': {
      ctx.beginPath();
      ctx.moveTo(x + padding, y + padding);
      ctx.lineTo(x + padding, y + size - padding);
      ctx.arc(x + padding + size / 5, centerY, size / 5, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(x + padding, y + padding);
      ctx.stroke();
      break;
    }
    case 'letterE': {
      ctx.beginPath();
      ctx.moveTo(x + size - padding, y + padding);
      ctx.lineTo(x + padding, y + padding);
      ctx.lineTo(x + padding, y + size - padding);
      ctx.lineTo(x + size - padding, y + size - padding);
      ctx.moveTo(x + padding, centerY);
      ctx.lineTo(x + size - padding - size / 8, centerY);
      ctx.stroke();
      break;
    }
    case 'letterU': {
      ctx.beginPath();
      ctx.moveTo(x + padding, y + padding);
      ctx.lineTo(x + padding, centerY + size / 6);
      ctx.arc(centerX, centerY + size / 6, size / 5, Math.PI, 0);
      ctx.lineTo(x + size - padding, y + padding);
      ctx.stroke();
      break;
    }
    case 'letterV': {
      ctx.beginPath();
      ctx.moveTo(x + padding, y + padding);
      ctx.lineTo(centerX, y + size - padding);
      ctx.lineTo(x + size - padding, y + padding);
      ctx.stroke();
      break;
    }
    case 'letterW': {
      ctx.beginPath();
      ctx.moveTo(x + padding, y + padding);
      ctx.lineTo(x + padding + size / 5, y + size - padding);
      ctx.lineTo(centerX, y + padding + size / 6);
      ctx.lineTo(x + size - padding - size / 5, y + size - padding);
      ctx.lineTo(x + size - padding, y + padding);
      ctx.stroke();
      break;
    }
    case 'letterX': {
      ctx.beginPath();
      ctx.moveTo(x + padding, y + padding);
      ctx.lineTo(x + size - padding, y + size - padding);
      ctx.moveTo(x + size - padding, y + padding);
      ctx.lineTo(x + padding, y + size - padding);
      ctx.stroke();
      break;
    }
    case 'letterY': {
      ctx.beginPath();
      ctx.moveTo(x + padding, y + padding);
      ctx.lineTo(centerX, centerY);
      ctx.lineTo(x + size - padding, y + padding);
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX, y + size - padding);
      ctx.stroke();
      break;
    }
    case 'letterZ': {
      ctx.beginPath();
      ctx.moveTo(x + padding, y + padding);
      ctx.lineTo(x + size - padding, y + padding);
      ctx.lineTo(x + padding, y + size - padding);
      ctx.lineTo(x + size - padding, y + size - padding);
      ctx.stroke();
      break;
    }
    
    case 'letterF': {
      ctx.beginPath();
      ctx.moveTo(x + size - padding, y + padding);
      ctx.lineTo(x + padding, y + padding);
      ctx.lineTo(x + padding, y + size - padding);
      ctx.moveTo(x + padding, centerY);
      ctx.lineTo(x + size - padding - size / 8, centerY);
      ctx.stroke();
      break;
    }
    case 'letterG': {
      ctx.beginPath();
      ctx.arc(centerX, centerY, size / 5, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(x + size - padding - size / 8, centerY);
      ctx.stroke();
      break;
    }
    case 'letterH': {
      ctx.beginPath();
      ctx.moveTo(x + padding, y + padding);
      ctx.lineTo(x + padding, y + size - padding);
      ctx.moveTo(x + size - padding, y + padding);
      ctx.lineTo(x + size - padding, y + size - padding);
      ctx.moveTo(x + padding, centerY);
      ctx.lineTo(x + size - padding, centerY);
      ctx.stroke();
      break;
    }
    case 'letterI': {
      ctx.beginPath();
      ctx.moveTo(centerX, y + padding);
      ctx.lineTo(centerX, y + size - padding);
      ctx.moveTo(x + padding, y + padding);
      ctx.lineTo(x + size - padding, y + padding);
      ctx.moveTo(x + padding, y + size - padding);
      ctx.lineTo(x + size - padding, y + size - padding);
      ctx.stroke();
      break;
    }
    case 'letterJ': {
      ctx.beginPath();
      ctx.moveTo(x + size - padding, y + padding);
      ctx.lineTo(x + size - padding, centerY + size / 6);
      ctx.arc(centerX, centerY + size / 6, size / 5, 0, -Math.PI / 2);
      ctx.lineTo(x + padding, y + padding);
      ctx.stroke();
      break;
    }
    case 'letterK': {
      ctx.beginPath();
      ctx.moveTo(x + padding, y + padding);
      ctx.lineTo(x + padding, y + size - padding);
      ctx.moveTo(x + size - padding, y + padding);
      ctx.lineTo(x + padding, centerY);
      ctx.lineTo(x + size - padding, y + size - padding);
      ctx.stroke();
      break;
    }
    case 'letterL': {
      ctx.beginPath();
      ctx.moveTo(x + padding, y + padding);
      ctx.lineTo(x + padding, y + size - padding);
      ctx.lineTo(x + size - padding, y + size - padding);
      ctx.stroke();
      break;
    }
    case 'letterM': {
      ctx.beginPath();
      ctx.moveTo(x + padding, y + size - padding);
      ctx.lineTo(x + padding, y + padding);
      ctx.lineTo(centerX, centerY);
      ctx.lineTo(x + size - padding, y + padding);
      ctx.lineTo(x + size - padding, y + size - padding);
      ctx.stroke();
      break;
    }
    case 'letterN': {
      ctx.beginPath();
      ctx.moveTo(x + padding, y + size - padding);
      ctx.lineTo(x + padding, y + padding);
      ctx.lineTo(x + size - padding, y + size - padding);
      ctx.lineTo(x + size - padding, y + padding);
      ctx.stroke();
      break;
    }
    case 'letterO': {
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, size / 4, size / 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'letterP': {
      ctx.beginPath();
      ctx.moveTo(x + padding, y + size - padding);
      ctx.lineTo(x + padding, y + padding);
      ctx.lineTo(x + size - padding - size / 8, y + padding);
      ctx.arc(x + size - padding - size / 8, centerY - size / 8, size / 8, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(x + padding, centerY);
      ctx.stroke();
      break;
    }
    case 'letterQ': {
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - size / 8, size / 4, size / 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX + size / 5, centerY + size / 8);
      ctx.lineTo(x + size - padding, y + size - padding);
      ctx.stroke();
      break;
    }
    case 'letterR': {
      ctx.beginPath();
      ctx.moveTo(x + padding, y + size - padding);
      ctx.lineTo(x + padding, y + padding);
      ctx.lineTo(x + size - padding - size / 8, y + padding);
      ctx.arc(x + size - padding - size / 8, centerY - size / 8, size / 8, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(x + padding, centerY);
      ctx.lineTo(x + size - padding, y + size - padding);
      ctx.stroke();
      break;
    }
    case 'letterS': {
      ctx.beginPath();
      ctx.moveTo(x + size - padding, y + padding);
      ctx.lineTo(x + padding, y + padding);
      ctx.lineTo(x + padding, centerY);
      ctx.lineTo(x + size - padding, centerY);
      ctx.lineTo(x + size - padding, y + size - padding);
      ctx.lineTo(x + padding, y + size - padding);
      ctx.stroke();
      break;
    }
    case 'letterT': {
      ctx.beginPath();
      ctx.moveTo(x + padding, y + padding);
      ctx.lineTo(x + size - padding, y + padding);
      ctx.moveTo(centerX, y + padding);
      ctx.lineTo(centerX, y + size - padding);
      ctx.stroke();
      break;
    }

    // SÍMBOLOS GEOMÉTRICOS
    case 'pentagon': {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const px = centerX + (size / 5) * Math.cos(angle);
        const py = centerY + (size / 5) * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case 'hexagon': {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * 2 * Math.PI) / 6;
        const px = centerX + (size / 5) * Math.cos(angle);
        const py = centerY + (size / 5) * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case 'octagon': {
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (i * 2 * Math.PI) / 8;
        const px = centerX + (size / 5) * Math.cos(angle);
        const py = centerY + (size / 5) * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case 'decagon': {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const angle = (i * 2 * Math.PI) / 10;
        const px = centerX + (size / 5) * Math.cos(angle);
        const py = centerY + (size / 5) * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case 'semicircle': {
      ctx.beginPath();
      ctx.arc(centerX, centerY, size / 5, 0, Math.PI);
      ctx.lineTo(centerX - size / 5, centerY);
      ctx.stroke();
      break;
    }

    // FLECHAS DIRECCIONALES
    case 'arrowUp': {
      ctx.beginPath();
      ctx.moveTo(centerX, y + padding);
      ctx.lineTo(centerX, y + size - padding);
      ctx.lineTo(centerX - size / 8, y + size - padding - size / 6);
      ctx.moveTo(centerX, y + size - padding);
      ctx.lineTo(centerX + size / 8, y + size - padding - size / 6);
      ctx.stroke();
      break;
    }
    case 'arrowDown': {
      ctx.beginPath();
      ctx.moveTo(centerX, y + padding);
      ctx.lineTo(centerX, y + size - padding);
      ctx.lineTo(centerX - size / 8, y + padding + size / 6);
      ctx.moveTo(centerX, y + padding);
      ctx.lineTo(centerX + size / 8, y + padding + size / 6);
      ctx.stroke();
      break;
    }
    case 'arrowLeft': {
      ctx.beginPath();
      ctx.moveTo(x + size - padding, centerY);
      ctx.lineTo(x + padding, centerY);
      ctx.lineTo(x + padding + size / 6, centerY - size / 8);
      ctx.moveTo(x + padding, centerY);
      ctx.lineTo(x + padding + size / 6, centerY + size / 8);
      ctx.stroke();
      break;
    }
    case 'arrowRight': {
      ctx.beginPath();
      ctx.moveTo(x + padding, centerY);
      ctx.lineTo(x + size - padding, centerY);
      ctx.lineTo(x + size - padding - size / 6, centerY - size / 8);
      ctx.moveTo(x + size - padding, centerY);
      ctx.lineTo(x + size - padding - size / 6, centerY + size / 8);
      ctx.stroke();
      break;
    }

    // SÍMBOLOS ESPECIALES
    case 'quoteMark': {
      ctx.beginPath();
      ctx.arc(x + size / 4, y + size / 4, size / 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + size / 4, y + size / 3);
      ctx.lineTo(x + size / 4, y + size - padding);
      ctx.stroke();
      break;
    }
    case 'doubleQuote': {
      ctx.beginPath();
      ctx.arc(x + size / 5, y + size / 4, size / 10, 0, Math.PI * 2);
      ctx.arc(x + 3 * size / 5, y + size / 4, size / 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + size / 5, y + size / 3);
      ctx.lineTo(x + size / 5, y + size - padding);
      ctx.moveTo(x + 3 * size / 5, y + size / 3);
      ctx.lineTo(x + 3 * size / 5, y + size - padding);
      ctx.stroke();
      break;
    }
    case 'parenthesis': {
      ctx.beginPath();
      ctx.arc(centerX + size / 8, centerY, size / 5, -Math.PI / 4, Math.PI / 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX - size / 8, centerY, size / 5, 3 * Math.PI / 4, 5 * Math.PI / 4);
      ctx.stroke();
      break;
    }
    case 'bracket': {
      ctx.beginPath();
      ctx.moveTo(x + size - padding, y + padding);
      ctx.lineTo(x + padding, y + padding);
      ctx.lineTo(x + padding, y + size - padding);
      ctx.lineTo(x + size - padding, y + size - padding);
      ctx.stroke();
      break;
    }
    case 'equals': {
      ctx.beginPath();
      ctx.moveTo(x + padding, centerY - size / 8);
      ctx.lineTo(x + size - padding, centerY - size / 8);
      ctx.moveTo(x + padding, centerY + size / 8);
      ctx.lineTo(x + size - padding, centerY + size / 8);
      ctx.stroke();
      break;
    }
    case 'minus': {
      ctx.beginPath();
      ctx.moveTo(x + padding, centerY);
      ctx.lineTo(x + size - padding, centerY);
      ctx.stroke();
      break;
    }
    case 'multiply': {
      ctx.beginPath();
      ctx.moveTo(x + padding, y + padding);
      ctx.lineTo(x + size - padding, y + size - padding);
      ctx.moveTo(x + size - padding, y + padding);
      ctx.lineTo(x + padding, y + size - padding);
      ctx.stroke();
      break;
    }
    case 'divide': {
      ctx.beginPath();
      ctx.arc(centerX, centerY - size / 6, size / 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + padding, y + size - padding);
      ctx.lineTo(x + size - padding, y + padding);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX, centerY + size / 6, size / 16, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    // SÍMBOLOS VARIADOS
    case 'sun': {
      ctx.beginPath();
      ctx.arc(centerX, centerY, size / 8, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const x1 = centerX + (size / 4.5) * Math.cos(angle);
        const y1 = centerY + (size / 4.5) * Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + (size / 12) * Math.cos(angle), y1 + (size / 12) * Math.sin(angle));
        ctx.stroke();
      }
      break;
    }
    case 'moon': {
      ctx.beginPath();
      ctx.arc(centerX, centerY, size / 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX + size / 10, centerY, size / 6, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.strokeStyle = color;
      break;
    }
    case 'star2': {
      ctx.beginPath();
      const innerRadius = size / 10;
      const outerRadius = size / 4;
      for (let i = 0; i < 10; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const px = centerX + Math.cos(angle) * radius;
        const py = centerY + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'cloud': {
      ctx.beginPath();
      ctx.arc(centerX - size / 8, centerY, size / 8, 0, Math.PI * 2);
      ctx.arc(centerX + size / 8, centerY, size / 8, 0, Math.PI * 2);
      ctx.arc(centerX, centerY + size / 8, size / 8, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'note': {
      ctx.beginPath();
      ctx.arc(centerX + size / 6, y + size - padding - size / 8, size / 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX + size / 6, y + size - padding - size / 4);
      ctx.lineTo(centerX + size / 6, y + padding);
      ctx.stroke();
      break;
    }
    case 'spiral': {
      ctx.beginPath();
      for (let i = 0; i < 360; i += 10) {
        const angle = (i * Math.PI) / 180;
        const r = (i / 360) * (size / 3);
        const px = centerX + r * Math.cos(angle);
        const py = centerY + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      break;
    }
    case 'wave': {
      ctx.beginPath();
      for (let i = 0; i <= size; i += 2) {
        const y_pos = centerY + (size / 10) * Math.sin((i / size) * Math.PI * 2);
        if (i === 0) ctx.moveTo(x + i, y_pos);
        else ctx.lineTo(x + i, y_pos);
      }
      ctx.stroke();
      break;
    }
    case 'zigzag': {
      ctx.beginPath();
      ctx.moveTo(x + padding, y + padding);
      for (let i = 0; i < 4; i++) {
        ctx.lineTo(x + padding + (i + 1) * ((size - 2 * padding) / 4), i % 2 === 0 ? y + size - padding : y + padding);
      }
      ctx.stroke();
      break;
    }
    case 'dotted': {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.arc(x + padding + i * ((size - 2 * padding) / 4), centerY, size / 20, 0, Math.PI * 2);
      }
      ctx.fill();
      break;
    }
    case 'dashed': {
      ctx.setLineDash([size / 10, size / 10]);
      ctx.beginPath();
      ctx.moveTo(x + padding, centerY);
      ctx.lineTo(x + size - padding, centerY);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    }
    case 'ring': {
      ctx.beginPath();
      ctx.arc(centerX, centerY, size / 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX, centerY, size / 8, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'target': {
      ctx.beginPath();
      ctx.arc(centerX, centerY, size / 5, 0, Math.PI * 2);
      ctx.arc(centerX, centerY, size / 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + padding, centerY);
      ctx.lineTo(x + size - padding, centerY);
      ctx.moveTo(centerX, y + padding);
      ctx.lineTo(centerX, y + size - padding);
      ctx.stroke();
      break;
    }
    case 'cross2': {
      ctx.lineWidth = Math.max(2, size / 12);
      ctx.beginPath();
      ctx.moveTo(centerX, y + padding);
      ctx.lineTo(centerX, y + size - padding);
      ctx.moveTo(x + padding, centerY);
      ctx.lineTo(x + size - padding, centerY);
      ctx.stroke();
      break;
    }
    case 'swirl': {
      ctx.beginPath();
      for (let i = 0; i < 720; i += 10) {
        const angle = (i * Math.PI) / 180;
        const r = (i / 720) * (size / 3);
        const px = centerX + r * Math.cos(angle);
        const py = centerY + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      break;
    }

    default: {
      // Fallback a punto
      ctx.beginPath();
      ctx.arc(centerX, centerY, size / 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};
