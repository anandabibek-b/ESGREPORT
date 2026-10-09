const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/beher/.gemini/antigravity-ide/brain/d383f857-0afe-441a-ba2d-b77834055521/.system_generated/logs/transcript_full.jsonl')
});

rl.on('line', (line) => {
  if (line.includes('"step_index":81,')) {
    const obj = JSON.parse(line);
    fs.writeFileSync('scratch/original_globals_css.txt', String(obj.content));
    console.log('Saved original globals.css from step 81');
  }
  if (line.includes('"step_index":113,')) {
    const obj = JSON.parse(line);
    fs.writeFileSync('scratch/original_theme_context.txt', String(obj.content));
    console.log('Saved original theme context from step 113');
  }
});
