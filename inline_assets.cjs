const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, 'dist', 'index.html');
let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

// Load GLB files and convert to base64 data URIs
const pwhPath = path.join(__dirname, 'public', 'pwh.glb');
const tabPath = path.join(__dirname, 'public', 'tab.glb');

const pwhBase64 = fs.readFileSync(pwhPath, 'base64');
const tabBase64 = fs.readFileSync(tabPath, 'base64');

const pwhDataUri = `data:model/gltf-binary;base64,${pwhBase64}`;
const tabDataUri = `data:model/gltf-binary;base64,${tabBase64}`;

// Inject single base64 variables into global window object to avoid duplicating 40MB strings 4+ times
const injectScript = `<script>window._PWH_GLB="${pwhDataUri}";window._TAB_GLB="${tabDataUri}";</script>`;
htmlContent = htmlContent.replace('<head>', `<head>${injectScript}`);

// Replace all quote variants of '/pwh.glb' and '/tab.glb' with global JS variable reference
htmlContent = htmlContent.replaceAll("'/pwh.glb'", 'window._PWH_GLB');
htmlContent = htmlContent.replaceAll('"/pwh.glb"', 'window._PWH_GLB');
htmlContent = htmlContent.replaceAll('`/pwh.glb`', 'window._PWH_GLB');

htmlContent = htmlContent.replaceAll("'/tab.glb'", 'window._TAB_GLB');
htmlContent = htmlContent.replaceAll('"/tab.glb"', 'window._TAB_GLB');
htmlContent = htmlContent.replaceAll('`/tab.glb`', 'window._TAB_GLB');



const outputPath = path.join(__dirname, 'presser_standalone.html');
fs.writeFileSync(outputPath, htmlContent);

console.log('Successfully created presser_standalone.html!');
