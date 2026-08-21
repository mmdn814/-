const fs = require('fs');

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Destructuring
  content = content.replace(/totalSteps,\s+companion\s*}/, 'totalSteps,\n  companion,\n  mood\n}');
  
  // Type definition
  if (!content.includes('mood?: number')) {
    content = content.replace(/companion: string \| null;\s*}/, 'companion: string | null;\n  mood?: number;\n}');
  }
  
  // Component usage
  content = content.replace(/<Companion companion={companion} \/>/g, '<Companion companion={companion} mood={mood} />');
  
  fs.writeFileSync(filePath, content);
}

patchFile('src/components/EventScreen.tsx');
patchFile('src/components/FeedbackScreen.tsx');
console.log('Patched');
