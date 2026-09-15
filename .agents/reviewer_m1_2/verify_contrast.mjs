import { getContrastRatio } from '../../tests/e2e/helpers/contrast.mjs';

const backgrounds = {
  'black (#000000)': '#000000',
  'surface (#0a0a0a)': '#0a0a0a',
  'card (#171717)': '#171717',
  'elevated (#262626)': '#262626'
};

const texts = {
  'white (#ffffff)': '#ffffff',
  'neutral-200 (#e5e5e5)': '#e5e5e5',
  'neutral-300 (#d4d4d4)': '#d4d4d4',
  'neutral-400 (#a3a3a3)': '#a3a3a3',
  'red-400 (#f87171)': '#f87171',
  'green-400 (#4ade80)': '#4ade80',
  'blue-400 (#60a5fa)': '#60a5fa'
};

console.log('--- TEXT CONTRASTS (Requirement: >= 4.5:1) ---');
for (const [bgName, bgHex] of Object.entries(backgrounds)) {
  for (const [textName, textHex] of Object.entries(texts)) {
    const ratio = getContrastRatio(textHex, bgHex);
    const pass = ratio >= 4.5 ? 'PASS' : 'FAIL';
    console.log(`${pass}: ${textName} on ${bgName} = ${ratio.toFixed(2)}:1`);
  }
}

console.log('\n--- UI BOUNDARY CONTRASTS (Requirement: >= 3.0:1) ---');
const borders = {
  'white focus-ring (#ffffff)': '#ffffff',
  'neutral-400 step border (#a3a3a3)': '#a3a3a3',
  'neutral-600 status border (#525252)': '#525252',
  'neutral-700 subtle border (#404040)': '#404040'
};

for (const [bgName, bgHex] of Object.entries(backgrounds)) {
  for (const [borderName, borderHex] of Object.entries(borders)) {
    const ratio = getContrastRatio(borderHex, bgHex);
    const pass = ratio >= 3.0 ? 'PASS' : 'BELOW_3:1';
    console.log(`${pass}: ${borderName} on ${bgName} = ${ratio.toFixed(2)}:1`);
  }
}
