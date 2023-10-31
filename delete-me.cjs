const fs = require('fs');
const path = require('path');

const nodeModulesDir = path.join(__dirname, 'node_modules');

function findGypPackages(dir) {
  const subdirs = fs.readdirSync(dir);

  for (const subdir of subdirs) {
    const packageJsonPath = path.join(dir, subdir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (packageJson.gypfile === true) {
        console.log('Package with gypfile:', packageJson.name);
      }
    }
  }
}

findGypPackages(nodeModulesDir);
