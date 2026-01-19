const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputSvg = path.join(__dirname, '../public/logotipo-contaFlow.svg');
const outputDir = path.join(__dirname, '../public');

// Tamaños de favicons a generar
const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
];

async function generateFavicons() {
  try {
    console.log('Generando favicons desde:', inputSvg);
    
    // Generar cada tamaño
    for (const { size, name } of sizes) {
      const outputPath = path.join(outputDir, name);
      await sharp(inputSvg)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      console.log(`✓ Generado: ${name} (${size}x${size})`);
    }

    // Generar favicon.ico (multi-resolución)
    // Para favicon.ico necesitamos múltiples tamaños en un solo archivo
    // Sharp no soporta ICO directamente, así que generaremos un PNG de 32x32 como favicon.ico
    // (Next.js puede usar PNG como favicon)
    const faviconPath = path.join(outputDir, 'favicon.ico');
    await sharp(inputSvg)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(faviconPath);
    console.log('✓ Generado: favicon.ico');

    console.log('\n✅ Todos los favicons han sido generados exitosamente!');
  } catch (error) {
    console.error('❌ Error al generar favicons:', error);
    process.exit(1);
  }
}

generateFavicons();
