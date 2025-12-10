/**
 * Barcode Generation Utilities
 * Supports EAN-13, Code128, and simple product codes
 */

/**
 * Generate EAN-13 barcode (13 digits)
 * Format: Country(3) + Manufacturer(4-6) + Product(3-5) + Check digit(1)
 */
export function generateEAN13(productId: string): string {
  const countryCode = '621'; // Philippines
  const manufacturerCode = '0001'; // PSU default
  
  // Use last 4 digits of product ID or random
  const productCode = productId.slice(-4).padStart(4, '0');
  
  // First 12 digits
  const barcode12 = countryCode + manufacturerCode + productCode + '0';
  
  // Calculate check digit
  const checkDigit = calculateEAN13CheckDigit(barcode12);
  
  return barcode12 + checkDigit;
}

/**
 * Calculate EAN-13 check digit
 */
function calculateEAN13CheckDigit(barcode12: string): string {
  let sum = 0;
  
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(barcode12[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit.toString();
}

/**
 * Generate Code128 barcode from product code
 * This is simpler and works with alphanumeric codes
 */
export function generateCode128(productCode: string): string {
  // Code128 can encode any ASCII character
  // For simplicity, we'll just use the product code as-is
  return productCode.toUpperCase();
}

/**
 * Generate simple numeric barcode (12 digits)
 * Format: Timestamp(6) + Sequential(6)
 */
export function generateSimpleBarcode(sequential: number): string {
  const timestamp = Date.now().toString().slice(-6);
  const seqStr = sequential.toString().padStart(6, '0');
  return timestamp + seqStr;
}

/**
 * Validate EAN-13 barcode
 */
export function validateEAN13(barcode: string): boolean {
  if (!/^\d{13}$/.test(barcode)) return false;
  
  const checkDigit = barcode[12];
  const calculatedCheckDigit = calculateEAN13CheckDigit(barcode.slice(0, 12));
  
  return checkDigit === calculatedCheckDigit;
}

/**
 * Generate barcode SVG for printing
 * Uses a simple bar pattern for Code128
 */
export function generateBarcodeSVG(
  barcode: string,
  options: {
    width?: number;
    height?: number;
    displayValue?: boolean;
    fontSize?: number;
  } = {}
): string {
  const {
    width = 200,
    height = 80,
    displayValue = true,
    fontSize = 12,
  } = options;

  // Simple bar generation (alternating black/white)
  // In production, use a proper barcode library like JsBarcode
  const bars: number[] = [];
  for (let i = 0; i < barcode.length; i++) {
    const charCode = barcode.charCodeAt(i);
    // Generate bar pattern based on character
    bars.push(charCode % 2 === 0 ? 1 : 0);
    bars.push(1);
  }

  const barWidth = width / bars.length;
  let x = 0;
  
  let barsSVG = '';
  bars.forEach((bar) => {
    if (bar === 1) {
      barsSVG += `<rect x="${x}" y="0" width="${barWidth}" height="${height - (displayValue ? 20 : 0)}" fill="black"/>`;
    }
    x += barWidth;
  });

  const valueSVG = displayValue
    ? `<text x="${width / 2}" y="${height - 5}" text-anchor="middle" font-size="${fontSize}" font-family="monospace">${barcode}</text>`
    : '';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      ${barsSVG}
      ${valueSVG}
    </svg>
  `;
}

/**
 * Generate printable barcode label HTML
 */
export function generateBarcodeLabelHTML(
  product: {
    code: string;
    name: string;
    barcode: string;
    unitPrice: number;
  },
  options: {
    includePrice?: boolean;
    includeProductName?: boolean;
    size?: 'small' | 'medium' | 'large';
  } = {}
): string {
  const {
    includePrice = true,
    includeProductName = true,
    size = 'medium',
  } = options;

  const sizes = {
    small: { width: 150, height: 60, fontSize: 8 },
    medium: { width: 200, height: 80, fontSize: 10 },
    large: { width: 300, height: 120, fontSize: 14 },
  };

  const { width, height, fontSize } = sizes[size];
  const barcodeSVG = generateBarcodeSVG(product.barcode, { width, height: height - 30, fontSize });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Barcode Label - ${product.code}</title>
      <style>
        @page {
          size: ${width}mm ${height + 20}mm;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 5mm;
          font-family: Arial, sans-serif;
        }
        .label {
          width: ${width}mm;
          height: ${height}mm;
          border: 1px dashed #ccc;
          padding: 2mm;
          text-align: center;
        }
        .product-name {
          font-size: ${fontSize + 2}px;
          font-weight: bold;
          margin-bottom: 2mm;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .barcode {
          margin: 2mm 0;
        }
        .price {
          font-size: ${fontSize + 4}px;
          font-weight: bold;
          color: #059669;
          margin-top: 2mm;
        }
        .product-code {
          font-size: ${fontSize - 2}px;
          color: #666;
        }
        @media print {
          .label {
            border: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="label">
        ${includeProductName ? `<div class="product-name">${product.name}</div>` : ''}
        <div class="barcode">
          ${barcodeSVG}
        </div>
        <div class="product-code">${product.code}</div>
        ${includePrice ? `<div class="price">₱${product.unitPrice.toFixed(2)}</div>` : ''}
      </div>
      <script>
        window.onload = () => {
          window.print();
        };
      </script>
    </body>
    </html>
  `;
}
