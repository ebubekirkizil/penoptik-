const fs = require('fs');

let content = fs.readFileSync('packages/ui/src/components/SettingsForm.tsx', 'utf8');

// We need to replace `|| ""` with `|| "#HEX"` for all ColorPickers in SettingsForm.tsx.
// Let's just do a generic regex replace for all Rx colors that have `|| ""`

// For Light
content = content.replace(/currentColors\.lightRxUzakBg \|\| ""/g, 'currentColors.lightRxUzakBg || "#EFF6FF"');
content = content.replace(/currentColors\.lightRxUzakBorder \|\| ""/g, 'currentColors.lightRxUzakBorder || "#BFDBFE"');
content = content.replace(/currentColors\.lightRxUzakText \|\| ""/g, 'currentColors.lightRxUzakText || "#1D4ED8"');

content = content.replace(/currentColors\.lightRxYakinBg \|\| ""/g, 'currentColors.lightRxYakinBg || "#FEFBEB"');
content = content.replace(/currentColors\.lightRxYakinBorder \|\| ""/g, 'currentColors.lightRxYakinBorder || "#FDE68A"');
content = content.replace(/currentColors\.lightRxYakinText \|\| ""/g, 'currentColors.lightRxYakinText || "#B45309"');

content = content.replace(/currentColors\.lightRxDaimiBg \|\| ""/g, 'currentColors.lightRxDaimiBg || "#ECFDF5"');
content = content.replace(/currentColors\.lightRxDaimiBorder \|\| ""/g, 'currentColors.lightRxDaimiBorder || "#A7F3D0"');
content = content.replace(/currentColors\.lightRxDaimiText \|\| ""/g, 'currentColors.lightRxDaimiText || "#047857"');

content = content.replace(/currentColors\.lightRxNotesBg \|\| ""/g, 'currentColors.lightRxNotesBg || "#F8FAFC"');
content = content.replace(/currentColors\.lightRxNotesBorder \|\| ""/g, 'currentColors.lightRxNotesBorder || "#E2E8F0"');
content = content.replace(/currentColors\.lightRxNotesText \|\| ""/g, 'currentColors.lightRxNotesText || "#475569"');

content = content.replace(/currentColors\.lightRxPdPhBg \|\| ""/g, 'currentColors.lightRxPdPhBg || "#FFFFFF"');
content = content.replace(/currentColors\.lightRxPdPhBorder \|\| ""/g, 'currentColors.lightRxPdPhBorder || "#E2E8F0"');
content = content.replace(/currentColors\.lightRxPdPhText \|\| ""/g, 'currentColors.lightRxPdPhText || "#0F172A"');

content = content.replace(/currentColors\.lightRxValueBg \|\| ""/g, 'currentColors.lightRxValueBg || "#FFFFFF"');
content = content.replace(/currentColors\.lightRxValueText \|\| ""/g, 'currentColors.lightRxValueText || "#0F172A"');

// For Dark
content = content.replace(/currentColors\.darkRxUzakBg \|\| ""/g, 'currentColors.darkRxUzakBg || "#1E3A8A"');
content = content.replace(/currentColors\.darkRxUzakBorder \|\| ""/g, 'currentColors.darkRxUzakBorder || "#1E40AF"');
content = content.replace(/currentColors\.darkRxUzakText \|\| ""/g, 'currentColors.darkRxUzakText || "#BFDBFE"');

content = content.replace(/currentColors\.darkRxYakinBg \|\| ""/g, 'currentColors.darkRxYakinBg || "#78350F"');
content = content.replace(/currentColors\.darkRxYakinBorder \|\| ""/g, 'currentColors.darkRxYakinBorder || "#92400E"');
content = content.replace(/currentColors\.darkRxYakinText \|\| ""/g, 'currentColors.darkRxYakinText || "#FDE68A"');

content = content.replace(/currentColors\.darkRxDaimiBg \|\| ""/g, 'currentColors.darkRxDaimiBg || "#064E3B"');
content = content.replace(/currentColors\.darkRxDaimiBorder \|\| ""/g, 'currentColors.darkRxDaimiBorder || "#065F46"');
content = content.replace(/currentColors\.darkRxDaimiText \|\| ""/g, 'currentColors.darkRxDaimiText || "#A7F3D0"');

content = content.replace(/currentColors\.darkRxNotesBg \|\| ""/g, 'currentColors.darkRxNotesBg || "#0F172A"');
content = content.replace(/currentColors\.darkRxNotesBorder \|\| ""/g, 'currentColors.darkRxNotesBorder || "#1E293B"');
content = content.replace(/currentColors\.darkRxNotesText \|\| ""/g, 'currentColors.darkRxNotesText || "#CBD5E1"');

content = content.replace(/currentColors\.darkRxPdPhBg \|\| ""/g, 'currentColors.darkRxPdPhBg || "#020617"');
content = content.replace(/currentColors\.darkRxPdPhBorder \|\| ""/g, 'currentColors.darkRxPdPhBorder || "#1E293B"');
content = content.replace(/currentColors\.darkRxPdPhText \|\| ""/g, 'currentColors.darkRxPdPhText || "#F8FAFC"');

content = content.replace(/currentColors\.darkRxValueBg \|\| ""/g, 'currentColors.darkRxValueBg || "#020617"');
content = content.replace(/currentColors\.darkRxValueText \|\| ""/g, 'currentColors.darkRxValueText || "#F8FAFC"');

fs.writeFileSync('packages/ui/src/components/SettingsForm.tsx', content, 'utf8');
console.log("Replaced empty colors successfully.");
