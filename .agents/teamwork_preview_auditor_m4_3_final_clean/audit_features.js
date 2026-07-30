const fs = require('fs');
const path = require('path');

const featuresDir = 'C:\\Users\\User\\projects\\ustp\\NTC-EDGE\\apps\\frontend\\internal\\src\\features';
const features = fs.readdirSync(featuresDir);

let results = [];

features.forEach(feat => {
  const featPath = path.join(featuresDir, feat);
  if (!fs.statSync(featPath).isDirectory()) return;

  const subDirs = fs.readdirSync(featPath);
  results.push({
    feature: feat,
    subDirs: subDirs
  });
});

console.log(JSON.stringify(results, null, 2));
