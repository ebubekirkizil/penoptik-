const fs = require('fs');
const readline = require('readline');
const transcriptPath = 'C:/Users/90551/.gemini/antigravity-ide/brain/0566c12e-ab6b-49f7-8b45-472779eabf60/.system_generated/logs/transcript_full.jsonl';

// Map Windows-1252 characters back to their byte values
const win1252ToByte = {
  '\u20AC': 0x80, '\u201A': 0x82, '\u0192': 0x83, '\u201E': 0x84, '\u2026': 0x85,
  '\u2020': 0x86, '\u2021': 0x87, '\u02C6': 0x88, '\u2030': 0x89, '\u0160': 0x8A,
  '\u2039': 0x8B, '\u0152': 0x8C, '\u017D': 0x8E, '\u2018': 0x91, '\u2019': 0x92,
  '\u201C': 0x93, '\u201D': 0x94, '\u2022': 0x95, '\u2013': 0x96, '\u2014': 0x97,
  '\u02DC': 0x98, '\u2122': 0x99, '\u0161': 0x9A, '\u203A': 0x9B, '\u0153': 0x9C,
  '\u017E': 0x9E, '\u0178': 0x9F
};

function recoverDoubleEncodedString(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (win1252ToByte[char] !== undefined) {
      bytes.push(win1252ToByte[char]);
    } else {
      // For characters 0-255, just take the char code
      bytes.push(char.charCodeAt(0) & 0xFF);
    }
  }
  return Buffer.from(bytes).toString('utf8');
}

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

    let rawString = codeLines.join('\n');
    let recoveredContent = recoverDoubleEncodedString(rawString);
    
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
