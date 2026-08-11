const fs = require('fs');

const markdown = fs.readFileSync('raw_scored_v4.md', 'utf-8');

const lines = markdown.split('\n');
const events = [];
let currentEvent = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  // Detect event header
  if (line.startsWith('### C-')) {
    const titleMatch = line.match(/### (C-\d+)\s+(.+)/);
    if (titleMatch) {
      if (currentEvent) {
        events.push(currentEvent);
      }
      currentEvent = {
        id: titleMatch[1],
        stage: parseInt(titleMatch[1].split('-')[1], 10) <= 6 ? 1 : 
               parseInt(titleMatch[1].split('-')[1], 10) <= 12 ? 2 :
               parseInt(titleMatch[1].split('-')[1], 10) <= 18 ? 3 : 4,
        title: line.replace('### ', ''),
        description: '',
        options: []
      };
    }
  } 
  // Detect description
  else if (line.startsWith('情境：') && currentEvent) {
    currentEvent.description = line.replace('情境：', '').trim();
  }
  // Detect table rows
  else if (line.startsWith('|') && !line.includes('选项') && !line.includes('---') && currentEvent) {
    const cols = line.split('|').map(c => c.trim()).filter(c => c !== '');
    if (cols.length >= 7) { // Standard length
      let label = cols[1];
      let text = cols[2];
      let reward = cols.length === 9 ? cols[3] : '';
      let cost = cols.length === 9 ? cols[4] : '';
      let tech = parseInt(cols[cols.length - 4], 10);
      let human = parseInt(cols[cols.length - 3], 10);
      let equal = parseInt(cols[cols.length - 2], 10);
      let orthodox = parseInt(cols[cols.length - 1], 10);
      
      currentEvent.options.push({
        id: cols[0],
        label,
        text,
        reward,
        cost,
        tech,
        human,
        equal,
        orthodox
      });
    }
  }
}

if (currentEvent) {
  events.push(currentEvent);
}

const fileContent = `import { GameEvent } from '../types';

export const allEvents: GameEvent[] = ${JSON.stringify(events, null, 2)};
`;

fs.writeFileSync('src/data/events.ts', fileContent);
console.log('Successfully wrote to src/data/events.ts');
