const fs = require('fs');
const path = require('path');

const srcDir = './src';

function getAllFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = getAllFiles(srcDir);
let errorsCount = 0;

files.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.startsWith('import ') && line.includes('from')) {
      const parts = line.split('from');
      const importPart = parts[0].replace('import', '').trim();
      const fromPath = parts[1].trim().replace(/['";]/g, '');

      if (fromPath.startsWith('.')) {
        const resolvedDir = path.dirname(filePath);
        let targetPath = path.resolve(resolvedDir, fromPath);
        if (!fs.existsSync(targetPath)) {
          if (fs.existsSync(targetPath + '.jsx')) targetPath += '.jsx';
          else if (fs.existsSync(targetPath + '.js')) targetPath += '.js';
        }
        if (!fs.existsSync(targetPath)) {
          console.error(`[Line ${idx+1}] MISSING FILE: ${fromPath} in ${filePath}`);
          errorsCount++;
          return;
        }
        const targetContent = fs.readFileSync(targetPath, 'utf8');
        
        // Check default import
        if (!importPart.startsWith('{')) {
          const defaultName = importPart.split(',')[0].trim();
          if (defaultName && !targetContent.includes('export default')) {
            console.error(`[Line ${idx+1}] MISMATCH DEFAULT IMPORT: "${defaultName}" from ${fromPath} in ${filePath}`);
            errorsCount++;
          }
        }
      }
    }
  });
});

console.log(`Audit finished with ${errorsCount} errors.`);
