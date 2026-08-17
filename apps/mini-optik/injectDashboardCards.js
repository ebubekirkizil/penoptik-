const fs = require('fs');

let content = fs.readFileSync('src/app/admin/inventory/InventoryClient.tsx', 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

// The code currently has the newCardsCode from previous injection:
const oldCardsCode = 
`                 className="relative group overflow-hidden bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-6 border border-white/60 dark:border-slate-700/50 hover:shadow-2xl hover:border-white/80 dark:hover:border-slate-600 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
              {/* Dekoratif Cam Arkaplan Işıkları */}
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br from-blue-100/50 to-transparent dark:from-blue-900/20 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-gradient-to-tr from-purple-100/50 to-transparent dark:from-purple-900/20 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={\`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm \${stat.bg} \${stat.color} \${stat.border} group-hover:scale-110 transition-transform duration-300\`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold tracking-tight text-slate-700 dark:text-slate-300">{stat.label}</h3>
                </div>
              </div>
              <div className="relative z-10 mt-auto">
                <div className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tighter drop-shadow-sm">{stat.value}</div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 inline-block"></span>
                  {stat.subtitle}
                </p>
              </div>
            </div>`;

const newCardsCode = 
`                 className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group flex flex-col cursor-pointer">
          <div className={\`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br \${stat.bg.replace('bg-', 'from-').replace('/10', '/10').replace('/50', '/50')} to-transparent rounded-bl-full opacity-50 transition-transform group-hover:scale-110\`}></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{stat.label}</h3>
            <div className={\`w-10 h-10 rounded-xl \${stat.bg} \${stat.color} flex items-center justify-center border \${stat.border}\`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
          <p className="relative z-10 text-3xl font-black text-foreground">{stat.value}</p>
          <p className="relative z-10 text-xs font-medium mt-2 flex items-center gap-1 text-slate-500 dark:text-slate-400">
             {stat.subtitle}
          </p>
        </div>`;

if (content.includes(oldCardsCode)) {
  content = content.replace(oldCardsCode, newCardsCode);
  fs.writeFileSync('src/app/admin/inventory/InventoryClient.tsx', content, 'utf8');
  console.log('Cards reverted to dashboard style successfully!');
} else {
  console.log('Could not find the target cards code. Snippet match failed.');
}
