const fs = require('fs');
const file = 'c:/Users/90551/OneDrive/Masaüstü/İMPECTA/apps/mega-admin/src/app/demo/sample-optic/inventory/InventoryClient.tsx';
let content = fs.readFileSync(file, 'utf8');

const t1 = `              {/* Kâr Miktarı Görüntüleme */}
              {form.salePrice && form.costPrice ? (
                (() => {
                  const profit = (form.salePrice || 0) - (form.costPrice || 0);
                  const margin = (form.costPrice || 0) > 0 ? Math.round((profit / form.costPrice) * 100) : 0;`;

const r1 = `              {/* Kâr Miktarı Görüntüleme */}
              {form.salePrice && form.costPrice ? (
                (() => {
                  const kdvRate = form.kdv || 20;
                  const netSalePrice = (form.salePrice || 0) / (1 + kdvRate / 100);
                  const profit = netSalePrice - (form.costPrice || 0);
                  const margin = (form.costPrice || 0) > 0 ? Math.round((profit / form.costPrice) * 100) : 0;`;

const t2 = `    const kdvPrice = p.salePrice * (1 + (p.kdv||20)/100);
    const netProfit = (p.salePrice || 0) - (p.costPrice || 0);`;

const r2 = `    const kdvRate = p.kdv || 20;
    const netSalePrice = (p.salePrice || 0) / (1 + kdvRate / 100);
    const netProfit = netSalePrice - (p.costPrice || 0);`;

const t3 = `                <div>
                  <p className="text-[10px] font-bold text-indigo-500/80 uppercase mb-1">KDV'li Satış Fiyatı</p>
                  <p className="text-lg font-black text-indigo-700 dark:text-indigo-400">{kdvPrice.toLocaleString("tr-TR")} ₺</p>
                </div>`;

const r3 = `                <div>
                  <p className="text-[10px] font-bold text-indigo-500/80 uppercase mb-1">KDV Hariç Fiyat</p>
                  <p className="text-lg font-black text-indigo-700 dark:text-indigo-400">{netSalePrice.toLocaleString("tr-TR", {maximumFractionDigits:2})} ₺</p>
                </div>`;

if(content.includes(t1)) {
  content = content.replace(t1, r1);
  console.log("Replaced t1");
} else console.log("Failed t1");

if(content.includes(t2)) {
  content = content.replace(t2, r2);
  console.log("Replaced t2");
} else console.log("Failed t2");

if(content.includes(t3)) {
  content = content.replace(t3, r3);
  console.log("Replaced t3");
} else console.log("Failed t3");

fs.writeFileSync(file, content);
console.log("Done");
