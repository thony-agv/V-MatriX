// build.js - Script de build
const fs = require('fs');
const path = require('path');

console.log('🚀 Preparando V-MatriX para producción...');

// Crear directorio build si no existe
const buildDir = './dist';
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
    console.log('📁 Creando directorio dist/');
}

// Copiar archivos HTML
const filesToCopy = [
    'index.html',
    'calculator.html'
];

filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(buildDir, file));
        console.log(`📄 Copiado: ${file}`);
    }
});

// Copiar carpetas completas
const foldersToCopy = [
    'css',
    'js',
    'assets'
];

foldersToCopy.forEach(folder => {
    if (fs.existsSync(folder)) {
        copyFolderRecursiveSync(folder, path.join(buildDir, folder));
        console.log(`📂 Copiada carpeta: ${folder}/`);
    }
});

// Función para copiar carpetas recursivamente
function copyFolderRecursiveSync(source, target) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target);
    }

    if (fs.lstatSync(source).isDirectory()) {
        const files = fs.readdirSync(source);
        files.forEach(file => {
            const curSource = path.join(source, file);
            const curTarget = path.join(target, file);
            if (fs.lstatSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, curTarget);
            } else {
                fs.copyFileSync(curSource, curTarget);
            }
        });
    }
}

console.log('✅ Build completado! Directorio dist/ listo para deploy.');