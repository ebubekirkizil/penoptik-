const fs = require('fs');

let content = fs.readFileSync('src/app/admin/inventory/InventoryClient.tsx', 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

const targetCardsCode = 
`                 className="bg-white dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-800/60 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={\`w-8 h-8 rounded-lg flex items-center justify-center border \${stat.bg} \${stat.color} \${stat.border}\`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-[13px] font-bold text-slate-600 dark:text-slate-400">{stat.label}</h3>
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight">{stat.value}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">{stat.subtitle}</p>
              </div>
            </div>`;

const newCardsCode = 
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

if (content.includes(targetCardsCode)) {
  content = content.replace(targetCardsCode, newCardsCode);
  fs.writeFileSync('src/app/admin/inventory/InventoryClient.tsx', content, 'utf8');
  console.log('Cards injected successfully!');
} else {
  console.log('Could not find the target cards code. Snippet match failed.');
}
