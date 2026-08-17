import sys

file_path = "c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/finance/FinanceClient.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the parent card z-index
old_card = """return (
                    <div key={idx} className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all">"""

new_card = """return (
                    <div key={idx} className={`bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all ${editingWidget === idx ? 'z-[110]' : 'z-0'}`}>"""

if old_card in content:
    content = content.replace(old_card, new_card)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Fixed card z-index")
else:
    print("Card string not found!")
