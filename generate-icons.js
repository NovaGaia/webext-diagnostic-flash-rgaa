#!/usr/bin/env node

/**
 * Script pour générer des icônes basiques pour l'extension
 * Utilise différentes méthodes selon les outils disponibles
 */

import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [16, 48, 128];
const iconDir = path.join(__dirname, 'icons');

// Créer le dossier icons s'il n'existe pas
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

console.log('🎨 Génération des icônes...');

/**
 * Crée un SVG simple et le convertit en PNG
 */
async function generateWithSVG() {
  try {
    // Créer un fichier SVG temporaire
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" fill="#1976d2"/>
  <g text-anchor="end">
    <text x="120" y="25" font-family="Arial, sans-serif" font-size="18" fill="white" font-weight="bold">Diag. Flash</text>
    <text x="120" y="65" font-family="Arial, sans-serif" font-size="28" fill="white" font-weight="bold">RGAA</text>
  </g>
</svg>`;
    
    const tempSvg = path.join(iconDir, 'temp.svg');
    fs.writeFileSync(tempSvg, svgContent);
    
    // Convertir le SVG en PNG avec sips (sur macOS)
    for (const size of sizes) {
      const outputPath = path.join(iconDir, `icon-${size}.png`);
      try {
        await execAsync(`sips -z ${size} ${size} -s format png "${tempSvg}" --out "${outputPath}"`);
        if (fs.existsSync(outputPath)) {
          console.log(`✓ Créé: icon-${size}.png`);
        }
      } catch (err) {
        // Si sips ne peut pas convertir SVG, essayer autre chose
        return false;
      }
    }
    
    // Supprimer le SVG temporaire
    if (fs.existsSync(tempSvg)) {
      fs.unlinkSync(tempSvg);
    }
    
    // Vérifier que les fichiers ont été créés
    const allCreated = sizes.every(size => {
      return fs.existsSync(path.join(iconDir, `icon-${size}.png`));
    });
    
    if (allCreated) {
      console.log('\n✅ Icônes générées avec succès avec SVG + sips!');
      return true;
    }
    
    return false;
  } catch (err) {
    return false;
  }
}

/**
 * Génère des icônes avec ImageMagick
 */
async function generateWithImageMagick() {
  console.log('Tentative avec ImageMagick...');
  try {
    for (const size of sizes) {
      const outputPath = path.join(iconDir, `icon-${size}.png`);
      const command = `convert -size ${size}x${size} xc:'#1976d2' -fill white -gravity center -pointsize ${Math.floor(size * 0.4)} -annotate +0+0 'RGAA' "${outputPath}"`;
      await execAsync(command);
      if (fs.existsSync(outputPath)) {
        console.log(`✓ Créé: icon-${size}.png`);
      }
    }
    
    // Vérifier que les fichiers ont été créés
    const allCreated = sizes.every(size => {
      return fs.existsSync(path.join(iconDir, `icon-${size}.png`));
    });
    
    if (allCreated) {
      console.log('\n✅ Icônes générées avec succès avec ImageMagick!');
      return true;
    }
    
    return false;
  } catch (err) {
    return false;
  }
}

/**
 * Génère des icônes basiques avec Node.js (méthode simple mais limitée)
 * Crée des fichiers PNG basiques en utilisant des données binaires PNG minimales
 */
async function generateBasicPNG() {
  console.log('Génération d\'icônes PNG basiques...');
  
  // Fonction pour créer un PNG minimal (1x1 pixel puis redimensionné)
  // Cette méthode crée des PNG valides mais très simples
  
  for (const size of sizes) {
    const outputPath = path.join(iconDir, `icon-${size}.png`);
    
    // Créer un PNG minimal en base64 (carré de couleur #1976d2)
    // Format PNG minimal : signature + IHDR + IDAT + IEND
    // On va créer un PNG 1x1 puis utiliser sips pour le redimensionner
    const png1x1 = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    
    const temp1x1 = path.join(iconDir, `temp-${size}.png`);
    fs.writeFileSync(temp1x1, png1x1);
    
    try {
      // Utiliser sips pour redimensionner et changer la couleur
      // Créer une image de la bonne taille avec la couleur
      await execAsync(`sips -z ${size} ${size} --padToHeightWidth ${size} ${size} --padColor 1976d2 "${temp1x1}" --out "${outputPath}"`);
      
      // Si ça ne marche pas, essayer une autre méthode
      if (!fs.existsSync(outputPath)) {
        // Méthode alternative : utiliser qlmanage pour convertir
        await execAsync(`qlmanage -t -s ${size} -o "${iconDir}" "${temp1x1}" 2>/dev/null || true`);
      }
      
      if (fs.existsSync(temp1x1)) {
        fs.unlinkSync(temp1x1);
      }
      
      if (fs.existsSync(outputPath)) {
        console.log(`✓ Créé: icon-${size}.png`);
      }
    } catch (err) {
      if (fs.existsSync(temp1x1)) {
        fs.unlinkSync(temp1x1);
      }
    }
  }
  
  const allCreated = sizes.every(size => {
    return fs.existsSync(path.join(iconDir, `icon-${size}.png`));
  });
  
  return allCreated;
}

// Essayer différentes méthodes dans l'ordre
(async () => {
  // Méthode 1 : SVG + sips (macOS)
  const svgResult = await generateWithSVG();
  if (svgResult) {
    process.exit(0);
  }
  
  // Méthode 2 : ImageMagick
  const imagemagickResult = await generateWithImageMagick();
  if (imagemagickResult) {
    process.exit(0);
  }
  
  // Méthode 3 : PNG basiques
  const basicResult = await generateBasicPNG();
  if (basicResult) {
    console.log('\n✅ Icônes basiques générées!');
    process.exit(0);
  }
  
  // Si aucune méthode ne fonctionne
  console.log('\n⚠️  Aucun outil de génération d\'images trouvé.');
  console.log('\nPour créer les icônes manuellement:');
  console.log('1. Créez des images PNG de 16x16, 48x48 et 128x128 pixels');
  console.log('2. Placez-les dans le dossier icons/');
  console.log('3. Nommez-les: icon-16.png, icon-48.png, icon-128.png\n');
  console.log('💡 Note: Les icônes sont optionnelles. L\'extension fonctionne sans elles!');
  console.log('💡 Astuce: Vous pouvez utiliser un outil en ligne comme https://www.favicon-generator.org/');
  process.exit(1);
})();