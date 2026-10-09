const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/beher/.gemini/antigravity-ide/brain/d383f857-0afe-441a-ba2d-b77834055521/.system_generated/logs/transcript_full.jsonl')
});

rl.on('line', (line) => {
  if (line.includes('"step_index":97,')) {
    const obj = JSON.parse(line);
    fs.writeFileSync('scratch/original_top_portal_nav.txt', String(obj.content));
    console.log('Saved TopPortalNavigation from step 97');
  }
  if (line.includes('"step_index":93,')) {
    const obj = JSON.parse(line);
    fs.writeFileSync('scratch/original_dashboard_view.txt', String(obj.content));
    console.log('Saved DashboardView from step 93');
  }
});
