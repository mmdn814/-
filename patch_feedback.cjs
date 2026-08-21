const fs = require('fs');

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Destructuring
  content = content.replace(/onNext,\s*companion\s*}/, 'onNext,\n  companion,\n  mood\n}');
  
  fs.writeFileSync(filePath, content);
}

patchFile('src/components/FeedbackScreen.tsx');
console.log('Patched feedback');
