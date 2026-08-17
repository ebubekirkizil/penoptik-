const fs = require('fs');
const readline = require('readline');
const transcriptPath = 'C:/Users/90551/.gemini/antigravity-ide/brain/0566c12e-ab6b-49f7-8b45-472779eabf60/.system_generated/logs/transcript_full.jsonl';

async function processLineByLine() {
  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let viewFileOutput = '';
  for await (const line of rl) {
    if (line.includes('apps/mini-optik/src/app/admin/page.tsx') && line.includes('Showing lines 1 to 407')) {
      const parsed = JSON.parse(line);
      if (parsed.content) {
        viewFileOutput = parsed.content;
      }
      if (parsed.tool_responses && parsed.tool_responses.length > 0) {
        viewFileOutput = parsed.tool_responses[0].content;
      }
      if (viewFileOutput.includes('The following code has been modified')) break;
    }
  }

  if (viewFileOutput) {
    const lines = viewFileOutput.split('\n');
    let codeLines = [];
    for (let l of lines) {
      if (l.includes('<original_line>')) continue;
      const match = l.match(/^(\d+):\s(.*)$/);
      if (match) {
        codeLines.push(match[2]);
      } else if (l.includes('The above content shows the entire')) {
        break;
      }
    }

    let recoveredContent = codeLines.join('\n');
    
    // Convert from double-encoded UTF-8 to proper UTF-8
    const buf = Buffer.from(recoveredContent, 'latin1');
    recoveredContent = buf.toString('utf8');
    
    // Apply our fix for log.details using template literals to avoid quote issues
    recoveredContent = recoveredContent.replace(
      `                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{log.action}</p>`,
      `                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{typeof log.action === 'object' ? JSON.stringify(log.action) : log.action}</p>`
    );
    recoveredContent = recoveredContent.replace(
      `                      <p className="text-xs text-slate-500 mt-0.5">{log.details || "Detay yok"}</p>`,
      `                      <p className="text-xs text-slate-500 mt-0.5">{log.details ? (typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details)) : "Detay yok"}</p>`
    );

    fs.writeFileSync('apps/mini-optik/src/app/admin/page.tsx', recoveredContent, 'utf8');
    console.log('Successfully recovered and fixed apps/mini-optik/src/app/admin/page.tsx');
  } else {
    console.log('Could not find the view_file output in transcript.');
  }
}

processLineByLine().catch(console.error);
