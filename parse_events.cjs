const fs = require('fs');

const raw = fs.readFileSync('raw.txt', 'utf8');

const events = [];
let currentEvent = null;

const lines = raw.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line.startsWith('### C-')) {
    const id = line.split(' ')[1];
    const titleText = line.substring(line.indexOf(' ') + 1);
    
    // figure out stage based on id
    const num = parseInt(id.replace('C-', ''), 10);
    let stage = 1;
    if (num >= 7 && num <= 12) stage = 2;
    if (num >= 13 && num <= 18) stage = 3;
    if (num >= 19 && num <= 24) stage = 4;
    
    currentEvent = {
      id,
      stage,
      title: `档案 ${id} // 异常警报：${titleText.split(' ')[1]}`,
      description: '',
      options: []
    };
    events.push(currentEvent);
  } else if (line.startsWith('情境：') && currentEvent) {
    currentEvent.description = line.replace('情境：', '');
  } else if (line.startsWith('| A ') || line.startsWith('| B ') || line.startsWith('| C ') || line.startsWith('| D ')) {
    const parts = line.split('|').map(s => s.trim()).filter(Boolean);
    if (currentEvent.id === 'C-24') {
        const idLabel = parts[0];
        const id = idLabel.substring(0, 1);
        const label = idLabel.substring(2);
        const text = parts[1] || '';
        currentEvent.options.push({
            id, label, text, reward: '', cost: ''
        });
    } else {
        const idLabel = parts[0];
        const id = idLabel.substring(0, 1);
        const label = idLabel.substring(2);
        const text = parts[1] || '';
        const reward = parts[2] || '';
        const cost = parts[3] || '';
        
        currentEvent.options.push({
          id,
          label,
          text,
          reward,
          cost
        });
    }
  }
}

const output = `import { GameEvent } from '../types';

export const allEvents: GameEvent[] = ${JSON.stringify(events, null, 2)};
`;

fs.writeFileSync('src/data/events.ts', output);
console.log('Successfully wrote to src/data/events.ts');

