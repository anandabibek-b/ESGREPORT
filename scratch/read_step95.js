const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/beher/.gemini/antigravity-ide/brain/d383f857-0afe-441a-ba2d-b77834055521/.system_generated/logs/transcript_full.jsonl')
});

rl.on('line', (line) => {
  if (line.includes('"step_index":95,')) {
    const obj = JSON.parse(line);
    fs.writeFileSync('scratch/original_page_tsx.txt', obj.content);
    console.log('Saved original page.tsx content!');
    process.exit(0);
  }
});
