import sys

file_path = "c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/finance/FinanceClient.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the overlay inside the widget card
old_dropdown_code = """                      {/* Metric Dropdown */}
                      {editingWidget === idx && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setEditingWidget(null)} />
                          <div className="absolute top-10 right-3 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-1 min-w-[200px]">"""

new_dropdown_code = """                      {/* Metric Dropdown */}
                      {editingWidget === idx && (
                        <div className="absolute top-10 right-3 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-1 min-w-[200px]">"""
                        
# Add the global overlay before widgets.map
old_widgets_start = """              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {widgets.map((metric, idx) => {"""

new_widgets_start = """              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {editingWidget !== null && (
                  <div className="fixed inset-0 z-[100]" onClick={() => setEditingWidget(null)} />
                )}
                {widgets.map((metric, idx) => {"""

if old_dropdown_code in content and old_widgets_start in content:
    content = content.replace(old_dropdown_code, new_dropdown_code)
    # also remove the closing tag for Fragment in the dropdown
    content = content.replace("""                            </button>
                          ))}
                          </div>
                        </>
                      )""", """                            </button>
                          ))}
                          </div>
                      )""")
    
    content = content.replace(old_widgets_start, new_widgets_start)
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Fixed dropdown click-outside overlay")
else:
    print("String not found!")
